import { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useClusterStore } from "../../app/useClusterStore";
import {
  CharacterArtwork,
  FeaturePanel,
  GlassPanel,
  PageHeader,
  PtlButton,
  PtlField,
  PtlInput,
  PtlProgress,
  PtlSelect,
  PtlTextarea,
  SectionHeader,
  StatusBadge,
} from "../../components/ptl";
import type { Character } from "../../types/domain";
import { assetsForCharacter, characterUpdatedTime, episodesForCharacter, projectsForCharacter, scenesForCharacter } from "../../utils/characterSelectors";
import { calculateCharacterReadiness } from "../../utils/characterReadiness";

type SortMode = "name" | "readiness" | "updated";
type ReadinessFilter = "all" | "needs-work" | "ready";

export function CharacterStudioPage() {
  const { characters, projects, episodes, scenes, assets, renderJobs, productionContext, createCharacter } = useClusterStore();
  const [query, setQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState(productionContext.activeProjectId ?? "all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [readinessFilter, setReadinessFilter] = useState<ReadinessFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("name");
  const [activeOnly, setActiveOnly] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    visualStyle: "Bright 3D animated adventure",
    consistencyPrompt: "",
  });

  const characterCards = useMemo(
    () =>
      characters
        .map((character) => ({
          character,
          readiness: calculateCharacterReadiness(character, assets, scenes, episodes, renderJobs),
          projects: projectsForCharacter(character.id, projects),
          scenes: scenesForCharacter(character.id, scenes),
          episodes: episodesForCharacter(character.id, episodes, scenes),
          assets: assetsForCharacter(character.id, assets),
        }))
        .filter(({ character, readiness, projects: linkedProjects }) => {
          const matchesQuery = [character.name, character.displayName, character.role, character.shortDescription, character.description]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(query.toLowerCase());
          const matchesProject = projectFilter === "all" || linkedProjects.some((project) => project.id === projectFilter) || character.projectId === projectFilter;
          const matchesStatus = statusFilter === "all" || character.status === statusFilter;
          const matchesReadiness =
            readinessFilter === "all" ||
            (readinessFilter === "ready" && readiness.productionReady) ||
            (readinessFilter === "needs-work" && !readiness.productionReady);
          const matchesActive = !activeOnly || productionContext.activeCharacterIds.includes(character.id);
          return matchesQuery && matchesProject && matchesStatus && matchesReadiness && matchesActive;
        })
        .sort((a, b) => {
          if (sortMode === "readiness") return b.readiness.percentage - a.readiness.percentage;
          if (sortMode === "updated") return characterUpdatedTime(b.character) - characterUpdatedTime(a.character);
          return a.character.name.localeCompare(b.character.name);
        }),
    [activeOnly, assets, characters, episodes, productionContext.activeCharacterIds, projectFilter, projects, query, readinessFilter, renderJobs, scenes, sortMode, statusFilter],
  );

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) return;
    await createCharacter(form);
    setForm({ name: "", description: "", visualStyle: "Bright 3D animated adventure", consistencyPrompt: "" });
  };

  return (
    <div className="grid gap-5">
      <PageHeader eyebrow="Character Bible Library" title="Character Studio">
        <Link to="/characters/char-brooklyn"><PtlButton>Open Brooklyn Bible</PtlButton></Link>
      </PageHeader>

      <FeaturePanel>
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--ptl-violet-soft)]">Production character library</p>
            <h2 className="mt-2 font-display text-2xl font-semibold">PTL Crew character bibles</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[color:var(--ptl-text-secondary)]">
              Search, filter, and open focused Character Bibles for reusable production assets. Active scene characters stay highlighted from the current production context.
            </p>
          </div>
          <StatusBadge status={`${productionContext.activeCharacterIds.length} active context characters`} />
        </div>
      </FeaturePanel>

      <GlassPanel>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <PtlField label="Search">
            <PtlInput aria-label="Search characters" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Brooklyn, creator, voice..." />
          </PtlField>
          <PtlField label="Project">
            <PtlSelect value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)}>
              <option value="all">All projects</option>
              {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
            </PtlSelect>
          </PtlField>
          <PtlField label="Status">
            <PtlSelect value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">All statuses</option>
              {[...new Set(characters.map((character) => character.status ?? "concept"))].map((status) => <option key={status} value={status}>{status}</option>)}
            </PtlSelect>
          </PtlField>
          <PtlField label="Readiness">
            <PtlSelect value={readinessFilter} onChange={(event) => setReadinessFilter(event.target.value as ReadinessFilter)}>
              <option value="all">All readiness</option>
              <option value="ready">Production ready</option>
              <option value="needs-work">Needs work</option>
            </PtlSelect>
          </PtlField>
          <PtlField label="Sort">
            <PtlSelect value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)}>
              <option value="name">Name</option>
              <option value="readiness">Readiness</option>
              <option value="updated">Recently updated</option>
            </PtlSelect>
          </PtlField>
          <label className="flex min-h-11 items-center gap-2 self-end rounded-[12px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.055] px-3 text-sm text-white">
            <input type="checkbox" checked={activeOnly} onChange={(event) => setActiveOnly(event.target.checked)} />
            Active production only
          </label>
        </div>
      </GlassPanel>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {characterCards.map(({ character, readiness, projects: linkedProjects, scenes: linkedScenes, episodes: linkedEpisodes, assets: linkedAssets }) => (
          <CharacterLibraryCard
            key={character.id}
            character={character}
            projectName={linkedProjects[0]?.name ?? "Unassigned"}
            readiness={readiness.percentage}
            productionReady={readiness.productionReady}
            episodeCount={linkedEpisodes.length}
            sceneCount={linkedScenes.length}
            assetCount={linkedAssets.length}
            active={productionContext.activeCharacterIds.includes(character.id)}
          />
        ))}
      </div>

      {characterCards.length === 0 && (
        <GlassPanel>
          <p className="text-sm text-[color:var(--ptl-text-secondary)]">No characters match the current library filters.</p>
        </GlassPanel>
      )}

      <GlassPanel>
        <SectionHeader eyebrow="Create" title="New character profile" />
        <form className="grid gap-4 lg:grid-cols-2" onSubmit={submit}>
          <PtlField label="Name"><PtlInput value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></PtlField>
          <PtlField label="Visual style"><PtlInput value={form.visualStyle} onChange={(event) => setForm({ ...form, visualStyle: event.target.value })} /></PtlField>
          <PtlField label="Description"><PtlTextarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></PtlField>
          <PtlField label="Consistency prompt"><PtlTextarea value={form.consistencyPrompt} onChange={(event) => setForm({ ...form, consistencyPrompt: event.target.value })} /></PtlField>
          <div className="lg:col-span-2"><PtlButton type="submit">Save Character</PtlButton></div>
        </form>
      </GlassPanel>
    </div>
  );
}

function CharacterLibraryCard({
  character,
  projectName,
  readiness,
  productionReady,
  episodeCount,
  sceneCount,
  assetCount,
  active,
}: {
  character: Character;
  projectName: string;
  readiness: number;
  productionReady: boolean;
  episodeCount: number;
  sceneCount: number;
  assetCount: number;
  active: boolean;
}) {
  const preview = character.portrait || character.heroImage || character.referenceImages[0]?.url;
  return (
    <article className={`overflow-hidden rounded-[20px] border bg-[color:var(--ptl-bg-panel)] transition hover:-translate-y-0.5 hover:border-[color:var(--ptl-border-active)] ${active ? "border-[color:var(--ptl-border-active)] shadow-[var(--ptl-glow-cyan)]" : "border-[color:var(--ptl-border-subtle)]"}`}>
      <CharacterArtwork src={preview} alt={`${character.name} approved portrait`} variant="portrait" fit="contain" className="rounded-b-none border-0" />
      <div className="grid gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold">{character.displayName ?? character.name}</h2>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--ptl-violet-soft)]">{character.role ?? "Character"}</p>
          </div>
          <StatusBadge status={character.status ?? "concept"} />
        </div>
        <p className="line-clamp-2 text-sm leading-6 text-[color:var(--ptl-text-secondary)]">{character.shortDescription ?? character.description}</p>
        <PtlProgress value={readiness} label={`Production readiness ${readiness}%`} />
        <div className="grid grid-cols-3 gap-2 text-center text-xs text-[color:var(--ptl-text-secondary)]">
          <Stat label="Episodes" value={episodeCount} />
          <Stat label="Scenes" value={sceneCount} />
          <Stat label="Assets" value={assetCount} />
        </div>
        <p className="text-xs text-[color:var(--ptl-text-muted)]">{projectName} · {productionReady ? "Ready for production" : "Bible needs work"}</p>
        <Link className="focus-ring inline-flex min-h-11 items-center justify-center rounded-[12px] bg-[image:var(--ptl-gradient-primary)] px-4 text-sm font-semibold text-[#03101b]" to={`/characters/${character.id}`}>
          Open Character Bible
        </Link>
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[12px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.035] p-2">
      <p className="font-display text-lg font-semibold text-white">{value}</p>
      <p className="text-[10px] uppercase tracking-[0.12em]">{label}</p>
    </div>
  );
}
