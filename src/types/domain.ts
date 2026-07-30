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
}

export interface Storyboard {
  id: string;
  projectId: string;
  title: string;
  sceneIds: string[];
  createdAt: string;
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
