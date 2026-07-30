import type { Asset, Character, Episode, Location, Project, RenderJob, Scene } from "../types/domain";

export function assetsForCharacter(characterId: string, assets: Asset[]): Asset[] {
  return assets.filter((asset) => asset.characterId === characterId || asset.characterIds?.includes(characterId));
}

export function scenesForCharacter(characterId: string, scenes: Scene[]): Scene[] {
  return scenes.filter((scene) => scene.characterIds.includes(characterId)).sort((a, b) => a.order - b.order);
}

export function episodesForCharacter(characterId: string, episodes: Episode[], scenes: Scene[]): Episode[] {
  const sceneEpisodeIds = new Set(scenesForCharacter(characterId, scenes).map((scene) => scene.episodeId).filter(Boolean));
  return episodes.filter((episode) => sceneEpisodeIds.has(episode.id));
}

export function projectsForCharacter(characterId: string, projects: Project[]): Project[] {
  return projects.filter((project) => project.characterIds.includes(characterId));
}

export function renderJobsForCharacter(characterId: string, jobs: RenderJob[]): RenderJob[] {
  return jobs.filter((job) => job.request.characterIds?.includes(characterId));
}

export function voiceClipsForCharacter(characterId: string, assets: Asset[]): Asset[] {
  return assetsForCharacter(characterId, assets).filter((asset) => asset.type === "audio");
}

export function animationsForCharacter(characterId: string, assets: Asset[]): Asset[] {
  return assetsForCharacter(characterId, assets).filter((asset) => asset.type === "video");
}

export function locationsForCharacter(characterId: string, locations: Location[], scenes: Scene[]): Location[] {
  const locationIds = new Set(scenesForCharacter(characterId, scenes).map((scene) => scene.locationId).filter(Boolean));
  return locations.filter((location) => locationIds.has(location.id));
}

export function relatedCharacters(character: Character, characters: Character[]): Character[] {
  const relationshipIds = new Set(character.bible?.relationships?.map((relationship) => relationship.targetCharacterId) ?? []);
  const nameLinks = new Set([...(character.friends ?? []), ...(character.family ?? []), ...(character.rivals ?? []), ...(character.mentors ?? [])]);
  return characters.filter((item) => item.id !== character.id && (relationshipIds.has(item.id) || nameLinks.has(item.name)));
}

export function characterUpdatedTime(character: Character): number {
  return new Date(character.updatedAt || character.updated || character.createdAt).getTime();
}
