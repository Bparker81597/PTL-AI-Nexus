import type { Asset, GenerationRequest, GenerationResult } from "../../types/domain";
import { createId, nowIso } from "../../utils/ids";
import type { AIProvider, LiveGenerationStatus, LiveGenerationSubmission } from "./types";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ?? "";
const configured = apiBaseUrl.length > 0;

async function gatewayFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (!configured) {
    throw new Error("Live video gateway is not configured. Set VITE_API_BASE_URL to your secure backend gateway.");
  }
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Gateway request failed with ${response.status}.`);
  }
  return response.json() as Promise<T>;
}

function normalizeAssets(request: GenerationRequest, status: LiveGenerationStatus): Asset[] {
  if (status.assets?.length) {
    return status.assets.map((asset) => ({
      ...asset,
      id: asset.id || createId("asset"),
      type: "video",
      providerId: liveVideoGatewayProvider.id,
      createdAt: asset.createdAt || nowIso(),
      isMock: false,
      metadata: {
        ...asset.metadata,
        live: true,
        providerJobId: status.providerJobId,
        generationType: request.generationType,
      },
    }));
  }

  const videoUrl = typeof status.metadata?.videoUrl === "string" ? status.metadata.videoUrl : undefined;
  if (!videoUrl) return [];

  return [
    {
      id: createId("asset"),
      name: `${request.generationType} live result`,
      type: "video",
      url: videoUrl,
      projectId: request.projectId,
      characterIds: request.characterIds,
      providerId: liveVideoGatewayProvider.id,
      createdAt: nowIso(),
      dimensions: typeof request.settings.resolution === "string" ? request.settings.resolution : undefined,
      duration: typeof request.settings.duration === "number" ? request.settings.duration : undefined,
      isMock: false,
      metadata: {
        live: true,
        providerJobId: status.providerJobId,
        generationType: request.generationType,
        prompt: request.prompt,
      },
    },
  ];
}

export const liveVideoGatewayProvider: AIProvider = {
  id: "live-video-gateway",
  name: "Live Video Gateway",
  type: "video",
  mode: "live",
  status: configured ? "connected" : "disconnected",
  capabilities: ["image-to-video", "text-to-video"],
  submitGeneration(request: GenerationRequest): Promise<LiveGenerationSubmission> {
    return gatewayFetch<LiveGenerationSubmission>("/api/generation/video", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },
  getGenerationStatus(providerJobId: string): Promise<LiveGenerationStatus> {
    return gatewayFetch<LiveGenerationStatus>(`/api/generation/video/${encodeURIComponent(providerJobId)}`);
  },
  async cancelGeneration(providerJobId: string): Promise<void> {
    await gatewayFetch<{ ok: boolean }>(`/api/generation/video/${encodeURIComponent(providerJobId)}`, {
      method: "DELETE",
    });
  },
  async generate(request: GenerationRequest): Promise<GenerationResult> {
    const submission = await this.submitGeneration?.(request);
    if (!submission) throw new Error("Live gateway submit handler is unavailable.");
    let status: LiveGenerationStatus = { ...submission };
    for (let attempt = 0; attempt < 120; attempt += 1) {
      status = await this.getGenerationStatus?.(submission.providerJobId) ?? status;
      if (status.status === "completed" || status.status === "failed" || status.status === "cancelled") break;
      await new Promise((resolve) => window.setTimeout(resolve, 1500));
    }
    if (status.status !== "completed") {
      throw new Error(status.errorMessage || `Live generation ended with status ${status.status}.`);
    }
    const assets = normalizeAssets(request, status);
    if (!assets.length) {
      throw new Error("Live generation completed but no playable video asset was returned.");
    }
    return {
      requestId: request.id,
      jobId: status.providerJobId,
      status: "completed",
      assets,
      providerId: this.id,
      metadata: status.metadata,
    };
  },
};
