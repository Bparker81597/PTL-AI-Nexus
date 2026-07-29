import { describe, expect, it, vi } from "vitest";
import { EngineRouter } from "../providers/ai/engineRouter";
import { mockProvider } from "../providers/ai/mockProvider";
import {
  LocalAssetRepository,
  LocalProjectRepository,
  LocalRenderJobRepository,
} from "../repositories/local/localStorageRepository";
import { RenderService } from "../services/renderService";

const createService = () => {
  const jobs = new LocalRenderJobRepository();
  const assets = new LocalAssetRepository();
  const projects = new LocalProjectRepository();
  const router = new EngineRouter([mockProvider]);
  return { service: new RenderService(jobs, assets, projects, router), jobs, assets };
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
      settings: {},
      preferredProvider: "mock",
    });

    await vi.runAllTimersAsync();

    const completed = await jobs.getById(job.id);
    expect(completed?.status).toBe("completed");
    expect(completed?.progress).toBe(100);
    expect((await assets.list()).some((asset) => completed?.outputAssetIds.includes(asset.id))).toBe(true);
    vi.useRealTimers();
  });

  it("retries a failed render job", async () => {
    vi.useFakeTimers();
    const { service, jobs } = createService();

    await service.retryFailedJob("job-failed-voice");
    await vi.runAllTimersAsync();

    const retried = await jobs.getById("job-failed-voice");
    expect(retried?.status).toBe("completed");
    expect(retried?.errorMessage).toBeUndefined();
    vi.useRealTimers();
  });
});
