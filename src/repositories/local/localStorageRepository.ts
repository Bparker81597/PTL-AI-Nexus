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

const legacyDemoCharacterIds = new Set(["char-eric"]);
const legacyDemoSceneIds = new Set([
  "scene-stadium-arrival",
  "scene-entrance",
  "scene-seats",
  "scene-first-jump",
  "scene-celebrate",
]);
const legacyDemoAssetIds = new Set([
  "asset-eric-ref",
  "asset-eric-ref-race",
  "asset-maize-ref-studio",
  "asset-stadium-arrival",
  "asset-canyon-race",
  "asset-garage",
  "asset-storyboard",
  "asset-jump-clip",
  "asset-finish-clip",
  "asset-theme",
]);
const legacyDemoJobIds = new Set(["job-canyon-concept", "job-jump-clip", "job-entrance-failed", "job-audio-theme"]);

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

  async list(): Promise<Character[]> {
    const characters = (await this.collection.list()).filter((character) => !this.isLegacyDemoCharacter(character));
    const normalized = characters.map((character) => this.withBibleDefaults(character));
    if (JSON.stringify(characters) !== JSON.stringify(normalized)) {
      await Promise.all(normalized.map((character) => this.collection.save(character)));
    }
    return normalized;
  }

  async getById(id: string): Promise<Character | undefined> {
    const character = await this.collection.getById(id);
    return character ? this.withBibleDefaults(character) : undefined;
  }

  async create(input: CreateCharacterInput): Promise<Character> {
    const timestamp = nowIso();
    return this.collection.save({
      id: createId("char"),
      name: input.name,
      nickname: "",
      role: "Character",
      age: "",
      species: "Human",
      occupation: "",
      status: "Draft",
      description: input.description,
      visualStyle: input.visualStyle,
      heroImage: "",
      gallery: [],
      portrait: "",
      referenceImages: [],
      expressions: ["Neutral", "Happy"],
      outfits: ["Default outfit"],
      accessories: [],
      colors: ["#55D6FF", "#41E6C3"],
      colorPalette: ["#55D6FF", "#41E6C3"],
      silhouette: "",
      biography: input.description,
      personality: "",
      strengths: [],
      weaknesses: [],
      fears: [],
      motivations: [],
      goals: [],
      family: [],
      friends: [],
      rivals: [],
      mentors: [],
      speakingStyle: "",
      catchphrases: [],
      tone: "",
      narrationStyle: "",
      defaultPrompt: input.consistencyPrompt,
      consistencyPrompt: input.consistencyPrompt,
      animationNotes: "",
      voiceNotes: "",
      continuityNotes: "",
      projects: [],
      scenes: [],
      assetCount: 0,
      lastUsed: timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
      created: timestamp,
      updated: timestamp,
      tags: [],
    });
  }

  update(character: Character): Promise<Character> {
    const updatedAt = nowIso();
    return this.collection.save(this.withBibleDefaults({ ...character, updatedAt, updated: updatedAt }));
  }

  delete(id: string): Promise<void> {
    return this.collection.delete(id);
  }

  private withBibleDefaults(character: Character): Character {
    const seed = sampleCharacters.find((item) => item.id === character.id);
    const merged = seed && this.isLegacySeedCharacter(character) ? { ...character, ...seed } : seed ? { ...seed, ...character } : character;
    const colors = merged.colors.length ? merged.colors : seed?.colors ?? ["#55D6FF", "#41E6C3"];
    return {
      ...merged,
      nickname: merged.nickname ?? "",
      role: merged.role ?? "Character",
      age: merged.age ?? merged.ageRange ?? "",
      species: merged.species ?? "Human",
      occupation: merged.occupation ?? "",
      status: merged.status ?? "Active",
      heroImage: merged.heroImage ?? merged.referenceImages[0]?.url ?? "",
      gallery: merged.gallery ?? merged.referenceImages.map((asset) => asset.url),
      portrait: merged.portrait ?? merged.referenceImages[0]?.url ?? "",
      accessories: merged.accessories ?? [],
      colorPalette: merged.colorPalette ?? colors,
      silhouette: merged.silhouette ?? "",
      biography: merged.biography ?? merged.description,
      personality: merged.personality ?? "",
      strengths: merged.strengths ?? [],
      weaknesses: merged.weaknesses ?? [],
      fears: merged.fears ?? [],
      motivations: merged.motivations ?? [],
      goals: merged.goals ?? [],
      family: merged.family ?? [],
      friends: merged.friends ?? [],
      rivals: merged.rivals ?? [],
      mentors: merged.mentors ?? [],
      speakingStyle: merged.speakingStyle ?? "",
      catchphrases: merged.catchphrases ?? [],
      tone: merged.tone ?? "",
      narrationStyle: merged.narrationStyle ?? "",
      defaultPrompt: merged.defaultPrompt ?? merged.consistencyPrompt,
      animationNotes: merged.animationNotes ?? "",
      voiceNotes: merged.voiceNotes ?? "",
      continuityNotes: merged.continuityNotes ?? "",
      projects: merged.projects ?? [],
      scenes: merged.scenes ?? [],
      assetCount: merged.assetCount ?? 0,
      lastUsed: merged.lastUsed ?? merged.updatedAt,
      created: merged.created ?? merged.createdAt,
      updated: merged.updated ?? merged.updatedAt,
      tags: merged.tags ?? [],
      interests: merged.interests ?? [],
      teamContribution: merged.teamContribution ?? "",
      signatureItem: merged.signatureItem ?? "",
      universeId: merged.universeId,
      seriesId: merged.seriesId,
    };
  }

  private isLegacyDemoCharacter(character: Character): boolean {
    return legacyDemoCharacterIds.has(character.id) && character.name === "Eric";
  }

  private isLegacySeedCharacter(character: Character): boolean {
    return Boolean(
      character.tags?.includes("monster-truck-adventure") ||
        character.role === "Creative strategist" ||
        character.consistencyPrompt.includes("monster truck") ||
        character.consistencyPrompt.includes("Parker Tech Labs kid"),
    );
  }
}

export class LocalProjectRepository implements ProjectRepository {
  private readonly collection = new LocalCollection<Project>("ptl.projects", sampleProjects);

  async list(): Promise<Project[]> {
    const projects = await this.collection.list();
    const normalized = projects.map((project) => this.normalizeProject(project));
    await Promise.all(normalized.map((project) => this.collection.save(project)));
    return normalized;
  }

  async getById(id: string): Promise<Project | undefined> {
    const project = await this.collection.getById(id);
    return project ? this.normalizeProject(project) : undefined;
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

  private normalizeProject(project: Project): Project {
    const seed = sampleProjects.find((item) => item.id === project.id);
    if (!seed) return project;
    const shouldReplaceDemo = project.name.includes("Eric & Maize") || project.name.includes("Monster Truck") || project.seriesId === "ptl-crew";
    if (!shouldReplaceDemo) return project;
    return {
      ...project,
      ...seed,
      assetIds: [...new Set([...seed.assetIds, ...project.assetIds.filter((id) => !legacyDemoAssetIds.has(id))])],
      sceneIds: seed.sceneIds,
      characterIds: seed.characterIds,
      updatedAt: project.updatedAt,
    };
  }
}

export class LocalAssetRepository implements AssetRepository {
  private readonly collection = new LocalCollection<Asset>("ptl.assets", sampleAssets);

  async list(): Promise<Asset[]> {
    const assets = (await this.collection.list()).filter((asset) => !legacyDemoAssetIds.has(asset.id));
    const seedIds = new Set(sampleAssets.map((asset) => asset.id));
    const normalized = assets.map((asset) => sampleAssets.find((seed) => seed.id === asset.id) ?? asset);
    const withSeeds = [...normalized.filter((asset) => !seedIds.has(asset.id)), ...sampleAssets];
    await Promise.all(withSeeds.map((asset) => this.collection.save(asset)));
    return withSeeds;
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

  async list(): Promise<RenderJob[]> {
    const jobs = (await this.collection.list()).filter((job) => !legacyDemoJobIds.has(job.id));
    const seedIds = new Set(sampleRenderJobs.map((job) => job.id));
    const normalized = jobs.map((job) => sampleRenderJobs.find((seed) => seed.id === job.id) ?? job);
    const withSeeds = [...normalized.filter((job) => !seedIds.has(job.id)), ...sampleRenderJobs];
    await Promise.all(withSeeds.map((job) => this.collection.save(job)));
    return withSeeds;
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
    const scenes = (await this.collection.list()).filter((scene) => !legacyDemoSceneIds.has(scene.id));
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
      location: "PTL Crew production location",
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
    const seed = sampleScenes.find((item) => item.id === scene.id);
    if (seed) return { ...scene, ...seed };
    return {
      ...scene,
      title: scene.title ?? legacy.name ?? "Untitled scene",
      order: scene.order ?? index + 1,
      sourceImageAssetId: scene.sourceImageAssetId ?? legacy.assetIds?.[0],
      outputVideoAssetId: scene.outputVideoAssetId,
      location: scene.location ?? "PTL Crew clubhouse",
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
