import { describe, expect, it } from "vitest";
import {
  LocalCharacterRepository,
  LocalProjectRepository,
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
});
