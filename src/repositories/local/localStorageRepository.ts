import type {
  Asset,
  Character,
  CreateCharacterInput,
  CreateProjectInput,
  CreateSceneInput,
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
    const stored = JSON.parse(raw) as T[];
    const merged = [...stored];
    for (const seedItem of this.seed) {
      if (!merged.some((item) => item.id === seedItem.id)) {
        merged.push(seedItem);
      }
    }
    if (merged.length !== stored.length) {
      await this.saveAll(merged);
    }
    return merged;
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

  async delete(id: string): Promise<void> {
    const items = await this.list();
    await this.saveAll(items.filter((item) => item.id !== id));
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

  delete(id: string): Promise<void> {
    return this.collection.delete(id);
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

  delete(id: string): Promise<void> {
    return this.collection.delete(id);
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

  async list(): Promise<Scene[]> {
    const scenes = await this.collection.list();
    const normalized = scenes.map((scene, index) => this.normalizeScene(scene, index));
    await Promise.all(normalized.map((scene) => this.collection.save(scene)));
    return normalized.sort((a, b) => a.order - b.order);
  }

  getById(id: string): Promise<Scene | undefined> {
    return this.collection.getById(id);
  }

  create(scene: Scene): Promise<Scene> {
    return this.collection.save(scene);
  }

  async createFromInput(input: CreateSceneInput): Promise<Scene> {
    const timestamp = nowIso();
    const projectScenes = (await this.list()).filter((scene) => scene.projectId === input.projectId);
    return this.collection.save({
      id: createId("scene"),
      projectId: input.projectId,
      title: input.title,
      description: input.description,
      order: projectScenes.length + 1,
      characterIds: input.characterIds,
      location: "New scene location",
      action: "Describe the action",
      emotion: "Curious",
      dialogue: "",
      motionPrompt: input.description,
      cameraMovement: "Tracking shot",
      duration: 5,
      aspectRatio: "16:9",
      resolution: "1080p",
      fps: 24,
      motionStrength: 0.55,
      status: "draft",
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }

  update(scene: Scene): Promise<Scene> {
    return this.collection.save({ ...scene, updatedAt: nowIso() });
  }

  delete(id: string): Promise<void> {
    return this.collection.delete(id);
  }

  private normalizeScene(scene: Scene, index: number): Scene {
    const legacy = scene as Scene & { name?: string; assetIds?: string[] };
    return {
      ...scene,
      title: scene.title ?? legacy.name ?? "Untitled scene",
      order: scene.order ?? index + 1,
      sourceImageAssetId: scene.sourceImageAssetId ?? legacy.assetIds?.[0],
      outputVideoAssetId: scene.outputVideoAssetId,
      location: scene.location ?? "Monster truck stadium",
      action: scene.action ?? scene.description,
      emotion: scene.emotion ?? "Excited",
      dialogue: scene.dialogue ?? "",
      motionPrompt: scene.motionPrompt ?? scene.description,
      cameraMovement: scene.cameraMovement ?? "Tracking shot",
      duration: scene.duration ?? 5,
      aspectRatio: scene.aspectRatio ?? "16:9",
      resolution: scene.resolution ?? "1080p",
      fps: scene.fps ?? 24,
      motionStrength: scene.motionStrength ?? 0.55,
      status: scene.status ?? "draft",
      updatedAt: scene.updatedAt ?? scene.createdAt,
    };
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
