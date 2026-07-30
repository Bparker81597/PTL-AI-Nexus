import { describe, expect, it } from "vitest";
import { sampleAssets, sampleEpisodes, sampleProductionContext, sampleProjects, sampleRenderJobs, sampleScenes } from "../data/sampleData";
import {
  continueDestination,
  episodeCompletion,
  missingRequirements,
  nextTaskForScene,
  projectCompletion,
  sceneCompletion,
  unresolvedBlockers,
} from "../utils/productionIntelligence";

describe("production intelligence", () => {
  it("calculates scene, episode, and project progress from stage data", () => {
    const scene = sampleScenes.find((item) => item.id === "scene-clubhouse-meet");
    const episode = sampleEpisodes[0];
    const project = sampleProjects[0];

    expect(scene).toBeDefined();
    if (!scene) return;

    expect(sceneCompletion(scene)).toBeGreaterThan(20);
    expect(episodeCompletion(episode, sampleScenes)).toBeGreaterThan(0);
    expect(projectCompletion(project, sampleScenes)).toBeGreaterThan(0);
  });

  it("detects unresolved blockers and recommends resolving them first", () => {
    const blockedScene = sampleScenes.find((item) => item.id === "scene-first-attempt");
    expect(blockedScene).toBeDefined();
    if (!blockedScene) return;

    const blockers = unresolvedBlockers([blockedScene], sampleEpisodes);
    const nextTask = nextTaskForScene(blockedScene, sampleAssets, sampleRenderJobs);

    expect(blockers.length).toBeGreaterThan(0);
    expect(nextTask.label).toContain("Wonder Block");
    expect(nextTask.module).toBe("projects");
  });

  it("finds missing requirements and routes continue production to the recommended module", () => {
    const scene = sampleScenes.find((item) => item.id === sampleProductionContext.activeSceneId);
    expect(scene).toBeDefined();
    if (!scene) return;

    const missing = missingRequirements(scene, sampleAssets, sampleRenderJobs);
    const destination = continueDestination(sampleProductionContext, sampleScenes, sampleAssets, sampleRenderJobs);

    expect(missing).toContain("Create an animation clip");
    expect(destination).toContain("/projects/");
  });
});
