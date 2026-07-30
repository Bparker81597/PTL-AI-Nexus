import type {
  Asset,
  Episode,
  ProductionBlocker,
  ProductionContext,
  Project,
  RenderJob,
  Scene,
  SceneStageProgress,
  SceneStageState,
} from "../types/domain";

const stageLabels: Record<keyof SceneStageProgress, string> = {
  story: "Story",
  storyboard: "Storyboard",
  visualAssets: "Visual Assets",
  animation: "Animation",
  voice: "Voice",
  music: "Music",
  soundEffects: "Sound Effects",
  finalRender: "Final Render",
  review: "Review",
};

const stagePriority: Array<keyof SceneStageProgress> = [
  "story",
  "storyboard",
  "visualAssets",
  "animation",
  "voice",
  "music",
  "soundEffects",
  "finalRender",
  "review",
];

export const defaultStageProgress = (): SceneStageProgress => ({
  story: "not-started",
  storyboard: "not-started",
  visualAssets: "not-started",
  animation: "not-started",
  voice: "not-started",
  music: "not-started",
  soundEffects: "not-started",
  finalRender: "not-started",
  review: "not-started",
});

export const completedStageStates: SceneStageState[] = ["completed", "approved"];

export function getSceneStageProgress(scene: Scene): SceneStageProgress {
  return { ...defaultStageProgress(), ...(scene.stageProgress ?? {}) };
}

export function sceneCompletion(scene: Scene): number {
  const progress = getSceneStageProgress(scene);
  const completed = Object.values(progress).filter((state) => completedStageStates.includes(state)).length;
  return Math.round((completed / Object.keys(progress).length) * 100);
}

export function episodeCompletion(episode: Episode, scenes: Scene[]): number {
  const episodeScenes = scenes.filter((scene) => episode.sceneIds.includes(scene.id));
  if (!episodeScenes.length) return 0;
  return Math.round(episodeScenes.reduce((total, scene) => total + sceneCompletion(scene), 0) / episodeScenes.length);
}

export function projectCompletion(project: Project, scenes: Scene[]): number {
  const projectScenes = scenes.filter((scene) => scene.projectId === project.id);
  if (!projectScenes.length) return 0;
  return Math.round(projectScenes.reduce((total, scene) => total + sceneCompletion(scene), 0) / projectScenes.length);
}

export function unresolvedBlockers(scenes: Scene[], episodes: Episode[] = []): ProductionBlocker[] {
  return [
    ...episodes.flatMap((episode) => episode.blockers ?? []),
    ...scenes.flatMap((scene) => scene.blockers ?? []),
  ].filter((blocker) => !blocker.resolved);
}

export function missingRequirements(scene: Scene, assets: Asset[], jobs: RenderJob[]): string[] {
  const missing: string[] = [];
  const progress = getSceneStageProgress(scene);
  const sceneAssets = assets.filter((asset) => asset.sceneId === scene.id);
  const sceneJobs = jobs.filter((job) => job.sceneId === scene.id);
  if (!scene.characterIds.length) missing.push("Assign missing characters");
  if (!scene.locationId && !scene.location) missing.push("Select a location");
  if (progress.story !== "completed" && progress.story !== "approved") missing.push("Finish the scene outline");
  if (progress.storyboard === "not-started" || progress.storyboard === "blocked") missing.push("Complete storyboard frames");
  if (!sceneAssets.some((asset) => asset.type === "generated-image" || asset.type === "storyboard")) missing.push("Generate a missing visual asset");
  if (!sceneAssets.some((asset) => asset.type === "video") && progress.animation !== "completed") missing.push("Create an animation clip");
  if (!sceneAssets.some((asset) => asset.type === "audio") && progress.voice !== "completed") missing.push("Record or generate dialogue");
  if (sceneJobs.some((job) => job.status === "failed")) missing.push("Resolve a failed render");
  return missing;
}

export function nextTaskForScene(scene: Scene, assets: Asset[] = [], jobs: RenderJob[] = []): { label: string; stage: keyof SceneStageProgress; module: "projects" | "canvas" | "dreamframe" | "novatone" | "render-queue" } {
  const blockers = (scene.blockers ?? []).filter((blocker) => !blocker.resolved);
  if (blockers.length) {
    return { label: blockers[0].message, stage: "storyboard", module: "projects" };
  }
  const progress = getSceneStageProgress(scene);
  const sceneAssets = assets.filter((asset) => asset.sceneId === scene.id);
  const failedRender = jobs.find((job) => job.sceneId === scene.id && job.status === "failed");
  if (failedRender) return { label: "Resolve failed render", stage: "finalRender", module: "render-queue" };

  for (const stage of stagePriority) {
    const state = progress[stage];
    if (!completedStageStates.includes(state)) {
      if (stage === "visualAssets" || stage === "storyboard") {
        const hasSceneVisuals = sceneAssets.some((asset) => asset.type === "generated-image" || asset.type === "storyboard");
        return { label: stage === "storyboard" ? "Complete storyboard frames" : hasSceneVisuals ? "Review connected visual assets" : "Generate missing visual assets", stage, module: "canvas" };
      }
      if (stage === "animation") return { label: "Create an animation clip", stage, module: "dreamframe" };
      if (stage === "voice" || stage === "music" || stage === "soundEffects") return { label: `Complete ${stageLabels[stage].toLowerCase()}`, stage, module: "novatone" };
      if (stage === "finalRender") return { label: "Render the scene for review", stage, module: "render-queue" };
      if (stage === "review") return { label: "Review and approve the scene", stage, module: "projects" };
      return { label: `Complete ${stageLabels[stage].toLowerCase()}`, stage, module: "projects" };
    }
  }
  return { label: "Scene complete. Review next scene.", stage: "review", module: "projects" };
}

export function continueDestination(context: ProductionContext, scenes: Scene[], assets: Asset[] = [], jobs: RenderJob[] = []): string {
  const scene = scenes.find((item) => item.id === context.activeSceneId) ?? scenes.find((item) => item.projectId === context.activeProjectId);
  if (!scene || !context.activeProjectId) return "/projects";
  const next = nextTaskForScene(scene, assets, jobs);
  if (next.module === "canvas") return `/canvas?projectId=${context.activeProjectId}&sceneId=${scene.id}`;
  if (next.module === "dreamframe") return `/dreamframe?projectId=${context.activeProjectId}&sceneId=${scene.id}`;
  if (next.module === "novatone") return `/novatone?projectId=${context.activeProjectId}&sceneId=${scene.id}`;
  if (next.module === "render-queue") return `/render-queue?projectId=${context.activeProjectId}&sceneId=${scene.id}`;
  return `/projects/${context.activeProjectId}/episodes/${scene.episodeId ?? ""}/scenes/${scene.id}`;
}

export function recentCompletions(scenes: Scene[], assets: Asset[], jobs: RenderJob[]): string[] {
  const completions = [
    ...scenes.filter((scene) => scene.approvalState === "approved" || scene.status === "completed").map((scene) => `${scene.title} approved or completed`),
    ...assets.filter((asset) => asset.projectId && asset.isMock).slice(0, 3).map((asset) => `${asset.name} added`),
    ...jobs.filter((job) => job.status === "completed").slice(0, 3).map((job) => `${job.name} completed`),
  ];
  return completions.slice(0, 5);
}

export const productionStageLabels = stageLabels;
