import { Link } from "react-router-dom";
import type { Character, Episode, Location, ProductionContext, Project, Scene, Season } from "../../types/domain";

export function ProductionContextIndicator({
  context,
  projects,
  seasons,
  episodes,
  scenes,
  characters,
  locations,
  className = "",
}: {
  context: ProductionContext;
  projects: Project[];
  seasons: Season[];
  episodes: Episode[];
  scenes: Scene[];
  characters: Character[];
  locations: Location[];
  className?: string;
}) {
  const project = projects.find((item) => item.id === context.activeProjectId);
  const season = seasons.find((item) => item.id === context.activeSeasonId);
  const episode = episodes.find((item) => item.id === context.activeEpisodeId);
  const scene = scenes.find((item) => item.id === context.activeSceneId);
  const location = locations.find((item) => item.id === context.activeLocationId);
  const activeCharacters = characters.filter((character) => context.activeCharacterIds.includes(character.id));

  return (
    <aside className={`rounded-[16px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.035] px-4 py-3 ${className}`} aria-label="Active production context">
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--ptl-text-muted)]">
        <span className="text-[color:var(--ptl-cyan-soft)]">Production Context</span>
        <span>{context.productionPhase}</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-2 text-sm text-[color:var(--ptl-text-secondary)]">
        {project && <Link className="font-semibold text-white hover:text-[color:var(--ptl-cyan-soft)]" to={`/projects/${project.id}`}>{project.name}</Link>}
        {season && <span>{season.title}</span>}
        {episode && <span>{`Episode ${episode.number}: ${episode.title}`}</span>}
        {scene && <Link className="text-[color:var(--ptl-cyan-soft)] hover:text-white" to={`/projects/${scene.projectId}/episodes/${scene.episodeId ?? ""}/scenes/${scene.id}`}>{`Scene ${scene.order}: ${scene.title}`}</Link>}
        {location && <span>{location.name}</span>}
        {activeCharacters.length > 0 && <span>{activeCharacters.map((character) => character.name).join(", ")}</span>}
      </div>
    </aside>
  );
}
