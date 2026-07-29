import { describe, expect, it } from "vitest";
import {
  LocalCharacterRepository,
  LocalProjectRepository,
  LocalSceneRepository,
} from "../repositories/local/localStorageRepository";

describe("local repositories", () => {
  it("creates a character", async () => {
    const repository = new LocalCharacterRepository();

    const character = await repository.create({
      name: "Test Creator",
      description: "A reusable test character.",
      visualStyle: "Clean 3D",
      consistencyPrompt: "Keep the same face, outfit, and colors.",
    });

    expect(character.id).toContain("char");
    expect((await repository.list()).some((item) => item.id === character.id)).toBe(true);
  });

  it("creates a project", async () => {
    const repository = new LocalProjectRepository();

    const project = await repository.create({
      name: "Render Lab",
      description: "Workflow test project",
      type: "mixed",
    });

    expect(project.status).toBe("draft");
    expect((await repository.list()).some((item) => item.name === "Render Lab")).toBe(true);
  });

  it("creates and reorders scenes", async () => {
    const repository = new LocalSceneRepository();

    const scene = await repository.createFromInput({
      projectId: "project-monster-truck",
      title: "Test Scene",
      description: "A local workflow test scene.",
      characterIds: ["char-eric"],
    });
    const firstScene = (await repository.list()).find((item) => item.id === "scene-stadium-arrival");
    expect(scene.title).toBe("Test Scene");
    expect(firstScene).toBeDefined();

    if (firstScene) {
      await repository.update({ ...firstScene, order: 9 });
      const persisted = await new LocalSceneRepository().getById(firstScene.id);
      expect(persisted?.order).toBe(9);
    }
  });

  it("persists character edits after repository refresh", async () => {
    const repository = new LocalCharacterRepository();
    const eric = await repository.getById("char-eric");
    expect(eric).toBeDefined();
    if (!eric) return;

    await repository.update({ ...eric, description: "Persisted Eric edit" });
    const refreshed = await new LocalCharacterRepository().getById("char-eric");

    expect(refreshed?.description).toBe("Persisted Eric edit");
  });
});
