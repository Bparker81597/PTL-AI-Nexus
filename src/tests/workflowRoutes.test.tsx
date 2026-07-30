import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { App } from "../app/App";
import { providerStatusItems } from "../providers/providerStatus";
import { LocalCharacterRepository } from "../repositories/local/localStorageRepository";

const renderRoute = (route: string) =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  );

describe("connected workflow routes", () => {
  it("renders Mission Control with active project metrics from repositories", async () => {
    renderRoute("/");

    expect(await screen.findByRole("heading", { name: "PTL Crew" })).toBeInTheDocument();
    expect(screen.getByText("Scene sequence")).toBeInTheDocument();
    expect(screen.getAllByText("Scenes").length).toBeGreaterThan(0);
    expect(screen.queryByText(/undefined/i)).not.toBeInTheDocument();
  });

  it("renders timeline scenes in order and supports selection", async () => {
    renderRoute("/");

    const firstScene = (await screen.findAllByText("The Crew Meets at the Clubhouse"))[0];
    const secondScene = (await screen.findAllByText("The Wonder Question"))[0];
    expect(firstScene.compareDocumentPosition(secondScene) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    await userEvent.click(secondScene);
    expect(screen.getByText("Selected Scene")).toBeInTheDocument();
    expect(screen.getAllByText("The Wonder Question").length).toBeGreaterThan(1);
  });

  it("routes from Mission Control module cards", async () => {
    renderRoute("/");

    const novaCanvasLinks = await screen.findAllByRole("link", { name: /NovaCanvas/ });
    await userEvent.click(novaCanvasLinks[novaCanvasLinks.length - 1]);
    expect(await screen.findByRole("heading", { name: "Image generation workspace" })).toBeInTheDocument();
  });

  it("renders mobile navigation landmarks", async () => {
    renderRoute("/");

    expect(await screen.findByLabelText("Mobile navigation")).toBeInTheDocument();
  });

  it("opens a character detail page", async () => {
    renderRoute("/characters/char-brooklyn");

    expect((await screen.findAllByRole("heading", { name: "Brooklyn" })).length).toBeGreaterThan(0);
    expect(screen.getByText("Reference gallery")).toBeInTheDocument();
    expect(screen.getByText("Production notes")).toBeInTheDocument();
    expect(screen.getByText("Voice profile")).toBeInTheDocument();
    expect(screen.getByText("Use in NovaCanvas")).toBeInTheDocument();
  });

  it("edits and persists a character", async () => {
    renderRoute("/characters/char-brooklyn");

    fireEvent.click(await screen.findByText("Edit Character"));
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "Brooklyn persistence test description" },
    });
    fireEvent.click(screen.getByText("Save Changes"));

    await waitFor(async () => {
      const persisted = await new LocalCharacterRepository().getById("char-brooklyn");
      expect(persisted?.description).toBe("Brooklyn persistence test description");
    });
  });

  it("opens a project detail page", async () => {
    renderRoute("/projects/project-monster-truck");

    expect(await screen.findByRole("heading", { name: "PTL Crew - Series Foundation" })).toBeInTheDocument();
    expect(screen.getByText("Storyboard")).toBeInTheDocument();
  });

  it("sends a scene to NovaCanvas with context", async () => {
    renderRoute("/projects/project-monster-truck");

    fireEvent.click(await screen.findByText("Storyboard"));
    fireEvent.click((await screen.findAllByText("Open in NovaCanvas"))[0]);

    expect(await screen.findByRole("heading", { name: "Image generation workspace" })).toBeInTheDocument();
    expect(screen.getByLabelText("Scene selector")).toHaveValue("scene-clubhouse-meet");
    expect(screen.getByText("Character Bible context")).toBeInTheDocument();
  });

  it("sends an image asset to DreamFrame with context", async () => {
    renderRoute("/assets");

    fireEvent.click((await screen.findAllByText("Use in DreamFrame"))[0]);

    expect(await screen.findByRole("heading", { name: "Scene-animation workspace" })).toBeInTheDocument();
    expect(screen.getByLabelText("Source-image selector")).toHaveValue("asset-crew-clubhouse-concept");
    expect(screen.getByText("Animation profiles")).toBeInTheDocument();
  });

  it("flows character voice profile into NovaTone", async () => {
    renderRoute("/novatone");

    expect(await screen.findByRole("heading", { name: "Audio generation workspace" })).toBeInTheDocument();
    expect(screen.getByText("Character voice profile")).toBeInTheDocument();
    expect(screen.getByLabelText("Voice selector")).toHaveValue("char-brooklyn");
  });

  it("uses one provider status source with only Mock Provider connected", () => {
    const connected = providerStatusItems.filter((item) => item.status === "connected");
    const notConfiguredNames = providerStatusItems
      .filter((item) => item.status === "not configured")
      .map((item) => item.name);

    expect(connected.map((item) => item.name)).toEqual(["Mock Provider"]);
    expect(notConfiguredNames).toEqual(
      expect.arrayContaining(["ComfyUI", "RunPod", "Hugging Face", "Local AI Server", "Cloudflare R2", "Supabase"]),
    );
  });
});
