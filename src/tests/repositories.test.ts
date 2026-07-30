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
      characterIds: ["char-brooklyn"],
    });
    const firstScene = (await repository.list()).find((item) => item.id === scene.id);
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
    const brooklyn = await repository.getById("char-brooklyn");
    expect(brooklyn).toBeDefined();
    if (!brooklyn) return;

    await repository.update({ ...brooklyn, description: "Persisted Brooklyn edit" });
    const refreshed = await new LocalCharacterRepository().getById("char-brooklyn");

    expect(refreshed?.description).toBe("Persisted Brooklyn edit");
  });

  it("hydrates Character Bible fields for existing characters", async () => {
    const repository = new LocalCharacterRepository();
    const brooklyn = await repository.getById("char-brooklyn");

    expect(brooklyn?.role).toBe("The Creator");
    expect(brooklyn?.biography).toContain("PTL Crew");
    expect(brooklyn?.speakingStyle).toContain("imaginative");
    expect(brooklyn?.projects).toContain("project-monster-truck");
  });
});
