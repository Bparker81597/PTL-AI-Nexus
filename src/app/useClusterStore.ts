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
  Episode,
  GenerationRequest,
  Location,
  ProductionContext,
  ProductionPhase,
  Project,
  RenderJob,
  Scene,
  Season,
  UserSettings,
} from "../types/domain";
import { createId, nowIso } from "../utils/ids";
import { sampleEpisodes, sampleLocations, sampleProductionContext, sampleSeasons } from "../data/sampleData";

interface Notice {
  id: string;
  message: string;
  tone: "success" | "error" | "info";
}

const contextKey = "ptl.productionContext";

const readProductionContext = (): ProductionContext => {
  if (typeof window === "undefined") return sampleProductionContext;
  const raw = window.localStorage.getItem(contextKey);
  return raw ? { ...sampleProductionContext, ...(JSON.parse(raw) as ProductionContext) } : sampleProductionContext;
};

const writeProductionContext = (context: ProductionContext): ProductionContext => {
  const next = { ...context, updatedAt: nowIso() };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(contextKey, JSON.stringify(next));
  }
  return next;
};

interface ClusterState {
  assets: Asset[];
  characters: Character[];
  episodes: Episode[];
  locations: Location[];
  productionContext: ProductionContext;
  projects: Project[];
  renderJobs: RenderJob[];
  scenes: Scene[];
  seasons: Season[];
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
  createAsset: (asset: Asset) => Promise<Asset>;
  cancelJob: (jobId: string) => Promise<void>;
  retryJob: (jobId: string) => Promise<void>;
  updateAsset: (asset: Asset) => Promise<Asset>;
  deleteAsset: (assetId: string) => Promise<void>;
  setActiveProject: (projectId?: string) => void;
  setActiveSeason: (seasonId?: string) => void;
  setActiveEpisode: (episodeId?: string) => void;
  setActiveScene: (sceneId?: string) => void;
  setActiveCharacters: (characterIds: string[]) => void;
  setActiveLocation: (locationId?: string) => void;
  setProductionPhase: (phase: ProductionPhase) => void;
  setWorkflowFocus: (focus?: string, workspace?: string) => void;
  clearProductionContext: () => void;
  restoreLastProductionContext: () => void;
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
  episodes: sampleEpisodes,
  locations: sampleLocations,
  productionContext: readProductionContext(),
  projects: [],
  renderJobs: [],
  scenes: [],
  seasons: sampleSeasons,
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
    get().setActiveScene(scene.id);
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
    const context = get().productionContext;
    const job = await renderService.startGeneration({
      ...input,
      projectId: input.projectId ?? context.activeProjectId,
      characterIds: input.characterIds ?? context.activeCharacterIds,
      settings: {
        ...input.settings,
        sceneId: input.settings.sceneId ?? context.activeSceneId,
        episodeId: input.settings.episodeId ?? context.activeEpisodeId,
        seasonId: input.settings.seasonId ?? context.activeSeasonId,
        locationId: input.settings.locationId ?? context.activeLocationId,
      },
      id: createId("request"),
      preferredProvider: input.preferredProvider ?? (input.mode === "live" ? "live-video-gateway" : get().settings?.preferredProvider ?? "mock"),
      mode: input.mode ?? "mock",
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
  async createAsset(asset) {
    const created = await repositories.assets.create(asset);
    set({
      assets: [created, ...get().assets],
      notices: [pushNotice("Asset saved.", "success"), ...get().notices],
    });
    return created;
  },
  async deleteAsset(assetId) {
    await repositories.assets.delete(assetId);
    set({
      assets: get().assets.filter((asset) => asset.id !== assetId),
      notices: [pushNotice("Asset deleted.", "info"), ...get().notices],
    });
  },
  setActiveProject(projectId) {
    const state = get();
    const project = state.projects.find((item) => item.id === projectId);
    const validScenes = state.scenes.filter((scene) => scene.projectId === projectId);
    const validCharacters = new Set(project?.characterIds ?? []);
    const currentScene = validScenes.find((scene) => scene.id === state.productionContext.activeSceneId);
    const next: ProductionContext = {
      ...state.productionContext,
      activeProjectId: projectId,
      activeSeasonId: state.seasons.some((season) => season.id === state.productionContext.activeSeasonId && season.projectId === projectId)
        ? state.productionContext.activeSeasonId
        : project?.activeSeasonId ?? state.seasons.find((season) => season.projectId === projectId)?.id,
      activeEpisodeId: state.episodes.some((episode) => episode.id === state.productionContext.activeEpisodeId && episode.projectId === projectId)
        ? state.productionContext.activeEpisodeId
        : project?.activeEpisodeId ?? state.episodes.find((episode) => episode.projectId === projectId)?.id,
      activeSceneId: currentScene?.id,
      activeCharacterIds: state.productionContext.activeCharacterIds.filter((id) => validCharacters.has(id)),
      activeLocationId: state.locations.some((location) => location.id === state.productionContext.activeLocationId && location.projectId === projectId)
        ? state.productionContext.activeLocationId
        : undefined,
      productionPhase: project?.currentPhase ?? state.productionContext.productionPhase,
    };
    set({ productionContext: writeProductionContext(next) });
  },
  setActiveSeason(seasonId) {
    const season = get().seasons.find((item) => item.id === seasonId);
    const currentEpisode = get().episodes.find((episode) => episode.id === get().productionContext.activeEpisodeId && episode.seasonId === seasonId);
    const nextEpisode = currentEpisode ?? get().episodes.find((episode) => episode.seasonId === seasonId);
    set({
      productionContext: writeProductionContext({
        ...get().productionContext,
        activeSeasonId: seasonId,
        activeProjectId: season?.projectId ?? get().productionContext.activeProjectId,
        activeEpisodeId: nextEpisode?.id,
        activeSceneId: nextEpisode?.sceneIds.includes(get().productionContext.activeSceneId ?? "") ? get().productionContext.activeSceneId : nextEpisode?.sceneIds[0],
      }),
    });
  },
  setActiveEpisode(episodeId) {
    const episode = get().episodes.find((item) => item.id === episodeId);
    const currentSceneId = get().productionContext.activeSceneId;
    set({
      productionContext: writeProductionContext({
        ...get().productionContext,
        activeEpisodeId: episodeId,
        activeSeasonId: episode?.seasonId ?? get().productionContext.activeSeasonId,
        activeProjectId: episode?.projectId ?? get().productionContext.activeProjectId,
        activeSceneId: episode?.sceneIds.includes(currentSceneId ?? "") ? currentSceneId : episode?.sceneIds[0],
        productionPhase: episode?.productionPhase ?? get().productionContext.productionPhase,
      }),
    });
  },
  setActiveScene(sceneId) {
    const scene = get().scenes.find((item) => item.id === sceneId);
    set({
      productionContext: writeProductionContext({
        ...get().productionContext,
        activeProjectId: scene?.projectId ?? get().productionContext.activeProjectId,
        activeSeasonId: scene?.seasonId ?? get().productionContext.activeSeasonId,
        activeEpisodeId: scene?.episodeId ?? get().productionContext.activeEpisodeId,
        activeSceneId: sceneId,
        activeCharacterIds: scene?.characterIds ?? get().productionContext.activeCharacterIds,
        activeLocationId: scene?.locationId ?? get().productionContext.activeLocationId,
        productionPhase: scene?.productionPhase ?? get().productionContext.productionPhase,
      }),
    });
  },
  setActiveCharacters(characterIds) {
    set({ productionContext: writeProductionContext({ ...get().productionContext, activeCharacterIds: characterIds }) });
  },
  setActiveLocation(locationId) {
    set({ productionContext: writeProductionContext({ ...get().productionContext, activeLocationId: locationId }) });
  },
  setProductionPhase(phase) {
    set({ productionContext: writeProductionContext({ ...get().productionContext, productionPhase: phase }) });
  },
  setWorkflowFocus(focus, workspace) {
    set({ productionContext: writeProductionContext({ ...get().productionContext, workflowFocus: focus, lastWorkspace: workspace }) });
  },
  clearProductionContext() {
    set({ productionContext: writeProductionContext({ ...sampleProductionContext, activeSceneId: undefined, activeCharacterIds: [] }) });
  },
  restoreLastProductionContext() {
    set({ productionContext: readProductionContext() });
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
    set({
      assets,
      characters,
      projects,
      renderJobs,
      scenes: sortScenes(scenes),
      settings,
      seasons: sampleSeasons,
      episodes: sampleEpisodes,
      locations: sampleLocations,
      productionContext: readProductionContext(),
    });
  },
  async refreshJobs() {
    await get().refreshAll();
  },
  dismissNotice(id) {
    set({ notices: get().notices.filter((notice) => notice.id !== id) });
  },
}));

export const providers = engineRouter.listProviders();
