import { describe, expect, it, vi } from "vitest";
import { EngineRouter } from "../providers/ai/engineRouter";
import { mockProvider } from "../providers/ai/mockProvider";
import {
  LocalAssetRepository,
  LocalProjectRepository,
  LocalRenderJobRepository,
  LocalSceneRepository,
} from "../repositories/local/localStorageRepository";
import { RenderService } from "../services/renderService";

const createService = () => {
  const jobs = new LocalRenderJobRepository();
  const assets = new LocalAssetRepository();
  const projects = new LocalProjectRepository();
  const scenes = new LocalSceneRepository();
  const router = new EngineRouter([mockProvider]);
  return { service: new RenderService(jobs, assets, projects, scenes, router), jobs, assets, scenes };
};

describe("RenderService", () => {
  it("progresses a mock render job to completion and saves an asset", async () => {
    vi.useFakeTimers();
    const { service, jobs, assets } = createService();

    const job = await service.startGeneration({
      id: "request-test",
      projectId: "project-monster-truck",
      generationType: "image",
      prompt: "Generate a test concept",
      characterIds: ["char-brooklyn", "char-maddie"],
      settings: { sceneId: "scene-wonder-question" },
      preferredProvider: "mock",
    });

    await vi.runAllTimersAsync();

    const completed = await jobs.getById(job.id);
    expect(completed?.status).toBe("completed");
    expect(completed?.progress).toBe(100);
    expect((await assets.list()).some((asset) => completed?.outputAssetIds.includes(asset.id))).toBe(true);
  });

  it("associates a generated image with a scene", async () => {
    vi.useFakeTimers();
    const { service, jobs, scenes } = createService();

    const job = await service.startGeneration({
      id: "request-scene-image",
      projectId: "project-monster-truck",
      generationType: "image",
      prompt: "Generate a scene image",
      characterIds: ["char-brooklyn", "char-maddie"],
      settings: { sceneId: "scene-wonder-question" },
      preferredProvider: "mock",
    });
    await vi.runAllTimersAsync();

    const completed = await jobs.getById(job.id);
    const scene = await scenes.getById("scene-wonder-question");
    expect(scene?.sourceImageAssetId).toBe(completed?.outputAssetIds[0]);
    expect(scene?.status).toBe("image-ready");
  });

  it("creates a video render job and completes the mock clip lifecycle", async () => {
    vi.useFakeTimers();
    const { service, jobs, scenes, assets } = createService();

    const job = await service.startGeneration({
      id: "request-video",
      projectId: "project-monster-truck",
      generationType: "image-to-video",
      prompt: "Animate scene",
      sourceAssetIds: ["asset-crew-clubhouse-concept"],
      characterIds: ["char-brooklyn", "char-maddie", "char-layla", "char-maize"],
      settings: { sceneId: "scene-clubhouse-meet", duration: 5 },
      preferredProvider: "mock",
    });
    await vi.runAllTimersAsync();

    const completed = await jobs.getById(job.id);
    const scene = await scenes.getById("scene-clubhouse-meet");
    const clip = completed?.outputAssetIds[0] ? await assets.getById(completed.outputAssetIds[0]) : undefined;
    expect(completed?.status).toBe("completed");
    expect(clip?.type).toBe("video");
    expect(scene?.outputVideoAssetId).toBe(clip?.id);
    expect(scene?.status).toBe("completed");
  });

  it("cancels a clip job without completing it", async () => {
    vi.useFakeTimers();
    const { service, jobs } = createService();

    const job = await service.startGeneration({
      id: "request-cancel",
      projectId: "project-monster-truck",
      generationType: "image-to-video",
      prompt: "Cancel this clip",
      sourceAssetIds: ["asset-crew-clubhouse-concept"],
      settings: { sceneId: "scene-clubhouse-meet" },
      preferredProvider: "mock",
    });
    await service.cancelJob(job.id);
    await vi.runAllTimersAsync();

    const cancelled = await jobs.getById(job.id);
    expect(cancelled?.status).toBe("cancelled");
    expect(cancelled?.outputAssetIds).toHaveLength(0);
  });

  it("retries a failed clip render job", async () => {
    vi.useFakeTimers();
    const { service, jobs } = createService();

    await service.retryFailedJob("job-first-attempt-failed");
    await vi.runAllTimersAsync();

    const retried = await jobs.getById("job-first-attempt-failed");
    expect(retried?.status).toBe("completed");
    expect(retried?.errorMessage).toBeUndefined();
  });
});
