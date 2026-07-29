import type {
  Asset,
  Character,
  CreateCharacterInput,
  CreateProjectInput,
  Project,
  RenderJob,
  Scene,
  UserSettings,
} from "../types/domain";

export interface CharacterRepository {
  list(): Promise<Character[]>;
  getById(id: string): Promise<Character | undefined>;
  create(input: CreateCharacterInput): Promise<Character>;
  update(character: Character): Promise<Character>;
}

export interface ProjectRepository {
  list(): Promise<Project[]>;
  getById(id: string): Promise<Project | undefined>;
  create(input: CreateProjectInput): Promise<Project>;
  update(project: Project): Promise<Project>;
}

export interface AssetRepository {
  list(): Promise<Asset[]>;
  getById(id: string): Promise<Asset | undefined>;
  create(asset: Asset): Promise<Asset>;
  update(asset: Asset): Promise<Asset>;
}

export interface RenderJobRepository {
  list(): Promise<RenderJob[]>;
  getById(id: string): Promise<RenderJob | undefined>;
  create(job: RenderJob): Promise<RenderJob>;
  update(job: RenderJob): Promise<RenderJob>;
}

export interface SceneRepository {
  list(): Promise<Scene[]>;
  create(scene: Scene): Promise<Scene>;
}

export interface UserSettingsRepository {
  get(): Promise<UserSettings>;
  update(settings: UserSettings): Promise<UserSettings>;
}
