import { create } from "zustand";
import { engineRouter } from "../providers/ai/engineRouter";
import { repositories } from "../repositories/local/localStorageRepository";
import { renderService } from "../services/appServices";
import type {
  Asset,
  Character,
  CreateCharacterInput,
  CreateProjectInput,
  CreateSceneInput,
  GenerationRequest,
  Project,
  RenderJob,
  Scene,
  UserSettings,
} from "../types/domain";
import { createId, nowIso } from "../utils/ids";

interface Notice {
  id: string;
  message: string;
  tone: "success" | "error" | "info";
}

interface ClusterState {
  assets: Asset[];
  characters: Character[];
  projects: Project[];
  renderJobs: RenderJob[];
  scenes: Scene[];
  settings?: UserSettings;
  notices: Notice[];
  loading: boolean;
  load: () => Promise<void>;
  createCharacter: (input: CreateCharacterInput) => Promise<Character>;
  updateCharacter: (character: Character) => Promise<Character>;
  duplicateCharacter: (characterId: string) => Promise<Character>;
  deleteCharacter: (characterId: string) => Promise<void>;
  createProject: (input: CreateProjectInput) => Promise<Project>;
  updateProject: (project: Project) => Promise<Project>;
  addCharacterToProject: (projectId: string, characterId: string) => Promise<void>;
  createScene: (input: CreateSceneInput) => Promise<Scene>;
  updateScene: (scene: Scene) => Promise<Scene>;
  deleteScene: (sceneId: string) => Promise<void>;
  duplicateScene: (sceneId: string) => Promise<Scene>;
  reorderScene: (sceneId: string, direction: "up" | "down") => Promise<void>;
  generate: (request: Omit<GenerationRequest, "id">) => Promise<RenderJob>;
  cancelJob: (jobId: string) => Promise<void>;
  retryJob: (jobId: string) => Promise<void>;
  updateAsset: (asset: Asset) => Promise<Asset>;
  deleteAsset: (assetId: string) => Promise<void>;
  refreshAll: () => Promise<void>;
  refreshJobs: () => Promise<void>;
  dismissNotice: (id: string) => void;
}

const pushNotice = (message: string, tone: Notice["tone"]): Notice => ({
  id: createId("notice"),
  message,
  tone,
});

const sortScenes = (scenes: Scene[]) => [...scenes].sort((a, b) => a.order - b.order);

export const useClusterStore = create<ClusterState>((set, get) => ({
  assets: [],
  characters: [],
  projects: [],
  renderJobs: [],
  scenes: [],
  notices: [],
  loading: true,
  async load() {
    await get().refreshAll();
    set({ loading: false });
  },
  async createCharacter(input) {
    const character = await repositories.characters.create(input);
    set({
      characters: [character, ...get().characters],
      notices: [pushNotice("Character created.", "success"), ...get().notices],
    });
    return character;
  },
  async updateCharacter(character) {
    const updated = await repositories.characters.update(character);
    set({
      characters: get().characters.map((item) => (item.id === updated.id ? updated : item)),
      notices: [pushNotice("Character saved.", "success"), ...get().notices],
    });
    return updated;
  },
  async duplicateCharacter(characterId) {
    const source = get().characters.find((character) => character.id === characterId);
    if (!source) throw new Error("Character not found.");
    const timestamp = nowIso();
    const duplicate = await repositories.characters.update({
      ...source,
      id: createId("char"),
      name: `${source.name} Copy`,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    set({
      characters: [duplicate, ...get().characters],
      notices: [pushNotice("Character duplicated.", "success"), ...get().notices],
    });
    return duplicate;
  },
  async deleteCharacter(characterId) {
    await repositories.characters.delete(characterId);
    set({
      characters: get().characters.filter((character) => character.id !== characterId),
      notices: [pushNotice("Character deleted.", "info"), ...get().notices],
    });
  },
  async createProject(input) {
    const project = await repositories.projects.create(input);
    set({
      projects: [project, ...get().projects],
      notices: [pushNotice("Project created.", "success"), ...get().notices],
    });
    return project;
  },
  async updateProject(project) {
    const updated = await repositories.projects.update(project);
    set({ projects: get().projects.map((item) => (item.id === updated.id ? updated : item)) });
    return updated;
  },
  async addCharacterToProject(projectId, characterId) {
    const project = get().projects.find((item) => item.id === projectId);
    if (!project) throw new Error("Project not found.");
    await get().updateProject({
      ...project,
      characterIds: [...new Set([...project.characterIds, characterId])],
    });
    set({ notices: [pushNotice("Character added to project.", "success"), ...get().notices] });
  },
  async createScene(input) {
    const scene = await repositories.scenes.createFromInput(input);
    const project = get().projects.find((item) => item.id === input.projectId);
    if (project) {
      await get().updateProject({ ...project, sceneIds: [...new Set([...project.sceneIds, scene.id])] });
    }
    set({
      scenes: sortScenes([scene, ...get().scenes]),
      notices: [pushNotice("Scene created.", "success"), ...get().notices],
    });
    return scene;
  },
  async updateScene(scene) {
    const updated = await repositories.scenes.update(scene);
    set({
      scenes: sortScenes(get().scenes.map((item) => (item.id === updated.id ? updated : item))),
      notices: [pushNotice("Scene saved.", "success"), ...get().notices],
    });
    return updated;
  },
  async deleteScene(sceneId) {
    await repositories.scenes.delete(sceneId);
    set({
      scenes: get().scenes.filter((scene) => scene.id !== sceneId),
      notices: [pushNotice("Scene deleted.", "info"), ...get().notices],
    });
  },
  async duplicateScene(sceneId) {
    const source = get().scenes.find((scene) => scene.id === sceneId);
    if (!source) throw new Error("Scene not found.");
    const timestamp = nowIso();
    const duplicate = await repositories.scenes.create({
      ...source,
      id: createId("scene"),
      title: `${source.title} Copy`,
      order: source.order + 1,
      sourceImageAssetId: undefined,
      outputVideoAssetId: undefined,
      status: "draft",
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    set({
      scenes: sortScenes([duplicate, ...get().scenes]),
      notices: [pushNotice("Scene duplicated.", "success"), ...get().notices],
    });
    return duplicate;
  },
  async reorderScene(sceneId, direction) {
    const projectScene = get().scenes.find((scene) => scene.id === sceneId);
    if (!projectScene) return;
    const siblings = sortScenes(get().scenes.filter((scene) => scene.projectId === projectScene.projectId));
    const index = siblings.findIndex((scene) => scene.id === sceneId);
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    const swap = siblings[swapIndex];
    if (!swap) return;
    await Promise.all([
      repositories.scenes.update({ ...projectScene, order: swap.order }),
      repositories.scenes.update({ ...swap, order: projectScene.order }),
    ]);
    await get().refreshAll();
  },
  async generate(input) {
    const job = await renderService.startGeneration({
      ...input,
      id: createId("request"),
      preferredProvider: input.preferredProvider ?? get().settings?.preferredProvider ?? "mock",
    });
    set({
      renderJobs: [job, ...get().renderJobs],
      notices: [pushNotice("Generation added to render queue.", "info"), ...get().notices],
    });
    window.setTimeout(() => void get().refreshAll(), 900);
    return job;
  },
  async cancelJob(jobId) {
    await renderService.cancelJob(jobId);
    await get().refreshAll();
    set({ notices: [pushNotice("Render job cancelled.", "info"), ...get().notices] });
  },
  async retryJob(jobId) {
    await renderService.retryFailedJob(jobId);
    set({ notices: [pushNotice("Retry queued.", "info"), ...get().notices] });
    await get().refreshAll();
    window.setTimeout(() => void get().refreshAll(), 900);
  },
  async updateAsset(asset) {
    const updated = await repositories.assets.update(asset);
    set({ assets: get().assets.map((item) => (item.id === updated.id ? updated : item)) });
    return updated;
  },
  async deleteAsset(assetId) {
    await repositories.assets.delete(assetId);
    set({
      assets: get().assets.filter((asset) => asset.id !== assetId),
      notices: [pushNotice("Asset deleted.", "info"), ...get().notices],
    });
  },
  async refreshAll() {
    const [assets, characters, projects, renderJobs, scenes, settings] = await Promise.all([
      repositories.assets.list(),
      repositories.characters.list(),
      repositories.projects.list(),
      repositories.renderJobs.list(),
      repositories.scenes.list(),
      repositories.settings.get(),
    ]);
    set({ assets, characters, projects, renderJobs, scenes: sortScenes(scenes), settings });
  },
  async refreshJobs() {
    await get().refreshAll();
  },
  dismissNotice(id) {
    set({ notices: get().notices.filter((notice) => notice.id !== id) });
  },
}));

export const providers = engineRouter.listProviders();
