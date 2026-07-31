/* global Response, URL, fetch */

const corsHeaders = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,DELETE,OPTIONS",
  "access-control-allow-headers": "content-type,authorization",
};

const json = (body, init = {}) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": "application/json",
      ...corsHeaders,
      ...(init.headers ?? {}),
    },
  });

const error = (message, status = 400) => json({ error: message }, { status });

const runPodBaseUrl = (env) => env.RUNPOD_BASE_URL || "https://api.runpod.ai/v2";

const runPodFetch = async (env, path, init = {}) => {
  if (!env.RUNPOD_API_KEY || !env.RUNPOD_ENDPOINT_ID) {
    return error("RunPod gateway is not configured. Set RUNPOD_API_KEY and RUNPOD_ENDPOINT_ID on the backend.", 503);
  }
  const response = await fetch(`${runPodBaseUrl(env)}/${env.RUNPOD_ENDPOINT_ID}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${env.RUNPOD_API_KEY}`,
      ...(init.headers ?? {}),
    },
  });
  if (!response.ok) {
    const message = await response.text();
    return error(message || `RunPod request failed with ${response.status}.`, response.status);
  }
  return response;
};

const findVideoUrl = (value) => {
  if (!value) return undefined;
  if (typeof value === "string" && /^https?:\/\/.+\.(mp4|webm|mov)(\?.*)?$/i.test(value)) return value;
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findVideoUrl(item);
      if (found) return found;
    }
  }
  if (typeof value === "object") {
    for (const key of ["videoUrl", "video_url", "url", "output", "file", "downloadUrl", "download_url"]) {
      const found = findVideoUrl(value[key]);
      if (found) return found;
    }
    for (const item of Object.values(value)) {
      const found = findVideoUrl(item);
      if (found) return found;
    }
  }
  return undefined;
};

const mapStatus = (status) => {
  if (status === "COMPLETED") return "completed";
  if (status === "FAILED" || status === "ERROR") return "failed";
  if (status === "CANCELLED") return "cancelled";
  if (status === "IN_QUEUE") return "queued";
  if (status === "IN_PROGRESS") return "running";
  return "preparing";
};

const normalizeStatus = (jobId, payload) => {
  const status = mapStatus(payload.status);
  const progress =
    typeof payload.progress === "number"
      ? payload.progress
      : status === "completed"
        ? 100
        : status === "running"
          ? 55
          : status === "queued"
            ? 8
            : status === "failed"
              ? 99
              : 20;
  const videoUrl = findVideoUrl(payload.output);
  return {
    providerJobId: jobId,
    status,
    progress,
    estimatedCompletion: status === "completed" ? "Complete" : "Provider processing",
    assets:
      status === "completed" && videoUrl
        ? [
            {
              id: `asset-${jobId}`,
              name: "Live DreamFrame video",
              type: "video",
              url: videoUrl,
              providerId: "live-video-gateway",
              createdAt: new Date().toISOString(),
              isMock: false,
              metadata: { live: true, providerJobId: jobId, rawProvider: "runpod" },
            },
          ]
        : [],
    errorMessage: payload.error || payload.errorMessage,
    metadata: { rawProvider: "runpod", videoUrl },
  };
};

const submitVideoGeneration = async (request, env) => {
  const body = await request.json();
  const providerResponse = await runPodFetch(env, "/run", {
    method: "POST",
    body: JSON.stringify({
      input: {
        generationType: body.generationType,
        prompt: body.prompt,
        negativePrompt: body.negativePrompt,
        sourceAssetIds: body.sourceAssetIds,
        characterIds: body.characterIds,
        settings: body.settings,
      },
    }),
  });
  if (providerResponse instanceof Response && !providerResponse.ok) return providerResponse;
  const payload = await providerResponse.json();
  const providerJobId = payload.id;
  if (!providerJobId) return error("RunPod did not return a job id.", 502);
  return json({
    providerJobId,
    status: "queued",
    progress: 1,
    estimatedCompletion: "Submitted to live provider",
    metadata: { rawProvider: "runpod" },
  });
};

const getVideoGeneration = async (providerJobId, env) => {
  const providerResponse = await runPodFetch(env, `/status/${providerJobId}`);
  if (providerResponse instanceof Response && !providerResponse.ok) return providerResponse;
  const payload = await providerResponse.json();
  return json(normalizeStatus(providerJobId, payload));
};

const cancelVideoGeneration = async (providerJobId, env) => {
  const providerResponse = await runPodFetch(env, `/cancel/${providerJobId}`, { method: "POST" });
  if (providerResponse instanceof Response && !providerResponse.ok) return providerResponse;
  return json({ ok: true });
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
    const url = new URL(request.url);
    if (url.pathname === "/api/generation/video" && request.method === "POST") {
      return submitVideoGeneration(request, env);
    }
    const match = url.pathname.match(/^\/api\/generation\/video\/([^/]+)$/);
    if (match && request.method === "GET") return getVideoGeneration(match[1], env);
    if (match && request.method === "DELETE") return cancelVideoGeneration(match[1], env);
    return error("Route not found.", 404);
  },
};
