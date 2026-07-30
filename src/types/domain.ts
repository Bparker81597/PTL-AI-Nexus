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
export type CharacterStatus = "concept" | "developing" | "production-ready" | "archived";
export type CharacterReadinessCategory =
  | "identity"
  | "appearance"
  | "expressions"
  | "outfits"
  | "personality"
  | "relationships"
  | "voice"
  | "animation"
  | "continuity"
  | "productionLinks"
  | "assets";
export type CharacterReadinessState = "missing" | "started" | "in-progress" | "ready" | "complete";
export type CharacterReferenceStatus = "draft" | "generated" | "review" | "approved" | "retired";

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

export interface CharacterReadinessRecord {
  category: CharacterReadinessCategory;
  state: CharacterReadinessState;
  notes?: string;
  updatedAt: string;
}

export interface CharacterExpression {
  id: string;
  name: string;
  emotion: string;
  assetId?: string;
  status: CharacterReferenceStatus;
  prompt?: string;
  animationNotes?: string;
  usageNotes?: string;
  sceneIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CharacterOutfit {
  id: string;
  name: string;
  category: "default" | "school" | "adventure" | "seasonal" | "sleepwear" | "special-event" | "weather" | "costume";
  description?: string;
  frontAssetId?: string;
  backAssetId?: string;
  accessories?: string[];
  footwear?: string;
  palette?: string[];
  status: CharacterReferenceStatus;
  continuityNotes?: string;
  episodeIds?: string[];
  sceneIds?: string[];
}

export interface CharacterRelationship {
  id: string;
  sourceCharacterId: string;
  targetCharacterId: string;
  type: "family" | "friend" | "rival" | "mentor" | "teammate" | "other";
  label: string;
  closeness: 1 | 2 | 3 | 4 | 5;
  summary?: string;
  dynamic?: string;
  conflictNotes?: string;
  supportNotes?: string;
  productionNotes?: string;
  episodeIds?: string[];
  sceneIds?: string[];
}

export interface CharacterVoiceProfile {
  status: CharacterReadinessState;
  tone?: string;
  pitch?: string;
  speakingSpeed?: string;
  dialectNotes?: string;
  emotionalRange?: string[];
  pronunciationNotes?: string;
  voicePrompt?: string;
  referenceAssetIds?: string[];
  dialogueExamples?: string[];
  providerVoiceId?: string;
  continuityNotes?: string;
}

export interface CharacterAnimationReference {
  id: string;
  name: string;
  category: "idle" | "walk" | "run" | "jump" | "wave" | "laugh" | "cry" | "dance" | "point" | "celebrate" | "other";
  previewAssetId?: string;
  sourceAssetId?: string;
  status: CharacterReferenceStatus;
  notes?: string;
  sceneIds?: string[];
  providerMetadata?: Record<string, unknown>;
  updatedAt: string;
}

export interface CharacterProp {
  id: string;
  assetId?: string;
  name: string;
  importance: "minor" | "recurring" | "signature";
  description?: string;
  ownership?: string;
  continuityNotes?: string;
  sceneIds?: string[];
  status: CharacterReferenceStatus;
}

export interface CharacterContinuityRule {
  id: string;
  title: string;
  rule: string;
  category: "appearance" | "outfit" | "prop" | "behavior" | "voice" | "animation" | "relationship" | "story";
  severity: "informational" | "important" | "critical";
  active: boolean;
  outfitIds?: string[];
  episodeIds?: string[];
  sceneIds?: string[];
  referenceAssetIds?: string[];
  notes?: string;
}

export interface CharacterNote {
  id: string;
  title: string;
  type: "director" | "writer" | "animator" | "voice" | "continuity" | "design" | "general";
  content: string;
  authorLabel: string;
  episodeId?: string;
  sceneId?: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CharacterBible {
  version: string;
  slug?: string;
  birthday?: string;
  grade?: string;
  pronouns?: string;
  favoriteColor?: string;
  favoriteFood?: string;
  favoriteActivity?: string;
  importantNotes?: string;
  biggestDream?: string;
  biggestFear?: string;
  accentColor?: string;
  accentSoftColor?: string;
  currentAssignment?: string;
  currentOutfit?: string;
  currentExpression?: string;
  currentVoiceStatus?: CharacterReadinessState;
  currentAnimationStatus?: CharacterReadinessState;
  requiredAssetNotes?: string[];
  appearanceNotes?: {
    hair?: string;
    eyes?: string;
    permanentAccessories?: string[];
    physicalNotes?: string;
    scaleReference?: string;
  };
  personalityGuide?: {
    coreTraits?: string[];
    likes?: string[];
    dislikes?: string[];
    humorStyle?: string;
    leadershipStyle?: string;
    problemSolving?: string;
    learningStyle?: string;
    communicationStyle?: string;
    comfortItems?: string[];
    reactions?: {
      happy?: string;
      scared?: string;
      excited?: string;
      embarrassed?: string;
      frustrated?: string;
      curious?: string;
    };
  };
  readiness?: CharacterReadinessRecord[];
  expressions?: CharacterExpression[];
  outfits?: CharacterOutfit[];
  relationships?: CharacterRelationship[];
  voiceProfile?: CharacterVoiceProfile;
  animationReferences?: CharacterAnimationReference[];
  props?: CharacterProp[];
  continuityRules?: CharacterContinuityRule[];
  notes?: CharacterNote[];
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
  slug?: string;
  displayName?: string;
  projectId?: string;
  nickname?: string;
  role?: string;
  age?: string;
  pronouns?: string;
  species?: string;
  occupation?: string;
  status?: string;
  shortDescription?: string;
  heroAssetId?: string;
  portraitAssetId?: string;
  bibleVersion?: string;
  bible?: CharacterBible;
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
