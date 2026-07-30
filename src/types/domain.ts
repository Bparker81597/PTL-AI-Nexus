export type AssetType =
  | "character-reference"
  | "generated-image"
  | "video"
  | "audio"
  | "storyboard"
  | "lora"
  | "model"
  | "export";

export type RenderStatus = "queued" | "preparing" | "running" | "completed" | "failed" | "cancelled";

export type ProductionPhase =
  | "concept"
  | "writing"
  | "preproduction"
  | "storyboard"
  | "visual-development"
  | "animation"
  | "audio"
  | "rendering"
  | "review"
  | "completed";

export type EpisodeStatus = "planning" | "writing" | "storyboard" | "animation" | "audio" | "review" | "completed";
export type SceneStageState = "not-started" | "in-progress" | "blocked" | "ready-for-review" | "approved" | "completed";
export type ApprovalState = "not-ready" | "needs-review" | "approved" | "changes-requested";

export interface SceneStageProgress {
  story: SceneStageState;
  storyboard: SceneStageState;
  visualAssets: SceneStageState;
  animation: SceneStageState;
  voice: SceneStageState;
  music: SceneStageState;
  soundEffects: SceneStageState;
  finalRender: SceneStageState;
  review: SceneStageState;
}

export interface ProductionBlocker {
  id: string;
  scope: "project" | "episode" | "scene" | "asset" | "render";
  recordId: string;
  message: string;
  severity: "info" | "warning" | "critical";
  resolved: boolean;
}

export type GenerationType =
  | "image"
  | "image-to-video"
  | "text-to-video"
  | "voice"
  | "music"
  | "sound-effect";

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  url: string;
  projectId?: string;
  sceneId?: string;
  characterId?: string;
  characterIds?: string[];
  providerId?: string;
  createdAt: string;
  dimensions?: string;
  duration?: number;
  isMock: boolean;
  metadata?: Record<string, unknown>;
  category?: string;
  tags?: string[];
  universeId?: string;
  seriesId?: string;
  seasonId?: string;
  episodeId?: string;
  locationId?: string;
  productionStage?: keyof SceneStageProgress;
  reviewStatus?: ApprovalState;
}

export interface Character {
  id: string;
  name: string;
  nickname?: string;
  role?: string;
  age?: string;
  species?: string;
  occupation?: string;
  status?: string;
  description: string;
  ageRange?: string;
  visualStyle: string;
  heroImage?: string;
  gallery?: string[];
  portrait?: string;
  referenceImages: Asset[];
  defaultOutfit?: string;
  expressions: string[];
  outfits: string[];
  accessories?: string[];
  colorPalette?: string[];
  silhouette?: string;
  colors: string[];
  biography?: string;
  personality?: string;
  strengths?: string[];
  weaknesses?: string[];
  fears?: string[];
  motivations?: string[];
  goals?: string[];
  family?: string[];
  friends?: string[];
  rivals?: string[];
  mentors?: string[];
  speakingStyle?: string;
  catchphrases?: string[];
  tone?: string;
  narrationStyle?: string;
  defaultPrompt?: string;
  consistencyPrompt: string;
  negativePrompt?: string;
  animationNotes?: string;
  voiceNotes?: string;
  continuityNotes?: string;
  loraName?: string;
  loraStrength?: number;
  projects?: string[];
  scenes?: string[];
  assetCount?: number;
  lastUsed?: string;
  createdAt: string;
  updatedAt: string;
  created?: string;
  updated?: string;
  tags?: string[];
  interests?: string[];
  teamContribution?: string;
  signatureItem?: string;
  universeId?: string;
  seriesId?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  type: "character" | "image" | "video" | "audio" | "mixed";
  status: "draft" | "active" | "rendering" | "completed" | "archived";
  characterIds: string[];
  assetIds: string[];
  sceneIds: string[];
  createdAt: string;
  updatedAt: string;
  brand?: string;
  tagline?: string;
  productionGoals?: string[];
  universeId?: string;
  seriesId?: string;
  activeSeasonId?: string;
  activeEpisodeId?: string;
  currentPhase?: ProductionPhase;
}

export interface Scene {
  id: string;
  projectId: string;
  title: string;
  description: string;
  order: number;
  characterIds: string[];
  sourceImageAssetId?: string;
  outputVideoAssetId?: string;
  location: string;
  action: string;
  emotion: string;
  dialogue: string;
  motionPrompt: string;
  cameraMovement: string;
  duration: 3 | 5 | 8 | 10;
  aspectRatio: string;
  resolution: string;
  fps: number;
  motionStrength: number;
  status: "draft" | "image-ready" | "rendering" | "completed";
  createdAt: string;
  updatedAt: string;
  purpose?: string;
  objective?: string;
  universeId?: string;
  seriesId?: string;
  seasonId?: string;
  episodeId?: string;
  locationId?: string;
  productionPhase?: ProductionPhase;
  stageProgress?: SceneStageProgress;
  notes?: string;
  blockers?: ProductionBlocker[];
  nextTask?: string;
  approvalState?: ApprovalState;
}

export interface Storyboard {
  id: string;
  projectId: string;
  title: string;
  sceneIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Season {
  id: string;
  projectId: string;
  number: number;
  title: string;
  summary: string;
  episodeIds: string[];
  status: EpisodeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Episode {
  id: string;
  projectId: string;
  seasonId: string;
  number: number;
  title: string;
  summary: string;
  status: EpisodeStatus;
  productionPhase: ProductionPhase;
  sceneIds: string[];
  blockers?: ProductionBlocker[];
  artworkAssetId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  projectId: string;
  name: string;
  description: string;
  type: "interior" | "exterior" | "mixed";
  visualNotes: string;
  assetIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductionContext {
  activeProjectId?: string;
  activeSeasonId?: string;
  activeEpisodeId?: string;
  activeSceneId?: string;
  activeCharacterIds: string[];
  activeLocationId?: string;
  productionPhase: ProductionPhase;
  currentTask?: string;
  workflowFocus?: string;
  lastWorkspace?: string;
  updatedAt: string;
}

export interface RenderJob {
  id: string;
  name: string;
  projectId?: string;
  projectName?: string;
  generationType: GenerationType;
  providerId: string;
  status: RenderStatus;
  progress: number;
  createdAt: string;
  updatedAt?: string;
  estimatedCompletion?: string;
  outputAssetIds: string[];
  request: GenerationRequest;
  sourceAssetIds?: string[];
  sceneId?: string;
  cancelledAt?: string;
  errorMessage?: string;
  seasonId?: string;
  episodeId?: string;
  locationId?: string;
  productionStage?: keyof SceneStageProgress;
  reviewStatus?: ApprovalState;
}

export interface GenerationRequest {
  id: string;
  projectId?: string;
  generationType: GenerationType;
  prompt: string;
  negativePrompt?: string;
  characterIds?: string[];
  sourceAssetIds?: string[];
  settings: Record<string, unknown>;
  preferredProvider?: string;
}

export interface GenerationResult {
  requestId: string;
  jobId: string;
  status: RenderStatus;
  assets: Asset[];
  providerId: string;
  metadata?: Record<string, unknown>;
}

export interface UserSettings {
  id: string;
  currentWorkspace: string;
  preferredProvider: string;
  localFirst: boolean;
}

export interface CreateCharacterInput {
  name: string;
  description: string;
  visualStyle: string;
  consistencyPrompt: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  type: Project["type"];
}

export interface CreateSceneInput {
  projectId: string;
  title: string;
  description: string;
  characterIds: string[];
}
