import type {
  Asset,
  Character,
  CreateCharacterInput,
  CreateProjectInput,
  Project,
  RenderJob,
  Scene,
  UserSettings,
} from "../../types/domain";
import { sampleAssets, sampleCharacters, sampleProjects, sampleRenderJobs, sampleScenes, sampleSettings } from "../../data/sampleData";
import { createId, nowIso } from "../../utils/ids";
import type {
  AssetRepository,
  CharacterRepository,
  ProjectRepository,
  RenderJobRepository,
  SceneRepository,
  UserSettingsRepository,
} from "../contracts";

const memoryStore = new Map<string, string>();

const storage = {
  getItem(key: string): string | null {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return memoryStore.get(key) ?? null;
  },
  setItem(key: string, value: string): void {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, value);
      return;
    }
    memoryStore.set(key, value);
  },
};

class LocalCollection<T extends { id: string }> {
  constructor(
    private readonly key: string,
    private readonly seed: T[],
  ) {}

  async list(): Promise<T[]> {
    const raw = storage.getItem(this.key);
    if (!raw) {
      await this.saveAll(this.seed);
      return structuredClone(this.seed);
    }
    return JSON.parse(raw) as T[];
  }

  async getById(id: string): Promise<T | undefined> {
    return (await this.list()).find((item) => item.id === id);
  }

  async save(item: T): Promise<T> {
    const items = await this.list();
    const index = items.findIndex((existing) => existing.id === item.id);
    const next = index >= 0 ? items.map((existing) => (existing.id === item.id ? item : existing)) : [item, ...items];
    await this.saveAll(next);
    return item;
  }

  private async saveAll(items: T[]): Promise<void> {
    storage.setItem(this.key, JSON.stringify(items));
  }
}

export class LocalCharacterRepository implements CharacterRepository {
  private readonly collection = new LocalCollection<Character>("ptl.characters", sampleCharacters);

  list(): Promise<Character[]> {
    return this.collection.list();
  }

  getById(id: string): Promise<Character | undefined> {
    return this.collection.getById(id);
  }

  async create(input: CreateCharacterInput): Promise<Character> {
    const timestamp = nowIso();
    return this.collection.save({
      id: createId("char"),
      name: input.name,
      description: input.description,
      visualStyle: input.visualStyle,
      referenceImages: [],
      expressions: ["Neutral", "Happy"],
      outfits: ["Default outfit"],
      colors: ["#55D6FF", "#41E6C3"],
      consistencyPrompt: input.consistencyPrompt,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }

  update(character: Character): Promise<Character> {
    return this.collection.save({ ...character, updatedAt: nowIso() });
  }
}

export class LocalProjectRepository implements ProjectRepository {
  private readonly collection = new LocalCollection<Project>("ptl.projects", sampleProjects);

  list(): Promise<Project[]> {
    return this.collection.list();
  }

  getById(id: string): Promise<Project | undefined> {
    return this.collection.getById(id);
  }

  async create(input: CreateProjectInput): Promise<Project> {
    const timestamp = nowIso();
    return this.collection.save({
      id: createId("project"),
      name: input.name,
      description: input.description,
      type: input.type,
      status: "draft",
      characterIds: [],
      assetIds: [],
      sceneIds: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }

  update(project: Project): Promise<Project> {
    return this.collection.save({ ...project, updatedAt: nowIso() });
  }
}

export class LocalAssetRepository implements AssetRepository {
  private readonly collection = new LocalCollection<Asset>("ptl.assets", sampleAssets);

  list(): Promise<Asset[]> {
    return this.collection.list();
  }

  getById(id: string): Promise<Asset | undefined> {
    return this.collection.getById(id);
  }

  create(asset: Asset): Promise<Asset> {
    return this.collection.save(asset);
  }

  update(asset: Asset): Promise<Asset> {
    return this.collection.save(asset);
  }
}

export class LocalRenderJobRepository implements RenderJobRepository {
  private readonly collection = new LocalCollection<RenderJob>("ptl.renderJobs", sampleRenderJobs);

  list(): Promise<RenderJob[]> {
    return this.collection.list();
  }

  getById(id: string): Promise<RenderJob | undefined> {
    return this.collection.getById(id);
  }

  create(job: RenderJob): Promise<RenderJob> {
    return this.collection.save(job);
  }

  update(job: RenderJob): Promise<RenderJob> {
    return this.collection.save(job);
  }
}

export class LocalSceneRepository implements SceneRepository {
  private readonly collection = new LocalCollection<Scene>("ptl.scenes", sampleScenes);

  list(): Promise<Scene[]> {
    return this.collection.list();
  }

  create(scene: Scene): Promise<Scene> {
    return this.collection.save(scene);
  }
}

export class LocalUserSettingsRepository implements UserSettingsRepository {
  async get(): Promise<UserSettings> {
    const raw = storage.getItem("ptl.settings");
    if (!raw) {
      await this.update(sampleSettings);
      return sampleSettings;
    }
    return JSON.parse(raw) as UserSettings;
  }

  async update(settings: UserSettings): Promise<UserSettings> {
    storage.setItem("ptl.settings", JSON.stringify(settings));
    return settings;
  }
}

export const repositories = {
  characters: new LocalCharacterRepository(),
  projects: new LocalProjectRepository(),
  assets: new LocalAssetRepository(),
  renderJobs: new LocalRenderJobRepository(),
  scenes: new LocalSceneRepository(),
  settings: new LocalUserSettingsRepository(),
};
