import type { AssetRepository, ProjectRepository, RenderJobRepository, SceneRepository } from "../repositories/contracts";
import type { GenerationRequest, RenderJob } from "../types/domain";
import { createId, nowIso } from "../utils/ids";
import type { EngineRouter } from "../providers/ai/engineRouter";

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export class RenderService {
  constructor(
    private readonly jobs: RenderJobRepository,
    private readonly assets: AssetRepository,
    private readonly projects: ProjectRepository,
    private readonly scenes: SceneRepository,
    private readonly router: EngineRouter,
  ) {}

  async startGeneration(request: GenerationRequest): Promise<RenderJob> {
    const provider = this.router.selectProvider({
      generationType: request.generationType,
      capability: request.generationType,
      preferredProvider: request.preferredProvider,
    });
    const project = request.projectId ? await this.projects.getById(request.projectId) : undefined;
    const job: RenderJob = {
      id: createId("job"),
      name: request.prompt.slice(0, 52) || `${request.generationType} generation`,
      projectId: request.projectId,
      projectName: project?.name,
      generationType: request.generationType,
      providerId: provider.id,
      status: "queued",
      progress: 0,
      createdAt: nowIso(),
      estimatedCompletion: "Starting",
      outputAssetIds: [],
      request,
      sourceAssetIds: request.sourceAssetIds,
      sceneId: this.getSceneId(request),
      seasonId: this.getStringSetting(request, "seasonId"),
      episodeId: this.getStringSetting(request, "episodeId"),
      locationId: this.getStringSetting(request, "locationId"),
    };

    await this.jobs.create(job);
    void this.progressJob(job.id);
    return job;
  }

  async progressJob(jobId: string, delayMs = 220): Promise<RenderJob> {
    const original = await this.jobs.getById(jobId);
    if (!original) throw new Error(`Render job ${jobId} was not found.`);

    let job = await this.jobs.update({ ...original, status: "preparing", progress: 12, updatedAt: nowIso() });
    await this.markSceneRendering(job);
    await wait(delayMs);
    job = await this.stopIfCancelled(job.id);
    if (job.status === "cancelled") return job;
    job = await this.jobs.update({ ...job, status: "running", progress: 38, estimatedCompletion: "Less than 1 min", updatedAt: nowIso() });
    await wait(delayMs);
    job = await this.stopIfCancelled(job.id);
    if (job.status === "cancelled") return job;
    job = await this.jobs.update({ ...job, progress: 72, updatedAt: nowIso() });
    await wait(delayMs);
    job = await this.stopIfCancelled(job.id);
    if (job.status === "cancelled") return job;

    const provider = this.router.selectProvider({
      generationType: job.request.generationType,
      capability: job.request.generationType,
      preferredProvider: job.providerId,
    });
    const result = await provider.generate(job.request);
    const sceneId = this.getSceneId(job.request);
    const savedAssets = await Promise.all(
      result.assets.map((asset) =>
        this.assets.create({
          ...asset,
          projectId: job.projectId,
          sceneId,
          characterIds: job.request.characterIds,
          isMock: true,
          metadata: {
            ...asset.metadata,
            simulated: true,
            generationType: job.generationType,
            sceneId,
            seasonId: job.seasonId,
            episodeId: job.episodeId,
            locationId: job.locationId,
          },
          seasonId: job.seasonId,
          episodeId: job.episodeId,
          locationId: job.locationId,
        }),
      ),
    );
    const updatedProject = job.projectId ? await this.projects.getById(job.projectId) : undefined;

    if (updatedProject) {
      await this.projects.update({
        ...updatedProject,
        status: "active",
        assetIds: [...new Set([...updatedProject.assetIds, ...savedAssets.map((asset) => asset.id)])],
      });
    }

    if (sceneId) {
      const scene = await this.scenes.getById(sceneId);
      const primaryAsset = savedAssets[0];
      if (scene && primaryAsset) {
        await this.scenes.update({
          ...scene,
          sourceImageAssetId:
            job.generationType === "image" ? primaryAsset.id : scene.sourceImageAssetId,
          outputVideoAssetId:
            job.generationType === "image-to-video" || job.generationType === "text-to-video"
              ? primaryAsset.id
              : scene.outputVideoAssetId,
          status:
            job.generationType === "image-to-video" || job.generationType === "text-to-video"
              ? "completed"
              : "image-ready",
        });
      }
    }

    return this.jobs.update({
      ...job,
      status: "completed",
      progress: 100,
      updatedAt: nowIso(),
      estimatedCompletion: "Complete",
      outputAssetIds: savedAssets.map((asset) => asset.id),
    });
  }

  async retryFailedJob(jobId: string): Promise<RenderJob> {
    const job = await this.jobs.getById(jobId);
    if (!job) throw new Error(`Render job ${jobId} was not found.`);
    if (job.status !== "failed" && job.status !== "cancelled") {
      throw new Error("Only failed or cancelled jobs can be retried.");
    }
    const retried = await this.jobs.update({
      ...job,
      status: "queued",
      progress: 0,
      errorMessage: undefined,
      cancelledAt: undefined,
      updatedAt: nowIso(),
      estimatedCompletion: "Retry queued",
    });
    void this.progressJob(retried.id);
    return retried;
  }

  async cancelJob(jobId: string): Promise<RenderJob> {
    const job = await this.jobs.getById(jobId);
    if (!job) throw new Error(`Render job ${jobId} was not found.`);
    return this.jobs.update({
      ...job,
      status: "cancelled",
      progress: Math.min(job.progress, 99),
      cancelledAt: nowIso(),
      updatedAt: nowIso(),
      estimatedCompletion: "Cancelled",
    });
  }

  private getSceneId(request: GenerationRequest): string | undefined {
    const sceneId = request.settings.sceneId;
    return typeof sceneId === "string" ? sceneId : undefined;
  }

  private getStringSetting(request: GenerationRequest, key: string): string | undefined {
    const value = request.settings[key];
    return typeof value === "string" ? value : undefined;
  }

  private async stopIfCancelled(jobId: string): Promise<RenderJob> {
    const latest = await this.jobs.getById(jobId);
    if (!latest) throw new Error(`Render job ${jobId} was not found.`);
    if (latest.status === "cancelled") {
      return latest;
    }
    return latest;
  }

  private async markSceneRendering(job: RenderJob): Promise<void> {
    if (!job.sceneId || (job.generationType !== "image-to-video" && job.generationType !== "text-to-video")) {
      return;
    }
    const scene = await this.scenes.getById(job.sceneId);
    if (scene) {
      await this.scenes.update({ ...scene, status: "rendering" });
    }
  }
}
