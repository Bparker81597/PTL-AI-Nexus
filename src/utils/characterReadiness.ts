import type {
  Asset,
  Character,
  CharacterReadinessCategory,
  CharacterReadinessRecord,
  CharacterReadinessState,
  Episode,
  RenderJob,
  Scene,
} from "../types/domain";
import { assetsForCharacter, episodesForCharacter, scenesForCharacter, voiceClipsForCharacter, animationsForCharacter } from "./characterSelectors";

export interface CharacterReadinessCategoryResult {
  category: CharacterReadinessCategory;
  label: string;
  state: CharacterReadinessState;
  score: number;
  missing: string[];
}

export interface CharacterReadinessResult {
  percentage: number;
  productionReady: boolean;
  categories: CharacterReadinessCategoryResult[];
  missingCategories: CharacterReadinessCategoryResult[];
  nextTask: string;
  warnings: string[];
  blockers: string[];
}

const labels: Record<CharacterReadinessCategory, string> = {
  identity: "Identity",
  appearance: "Appearance",
  expressions: "Expressions",
  outfits: "Outfits",
  personality: "Personality",
  relationships: "Relationships",
  voice: "Voice",
  animation: "Animation",
  continuity: "Continuity",
  productionLinks: "Production Links",
  assets: "Assets",
};

const categoryOrder: CharacterReadinessCategory[] = [
  "identity",
  "appearance",
  "expressions",
  "outfits",
  "personality",
  "relationships",
  "voice",
  "animation",
  "continuity",
  "productionLinks",
  "assets",
];

const stateScore: Record<CharacterReadinessState, number> = {
  missing: 0,
  started: 30,
  "in-progress": 60,
  ready: 85,
  complete: 100,
};

export function calculateCharacterReadiness(
  character: Character,
  assets: Asset[] = [],
  scenes: Scene[] = [],
  episodes: Episode[] = [],
  jobs: RenderJob[] = [],
): CharacterReadinessResult {
  const explicit = new Map((character.bible?.readiness ?? []).map((record) => [record.category, record]));
  const characterAssets = assetsForCharacter(character.id, assets);
  const characterScenes = scenesForCharacter(character.id, scenes);
  const characterEpisodes = episodesForCharacter(character.id, episodes, scenes);
  const voiceAssets = voiceClipsForCharacter(character.id, assets);
  const animationAssets = animationsForCharacter(character.id, assets);

  const categories = categoryOrder.map((category) =>
    applyExplicitReadiness(
      inferCategoryReadiness(category, character, characterAssets, characterScenes, characterEpisodes, voiceAssets, animationAssets, jobs),
      explicit.get(category),
    ),
  );
  const missingCategories = categories.filter((category) => category.score < 85);
  const blockers = [
    ...characterScenes.flatMap((scene) => scene.blockers ?? []).filter((blocker) => !blocker.resolved).map((blocker) => blocker.message),
    ...jobs.filter((job) => job.request.characterIds?.includes(character.id) && job.status === "failed").map((job) => `${job.name} failed`),
  ];
  const warnings = missingCategories.slice(0, 4).map((category) => `${category.label}: ${category.missing[0] ?? "needs review"}`);
  const percentage = Math.round(categories.reduce((total, category) => total + category.score, 0) / categories.length);

  return {
    percentage,
    productionReady: percentage >= 85 && blockers.length === 0,
    categories,
    missingCategories,
    nextTask: nextCharacterTask(missingCategories, blockers),
    warnings,
    blockers,
  };
}

export function readinessRecordsFromStates(states: Partial<Record<CharacterReadinessCategory, CharacterReadinessState>>, updatedAt: string): CharacterReadinessRecord[] {
  return Object.entries(states).map(([category, state]) => ({
    category: category as CharacterReadinessCategory,
    state,
    updatedAt,
  }));
}

function inferCategoryReadiness(
  category: CharacterReadinessCategory,
  character: Character,
  characterAssets: Asset[],
  characterScenes: Scene[],
  characterEpisodes: Episode[],
  voiceAssets: Asset[],
  animationAssets: Asset[],
  jobs: RenderJob[],
): CharacterReadinessCategoryResult {
  const result = (state: CharacterReadinessState, missing: string[] = []): CharacterReadinessCategoryResult => ({
    category,
    label: labels[category],
    state,
    score: stateScore[state],
    missing,
  });

  if (category === "identity") {
    const missing = [
      !character.name && "name",
      !character.role && "role",
      !character.shortDescription && !character.description && "short description",
      !character.age && !character.ageRange && "age",
    ].filter(Boolean) as string[];
    return result(missing.length ? "in-progress" : "complete", missing);
  }
  if (category === "appearance") {
    const hasHero = Boolean(character.heroImage || character.portrait || character.heroAssetId || character.portraitAssetId || character.referenceImages.length);
    const missing = [!hasHero && "approved portrait or hero reference", !(character.colors.length || character.colorPalette?.length) && "color palette"].filter(Boolean) as string[];
    return result(missing.length ? "in-progress" : "complete", missing);
  }
  if (category === "expressions") {
    const expressionCount = Math.max(character.expressions.length, character.bible?.expressions?.length ?? 0);
    if (expressionCount >= 5) return result("complete");
    if (expressionCount >= 2) return result("in-progress", ["approved expression set"]);
    return result("missing", ["expression references"]);
  }
  if (category === "outfits") {
    const outfitCount = Math.max(character.outfits.length, character.bible?.outfits?.length ?? 0);
    if (outfitCount >= 3 || character.defaultOutfit) return result("ready");
    if (outfitCount > 0) return result("in-progress", ["approved outfit reference"]);
    return result("missing", ["outfit references"]);
  }
  if (category === "personality") {
    const hasProfile = Boolean(character.personality && (character.strengths?.length || character.goals?.length || character.catchphrases?.length));
    return result(hasProfile ? "ready" : "started", hasProfile ? [] : ["personality guidance"]);
  }
  if (category === "relationships") {
    const count = character.bible?.relationships?.length ?? (character.friends?.length ?? 0) + (character.family?.length ?? 0);
    return result(count ? "ready" : "missing", count ? [] : ["relationship records"]);
  }
  if (category === "voice") {
    const hasVoice = Boolean(character.bible?.voiceProfile?.voicePrompt || character.voiceNotes || character.speakingStyle || voiceAssets.length);
    return result(hasVoice ? "ready" : "missing", hasVoice ? [] : ["voice direction"]);
  }
  if (category === "animation") {
    const hasAnimation = Boolean(character.animationNotes || character.bible?.animationReferences?.length || animationAssets.length);
    return result(hasAnimation ? "in-progress" : "missing", hasAnimation ? ["approved animation reference"] : ["animation reference"]);
  }
  if (category === "continuity") {
    const hasContinuity = Boolean(character.continuityNotes || character.bible?.continuityRules?.length);
    return result(hasContinuity ? "ready" : "missing", hasContinuity ? [] : ["continuity rules"]);
  }
  if (category === "productionLinks") {
    const hasLinks = Boolean(character.projects?.length || character.projectId || characterScenes.length || characterEpisodes.length);
    return result(hasLinks ? "complete" : "missing", hasLinks ? [] : ["project or scene usage"]);
  }
  const linkedJobCount = jobs.filter((job) => job.request.characterIds?.includes(character.id)).length;
  if (characterAssets.length >= 2 || linkedJobCount > 0) return result("ready");
  if (characterAssets.length) return result("in-progress", ["more reviewed character assets"]);
  return result("missing", ["linked character assets"]);
}

function applyExplicitReadiness(result: CharacterReadinessCategoryResult, explicit?: CharacterReadinessRecord): CharacterReadinessCategoryResult {
  if (!explicit) return result;
  const score = stateScore[explicit.state];
  return { ...result, state: explicit.state, score, missing: explicit.notes ? [explicit.notes, ...result.missing] : result.missing };
}

function nextCharacterTask(missingCategories: CharacterReadinessCategoryResult[], blockers: string[]): string {
  if (blockers.length) return `Resolve blocker: ${blockers[0]}`;
  const next = missingCategories[0];
  if (!next) return "Review linked production usage";
  const missing = next.missing[0] ?? next.label.toLowerCase();
  return `Complete ${missing}`;
}
