import type { AssetRepository, ProjectRepository, RenderJobRepository } from "../repositories/contracts";
import type { GenerationRequest, RenderJob } from "../types/domain";
import { createId, nowIso } from "../utils/ids";
import type { EngineRouter } from "../providers/ai/engineRouter";

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export class RenderService {
  constructor(
    private readonly jobs: RenderJobRepository,
    private readonly assets: AssetRepository,
    private readonly projects: ProjectRepository,
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
    };

    await this.jobs.create(job);
    void this.progressJob(job.id);
    return job;
  }

  async progressJob(jobId: string, delayMs = 220): Promise<RenderJob> {
    const original = await this.jobs.getById(jobId);
    if (!original) throw new Error(`Render job ${jobId} was not found.`);

    let job = await this.jobs.update({ ...original, status: "preparing", progress: 12 });
    await wait(delayMs);
    job = await this.jobs.update({ ...job, status: "running", progress: 38, estimatedCompletion: "Less than 1 min" });
    await wait(delayMs);
    job = await this.jobs.update({ ...job, progress: 72 });
    await wait(delayMs);

    const provider = this.router.selectProvider({
      generationType: job.request.generationType,
      capability: job.request.generationType,
      preferredProvider: job.providerId,
    });
    const result = await provider.generate(job.request);
    const savedAssets = await Promise.all(result.assets.map((asset) => this.assets.create(asset)));
    const updatedProject = job.projectId ? await this.projects.getById(job.projectId) : undefined;

    if (updatedProject) {
      await this.projects.update({
        ...updatedProject,
        status: "active",
        assetIds: [...new Set([...updatedProject.assetIds, ...savedAssets.map((asset) => asset.id)])],
      });
    }

    return this.jobs.update({
      ...job,
      status: "completed",
      progress: 100,
      estimatedCompletion: "Complete",
      outputAssetIds: savedAssets.map((asset) => asset.id),
    });
  }

  async retryFailedJob(jobId: string): Promise<RenderJob> {
    const job = await this.jobs.getById(jobId);
    if (!job) throw new Error(`Render job ${jobId} was not found.`);
    if (job.status !== "failed") throw new Error("Only failed jobs can be retried.");
    const retried = await this.jobs.update({
      ...job,
      status: "queued",
      progress: 0,
      errorMessage: undefined,
      estimatedCompletion: "Retry queued",
    });
    void this.progressJob(retried.id);
    return retried;
  }
}
