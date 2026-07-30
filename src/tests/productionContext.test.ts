import { describe, expect, it } from "vitest";
import { useClusterStore } from "../app/useClusterStore";

describe("production context store", () => {
  it("restores seeded PTL Crew production context", async () => {
    await useClusterStore.getState().load();

    const context = useClusterStore.getState().productionContext;
    expect(context.activeProjectId).toBe("project-monster-truck");
    expect(context.activeSeasonId).toBe("season-ptl-crew-1");
    expect(context.activeEpisodeId).toBe("episode-ptl-crew-s1e1");
  });

  it("changing active scene derives characters, location, episode, and phase", async () => {
    await useClusterStore.getState().load();

    useClusterStore.getState().setActiveScene("scene-first-attempt");
    const context = useClusterStore.getState().productionContext;

    expect(context.activeSceneId).toBe("scene-first-attempt");
    expect(context.activeEpisodeId).toBe("episode-ptl-crew-s1e1");
    expect(context.activeLocationId).toBe("loc-wonder-block");
    expect(context.activeCharacterIds).toEqual(["char-brooklyn", "char-maddie", "char-layla", "char-maize"]);
    expect(context.productionPhase).toBe("writing");
  });

  it("changing project clears invalid child selections", async () => {
    await useClusterStore.getState().load();
    const project = await useClusterStore.getState().createProject({ name: "Context Test Project", type: "mixed" });

    useClusterStore.getState().setActiveProject(project.id);
    const context = useClusterStore.getState().productionContext;

    expect(context.activeProjectId).toBe(project.id);
    expect(context.activeSceneId).toBeUndefined();
    expect(context.activeCharacterIds).toEqual([]);
  });
});
