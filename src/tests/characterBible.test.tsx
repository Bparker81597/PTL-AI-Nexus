import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { App } from "../app/App";
import { useClusterStore } from "../app/useClusterStore";
import { sampleAssets, sampleCharacters, sampleEpisodes, sampleRenderJobs, sampleScenes } from "../data/sampleData";
import { assetsForCharacter, episodesForCharacter, scenesForCharacter } from "../utils/characterSelectors";
import { calculateCharacterReadiness } from "../utils/characterReadiness";

const renderRoute = (route: string) =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  );

describe("Character Bible foundation", () => {
  it("loads a character by stable ID and shows a focused bible", async () => {
    renderRoute("/characters/char-brooklyn");

    expect(await screen.findByRole("heading", { level: 1, name: "Brooklyn Character Bible" })).toBeInTheDocument();
    expect(screen.getByText("Brooklyn production summary")).toBeInTheDocument();
    expect(screen.queryByText("Maddie helps the crew understand challenges")).not.toBeInTheDocument();
  });

  it("shows not-found state for an invalid character route", async () => {
    renderRoute("/characters/not-a-real-character");

    expect(await screen.findByText("Character not found")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to Character Studio" })).toBeInTheDocument();
  });

  it("preserves active scene context and sets the opened character active", async () => {
    await useClusterStore.getState().load();
    useClusterStore.getState().setActiveScene("scene-wonder-question");

    renderRoute("/characters/char-maddie");

    expect(await screen.findByText("Return to Scene")).toBeInTheDocument();
    await waitFor(() => {
      const context = useClusterStore.getState().productionContext;
      expect(context.activeSceneId).toBe("scene-wonder-question");
      expect(context.activeCharacterIds).toContain("char-maddie");
    });
  });

  it("filters character assets, scenes, and episodes by selected character", () => {
    expect(assetsForCharacter("char-brooklyn", sampleAssets).every((asset) => asset.characterId === "char-brooklyn" || asset.characterIds?.includes("char-brooklyn"))).toBe(true);
    expect(scenesForCharacter("char-brooklyn", sampleScenes)).toHaveLength(4);
    expect(episodesForCharacter("char-brooklyn", sampleEpisodes, sampleScenes).map((episode) => episode.id)).toEqual(["episode-ptl-crew-s1e1"]);
  });

  it("calculates varied readiness and missing category recommendations", () => {
    const brooklyn = sampleCharacters.find((character) => character.id === "char-brooklyn");
    const maize = sampleCharacters.find((character) => character.id === "char-maize");
    expect(brooklyn).toBeDefined();
    expect(maize).toBeDefined();
    if (!brooklyn || !maize) return;

    const brooklynReadiness = calculateCharacterReadiness(brooklyn, sampleAssets, sampleScenes, sampleEpisodes, sampleRenderJobs);
    const maizeReadiness = calculateCharacterReadiness(maize, sampleAssets, sampleScenes, sampleEpisodes, sampleRenderJobs);

    expect(brooklynReadiness.percentage).toBeGreaterThan(maizeReadiness.percentage);
    expect(maizeReadiness.nextTask).toMatch(/Complete|Resolve|Review/);
  });

  it("keeps flagship bibles visually and narratively distinct", () => {
    const brooklyn = sampleCharacters.find((character) => character.id === "char-brooklyn");
    const maize = sampleCharacters.find((character) => character.id === "char-maize");
    expect(brooklyn?.heroImage).not.toBe(maize?.heroImage);
    expect(brooklyn?.bible?.accentColor).toBe("#8B5CFF");
    expect(maize?.bible?.accentColor).toBe("#FF7A1A");
    expect(brooklyn?.bible?.currentAssignment).toContain("visual idea");
    expect(maize?.bible?.currentAssignment).toContain("first challenge");
  });

  it("renders visual expression and outfit libraries from structured records", async () => {
    renderRoute("/characters/char-layla");

    await userEvent.click(await screen.findByRole("button", { name: "Expressions" }));
    expect(await screen.findByText("Layla expression board")).toBeInTheDocument();
    expect(screen.getByText("Sweet")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Outfits" }));
    expect(await screen.findByText("Layla wardrobe references")).toBeInTheDocument();
    expect(screen.getByText("Default Sunshine")).toBeInTheDocument();
  });

  it("navigates between individual bibles from the character switcher", async () => {
    renderRoute("/characters/char-brooklyn");

    await userEvent.click(await screen.findByRole("link", { name: "Open Maddie Character Bible" }));
    expect(await screen.findByRole("heading", { level: 1, name: "Maddie Character Bible" })).toBeInTheDocument();
  });

  it("supports Character Studio search, filtering, sorting, and mobile-safe section tabs", async () => {
    renderRoute("/characters");

    fireEvent.change(await screen.findByLabelText("Search characters"), { target: { value: "Layla" } });
    expect(screen.getByRole("heading", { name: "Layla" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Brooklyn" })).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Search characters"), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText("Sort"), { target: { value: "readiness" } });
    fireEvent.change(screen.getByLabelText("Readiness"), { target: { value: "needs-work" } });
    expect(screen.getAllByText("Open Character Bible").length).toBeGreaterThan(0);

    renderRoute("/characters/char-brooklyn");
    expect(await screen.findByLabelText("Character Bible sections")).toHaveClass("overflow-x-auto");
  });

  it("opens a Character Bible from Scene Workspace and returns to the scene", async () => {
    renderRoute("/projects/project-monster-truck/episodes/episode-ptl-crew-s1e1/scenes/scene-wonder-question");

    await userEvent.click(await screen.findByRole("link", { name: /Maddie · The Thinker/ }));
    expect(await screen.findByRole("heading", { level: 1, name: "Maddie Character Bible" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Return to Scene" })).toHaveAttribute(
      "href",
      "/projects/project-monster-truck/episodes/episode-ptl-crew-s1e1/scenes/scene-wonder-question",
    );
  });
});
