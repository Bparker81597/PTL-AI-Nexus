import { create } from "zustand";
import { engineRouter } from "../providers/ai/engineRouter";
import { repositories } from "../repositories/local/localStorageRepository";
import { renderService } from "../services/appServices";
import type { Asset, Character, CreateCharacterInput, CreateProjectInput, GenerationRequest, Project, RenderJob, UserSettings } from "../types/domain";
import { createId } from "../utils/ids";

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
  settings?: UserSettings;
  notices: Notice[];
  loading: boolean;
  load: () => Promise<void>;
  createCharacter: (input: CreateCharacterInput) => Promise<Character>;
  createProject: (input: CreateProjectInput) => Promise<Project>;
  generate: (request: Omit<GenerationRequest, "id">) => Promise<RenderJob>;
  retryJob: (jobId: string) => Promise<void>;
  refreshJobs: () => Promise<void>;
  dismissNotice: (id: string) => void;
}

const pushNotice = (message: string, tone: Notice["tone"]): Notice => ({
  id: createId("notice"),
  message,
  tone,
});

export const useClusterStore = create<ClusterState>((set, get) => ({
  assets: [],
  characters: [],
  projects: [],
  renderJobs: [],
  notices: [],
  loading: true,
  async load() {
    const [assets, characters, projects, renderJobs, settings] = await Promise.all([
      repositories.assets.list(),
      repositories.characters.list(),
      repositories.projects.list(),
      repositories.renderJobs.list(),
      repositories.settings.get(),
    ]);
    set({ assets, characters, projects, renderJobs, settings, loading: false });
  },
  async createCharacter(input) {
    const character = await repositories.characters.create(input);
    set({ characters: [character, ...get().characters], notices: [pushNotice("Character created.", "success"), ...get().notices] });
    return character;
  },
  async createProject(input) {
    const project = await repositories.projects.create(input);
    set({ projects: [project, ...get().projects], notices: [pushNotice("Project created.", "success"), ...get().notices] });
    return project;
  },
  async generate(input) {
    const job = await renderService.startGeneration({
      ...input,
      id: createId("request"),
      preferredProvider: input.preferredProvider ?? get().settings?.preferredProvider ?? "mock",
    });
    set({ renderJobs: [job, ...get().renderJobs], notices: [pushNotice("Generation added to render queue.", "info"), ...get().notices] });
    window.setTimeout(() => void get().refreshJobs(), 900);
    return job;
  },
  async retryJob(jobId) {
    await renderService.retryFailedJob(jobId);
    set({ notices: [pushNotice("Retry queued.", "info"), ...get().notices] });
    await get().refreshJobs();
    window.setTimeout(() => void get().refreshJobs(), 900);
  },
  async refreshJobs() {
    const [renderJobs, assets, projects] = await Promise.all([
      repositories.renderJobs.list(),
      repositories.assets.list(),
      repositories.projects.list(),
    ]);
    set({ renderJobs, assets, projects });
  },
  dismissNotice(id) {
    set({ notices: get().notices.filter((notice) => notice.id !== id) });
  },
}));

export const providers = engineRouter.listProviders();
