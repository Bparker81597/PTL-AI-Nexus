import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useClusterStore } from "../../app/useClusterStore";
import {
  EmptyState,
  FeaturePanel,
  CharacterArtwork,
  GlassPanel,
  MediaPreview,
  PageHeader,
  ProductionContextIndicator,
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
import { assetsForCharacter, animationsForCharacter, episodesForCharacter, locationsForCharacter, projectsForCharacter, relatedCharacters, renderJobsForCharacter, scenesForCharacter, voiceClipsForCharacter } from "../../utils/characterSelectors";
import { calculateCharacterReadiness } from "../../utils/characterReadiness";
import { continueDestination } from "../../utils/productionIntelligence";

const sections = [
  "Overview",
  "Identity",
  "Appearance",
  "Expressions",
  "Outfits",
  "Personality",
  "Relationships",
  "Voice",
  "Animation",
  "Props",
  "Locations",
  "Production",
  "Continuity",
  "Assets",
  "Notes",
] as const;

type Section = (typeof sections)[number];

const toList = (value: string): string[] =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

export function CharacterDetailPage() {
  const { characterId } = useParams();
  const navigate = useNavigate();
  const {
    characters,
    projects,
    seasons,
    episodes,
    locations,
    scenes,
    assets,
    renderJobs,
    productionContext,
    updateCharacter,
    duplicateCharacter,
    deleteCharacter,
    addCharacterToProject,
    setActiveCharacters,
  } = useClusterStore();
  const character = characters.find((item) => item.id === characterId);
  const [section, setSection] = useState<Section>("Overview");
  const [isEditing, setIsEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [draft, setDraft] = useState<Character | undefined>(character);

  useEffect(() => {
    if (character && !isEditing) setDraft(character);
  }, [character, isEditing]);

  useEffect(() => {
    if (!character) return;
    const nextCharacters = productionContext.activeCharacterIds.includes(character.id)
      ? productionContext.activeCharacterIds
      : [character.id, ...productionContext.activeCharacterIds];
    setActiveCharacters(nextCharacters);
  }, [character, productionContext.activeCharacterIds, setActiveCharacters]);

  const characterProjects = useMemo(() => (character ? projectsForCharacter(character.id, projects) : []), [character, projects]);
  const characterScenes = useMemo(() => (character ? scenesForCharacter(character.id, scenes) : []), [character, scenes]);
  const characterEpisodes = useMemo(() => (character ? episodesForCharacter(character.id, episodes, scenes) : []), [character, episodes, scenes]);
  const characterAssets = useMemo(() => (character ? assetsForCharacter(character.id, assets) : []), [character, assets]);
  const characterJobs = useMemo(() => (character ? renderJobsForCharacter(character.id, renderJobs) : []), [character, renderJobs]);
  const characterLocations = useMemo(() => (character ? locationsForCharacter(character.id, locations, scenes) : []), [character, locations, scenes]);
  const relationships = useMemo(() => (character ? relatedCharacters(character, characters) : []), [character, characters]);
  const voiceAssets = character ? voiceClipsForCharacter(character.id, assets) : [];
  const animationAssets = character ? animationsForCharacter(character.id, assets) : [];
  const readiness = character ? calculateCharacterReadiness(character, assets, scenes, episodes, renderJobs) : undefined;
  const activeScene = scenes.find((scene) => scene.id === productionContext.activeSceneId);
  const activeEpisode = episodes.find((episode) => episode.id === productionContext.activeEpisodeId);
  const returnToScene = activeScene ? `/projects/${activeScene.projectId}/episodes/${activeScene.episodeId ?? ""}/scenes/${activeScene.id}` : undefined;
  const continueTo = character
    ? continueDestination(productionContext, characterScenes.length ? characterScenes : scenes, assets, renderJobs)
    : "/characters";

  if (!character && !draft) {
    return (
      <EmptyState
        title="Character not found"
        message="This Character Bible could not be loaded. The character may have been deleted or the route may be outdated."
        action={<Link to="/characters"><PtlButton>Back to Character Studio</PtlButton></Link>}
      />
    );
  }

  if (!character || !draft || !readiness) {
    return <EmptyState title="Loading character" message="Preparing the Character Bible workspace." />;
  }

  const save = async (event: FormEvent) => {
    event.preventDefault();
    await updateCharacter(draft);
    setIsEditing(false);
  };

  const cancel = () => {
    setDraft(character);
    setIsEditing(false);
  };

  const openCanvas = () => {
    navigate(`/canvas?projectId=${characterProjects[0]?.id ?? productionContext.activeProjectId ?? ""}&characterIds=${character.id}&sceneId=${productionContext.activeSceneId ?? ""}`, {
      state: {
        projectId: characterProjects[0]?.id ?? productionContext.activeProjectId,
        sceneId: productionContext.activeSceneId,
        characterIds: [character.id],
        prompt: `${character.defaultPrompt ?? character.name}. ${character.consistencyPrompt}`,
      },
    });
  };

  const openDreamFrame = () => {
    navigate(`/dreamframe?projectId=${characterProjects[0]?.id ?? productionContext.activeProjectId ?? ""}&characterIds=${character.id}&sceneId=${productionContext.activeSceneId ?? ""}`, {
      state: {
        projectId: characterProjects[0]?.id ?? productionContext.activeProjectId,
        sceneId: productionContext.activeSceneId,
        characterIds: [character.id],
        motionPrompt: character.animationNotes || `${character.name} moves with consistent character animation.`,
      },
    });
  };

  return (
    <div className="grid gap-5">
      <PageHeader eyebrow="Character Bible" title={`${character.displayName ?? character.name} Character Bible`}>
        {returnToScene && <Link to={returnToScene}><PtlButton variant="secondary">Return to Scene</PtlButton></Link>}
        <PtlButton variant="secondary" onClick={() => navigate(continueTo)}>Continue Production</PtlButton>
      </PageHeader>

      <ProductionContextIndicator context={productionContext} projects={projects} seasons={seasons} episodes={episodes} scenes={scenes} characters={characters} locations={locations} />

      <FeaturePanel className="p-4 sm:p-5 lg:p-6">
        <div className="pointer-events-none absolute inset-0 opacity-25" style={{ background: `radial-gradient(circle at 18% 12%, ${character.bible?.accentColor ?? "#31D9FF"}, transparent 32%), radial-gradient(circle at 86% 18%, ${character.bible?.accentSoftColor ?? "#8B5CFF"}, transparent 30%)` }} />
        <div className="relative grid gap-6 lg:grid-cols-[minmax(280px,340px)_minmax(0,1fr)] lg:items-stretch xl:grid-cols-[minmax(300px,360px)_minmax(0,1fr)]">
          <div className="flex rounded-[26px] border border-white/10 bg-black/10 p-3 sm:p-4 lg:h-full">
            <CharacterArtwork
              src={character.heroImage || character.portrait || character.referenceImages[0]?.url}
              alt={`${character.name} approved hero artwork`}
              variant="poster"
              fit="contain"
              focalPoint="center center"
              className="flex-1"
            />
          </div>
          <div className="grid content-between gap-5">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={character.status ?? "concept"} />
                <StatusBadge status={readiness.productionReady ? "production-ready" : "needs Bible work"} />
              </div>
              <h2 className="mt-4 font-display text-4xl font-semibold leading-none md:text-5xl">{character.name}</h2>
              <p className="mt-1 text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--ptl-violet-soft)]">{character.role ?? "Character"} · {characterProjects[0]?.name ?? "Unassigned project"}</p>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--ptl-text-secondary)]">{character.shortDescription ?? character.description}</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <Info label="Assignment" value={character.bible?.currentAssignment ?? "Review character bible"} />
                <Info label="Episode" value={activeEpisode ? `Episode ${activeEpisode.number}: ${activeEpisode.title}` : "Unassigned"} />
                <Info label="Scene" value={activeScene?.characterIds.includes(character.id) ? activeScene.title : "No active scene"} />
                <Info label="Outfit" value={character.bible?.currentOutfit ?? character.defaultOutfit ?? "Not set"} />
                <Info label="Status" value={activeScene?.productionPhase ?? character.status ?? "concept"} />
                <Info label="Last Updated" value={new Date(character.updatedAt).toLocaleDateString()} />
              </div>
              {activeScene?.characterIds.includes(character.id) && (
                <div className="mt-4 rounded-[16px] border border-[color:var(--ptl-border-active)] bg-[color:var(--ptl-bg-hover)] p-3 text-sm text-[color:var(--ptl-text-secondary)]">
                  Current scene usage: {activeScene.title} · {activeScene.location} · {activeScene.productionPhase ?? activeScene.status}
                </div>
              )}
            </div>
            <div className="grid gap-3 md:grid-cols-4">
              <Stat label="Readiness" value={`${readiness.percentage}%`} />
              <Stat label="Episodes" value={characterEpisodes.length} />
              <Stat label="Scenes" value={characterScenes.length} />
              <Stat label="Assets" value={characterAssets.length} />
            </div>
            <PtlProgress value={readiness.percentage} label={`Production readiness ${readiness.percentage}%`} />
            <div className="flex flex-wrap gap-2">
              <PtlButton onClick={() => navigate(continueTo)}>Continue Production</PtlButton>
              <PtlButton variant="secondary" onClick={() => navigate(`/assets?characterId=${character.id}`)}>Open Assets</PtlButton>
              {returnToScene && <Link to={returnToScene}><PtlButton variant="secondary">Open Scene</PtlButton></Link>}
              <PtlButton variant="secondary" onClick={() => setIsEditing(true)}>Edit Character</PtlButton>
            </div>
            <CharacterSwitcher currentId={character.id} characters={characters} assets={assets} scenes={scenes} episodes={episodes} renderJobs={renderJobs} />
          </div>
        </div>
      </FeaturePanel>

      <CharacterBibleNavigation selected={section} onSelect={setSection} />

      {isEditing ? (
        <CharacterEditPanel draft={draft} setDraft={setDraft} onSave={save} onCancel={cancel} onDelete={() => setConfirmingDelete(true)} />
      ) : (
        <CharacterBibleSection
          section={section}
          character={character}
          readiness={readiness}
          projects={characterProjects}
          episodes={characterEpisodes}
          scenes={characterScenes}
          assets={characterAssets}
          jobs={characterJobs}
          locations={characterLocations}
          relationships={relationships}
          voiceAssets={voiceAssets}
          animationAssets={animationAssets}
          onEdit={() => setIsEditing(true)}
          onCanvas={openCanvas}
          onDreamFrame={openDreamFrame}
        />
      )}

      <div className="flex flex-wrap gap-2">
        <PtlButton variant="secondary" onClick={() => void duplicateCharacter(character.id)}>Duplicate Character</PtlButton>
        {characterProjects[0] ? null : projects[0] && <PtlButton variant="secondary" onClick={() => void addCharacterToProject(projects[0].id, character.id)}>Add to Project</PtlButton>}
        <PtlButton variant="secondary" onClick={openCanvas}>Use in NovaCanvas</PtlButton>
        <PtlButton variant="secondary" onClick={openDreamFrame}>Use in DreamFrame</PtlButton>
      </div>

      {confirmingDelete && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-navy-950/80 p-4">
          <GlassPanel className="max-w-md">
            <h2 className="font-display text-xl font-semibold">Delete {character.name}?</h2>
            <p className="mt-2 text-sm text-[color:var(--ptl-text-secondary)]">This removes the character from local storage. Project links remain as historical IDs.</p>
            <div className="mt-5 flex gap-2">
              <PtlButton
                variant="danger"
                onClick={() => {
                  void deleteCharacter(character.id);
                  navigate("/characters");
                }}
              >
                Confirm Delete
              </PtlButton>
              <PtlButton variant="secondary" onClick={() => setConfirmingDelete(false)}>Cancel</PtlButton>
            </div>
          </GlassPanel>
        </div>
      )}
    </div>
  );
}

function CharacterSwitcher({
  currentId,
  characters,
  assets,
  scenes,
  episodes,
  renderJobs,
}: {
  currentId: string;
  characters: Character[];
  assets: Parameters<typeof calculateCharacterReadiness>[1];
  scenes: Parameters<typeof calculateCharacterReadiness>[2];
  episodes: Parameters<typeof calculateCharacterReadiness>[3];
  renderJobs: Parameters<typeof calculateCharacterReadiness>[4];
}) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1" aria-label="Character Bible switcher">
      {characters.map((character) => {
        const readiness = calculateCharacterReadiness(character, assets, scenes, episodes, renderJobs);
        return (
          <Link
            key={character.id}
            to={`/characters/${character.id}`}
            aria-label={`Open ${character.name} Character Bible`}
            className={`focus-ring grid min-w-[200px] shrink-0 grid-cols-[56px_1fr] gap-3 rounded-[16px] border p-2 text-sm transition hover:-translate-y-0.5 ${character.id === currentId ? "border-[color:var(--ptl-border-active)] bg-[color:var(--ptl-bg-hover)] text-white" : "border-[color:var(--ptl-border-subtle)] bg-white/[0.035] text-[color:var(--ptl-text-secondary)]"}`}
          >
            <CharacterArtwork src={character.portrait || character.heroImage} alt={`${character.name} portrait`} variant="avatar" shape="square" fit="contain" />
            <span className="min-w-0">
              <span className="block truncate font-display text-base font-semibold text-white">{character.name}</span>
              <span className="block truncate text-xs text-[color:var(--ptl-violet-soft)]">{character.role}</span>
              <span className="mt-1 block text-xs text-[color:var(--ptl-text-muted)]">{readiness.percentage}% ready</span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}

function CharacterBibleNavigation({ selected, onSelect }: { selected: Section; onSelect: (section: Section) => void }) {
  return (
    <nav className="overflow-x-auto rounded-[16px] border border-[color:var(--ptl-border-subtle)] bg-[color:var(--ptl-bg-panel)] p-2" aria-label="Character Bible sections">
      <div className="flex min-w-max gap-1">
        {sections.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onSelect(item)}
            className={`focus-ring min-h-10 rounded-[12px] px-3 text-sm font-semibold transition ${item === selected ? "bg-[image:var(--ptl-gradient-primary)] text-[#03101b]" : "text-[color:var(--ptl-text-secondary)] hover:bg-[color:var(--ptl-bg-hover)] hover:text-white"}`}
          >
            {item}
          </button>
        ))}
      </div>
    </nav>
  );
}

function CharacterBibleSection({
  section,
  character,
  readiness,
  projects,
  episodes,
  scenes,
  assets,
  jobs,
  locations,
  relationships,
  voiceAssets,
  animationAssets,
  onEdit,
  onCanvas,
  onDreamFrame,
}: {
  section: Section;
  character: Character;
  readiness: ReturnType<typeof calculateCharacterReadiness>;
  projects: ReturnType<typeof projectsForCharacter>;
  episodes: ReturnType<typeof episodesForCharacter>;
  scenes: ReturnType<typeof scenesForCharacter>;
  assets: ReturnType<typeof assetsForCharacter>;
  jobs: ReturnType<typeof renderJobsForCharacter>;
  locations: ReturnType<typeof locationsForCharacter>;
  relationships: Character[];
  voiceAssets: ReturnType<typeof voiceClipsForCharacter>;
  animationAssets: ReturnType<typeof animationsForCharacter>;
  onEdit: () => void;
  onCanvas: () => void;
  onDreamFrame: () => void;
}) {
  if (section === "Overview") {
    return (
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <GlassPanel>
          <SectionHeader eyebrow="Overview" title={`${character.name} production summary`} action={<PtlButton variant="secondary" onClick={onEdit}>Edit Identity</PtlButton>} />
          <div className="grid gap-3 md:grid-cols-3">
            <Stat label="Relationships" value={relationships.length} />
            <Stat label="Voice Clips" value={voiceAssets.length} />
            <Stat label="Animations" value={animationAssets.length} />
          </div>
          <p className="mt-4 leading-7 text-[color:var(--ptl-text-secondary)]">{character.biography || character.description}</p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <Info label="Role" value={character.role ?? "Not set"} />
            <Info label="Age" value={character.age ?? character.ageRange ?? "Not set"} />
            <Info label="Visual Style" value={character.visualStyle} />
            <Info label="Next Task" value={readiness.nextTask} />
          </div>
          <ProductionTimeline scenes={scenes} className="mt-5" />
        </GlassPanel>
        <ReadinessPanel readiness={readiness} />
      </div>
    );
  }

  if (section === "Identity") {
    return (
      <GlassPanel>
        <SectionHeader eyebrow="Identity" title="Core character identity" action={<PtlButton variant="secondary" onClick={onEdit}>Edit Identity</PtlButton>} />
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Info label="Full name" value={character.name} />
            <Info label="Display name" value={character.displayName ?? character.name} />
            <Info label="Nickname" value={character.nickname ?? "Not set"} />
            <Info label="Age" value={character.age ?? character.ageRange ?? "Not set"} />
            <Info label="Grade" value={character.bible?.grade ?? "Not approved"} />
            <Info label="Birthday" value={character.bible?.birthday ?? "Not approved"} />
            <Info label="Favorite Color" value={character.bible?.favoriteColor ?? "Not set"} />
            <Info label="Favorite Food" value={character.bible?.favoriteFood ?? "Not set"} />
            <Info label="Favorite Activity" value={character.bible?.favoriteActivity ?? "Not set"} />
            <Info label="Dream" value={character.bible?.biggestDream ?? "Not set"} />
            <Info label="Fear" value={character.bible?.biggestFear ?? "Not set"} />
            <Info label="Pronouns" value={character.pronouns ?? character.bible?.pronouns ?? "Not set"} />
            <Info label="Species" value={character.species ?? "Not set"} />
            <Info label="Role" value={character.role ?? "Not set"} />
            <Info label="Project" value={projects[0]?.name ?? "Unassigned"} />
          </div>
        <ListArea title="Goals" items={character.goals ?? []} />
        <ListArea title="Motivations" items={character.motivations ?? []} />
        <EmptyLine text={character.bible?.importantNotes ?? "Important production notes are ready for review."} />
      </GlassPanel>
    );
  }

  if (section === "Appearance") {
    return (
      <GlassPanel>
        <SectionHeader eyebrow="Appearance" title="Approved visual references" action={<PtlButton variant="secondary" onClick={onCanvas}>Add Reference</PtlButton>} />
        <div className="grid gap-4 lg:grid-cols-[minmax(280px,380px)_1fr]">
          <CharacterArtwork
            src={character.portrait || character.heroImage || character.referenceImages[0]?.url}
            alt={`${character.name} appearance reference`}
            variant="hero"
            fit="contain"
          />
          <div className="grid gap-3 md:grid-cols-2">
            <Info label="Default outfit" value={character.defaultOutfit ?? "Not set"} />
            <Info label="Silhouette" value={character.silhouette ?? "No silhouette note yet."} />
            <Info label="Hair" value={character.bible?.appearanceNotes?.hair ?? "No approved hair detail yet."} />
            <Info label="Eyes" value={character.bible?.appearanceNotes?.eyes ?? "No approved eye detail yet."} />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">{(character.colorPalette ?? character.colors).map((color) => <span key={color} className="h-10 w-10 rounded-[12px] border border-white/20" style={{ backgroundColor: color }} aria-label={color} />)}</div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {character.referenceImages.map((asset) => (
            <div key={asset.id} className="rounded-[16px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.035] p-3">
              <MediaPreview src={asset.url} alt={asset.name} className="aspect-video" />
              <p className="mt-2 text-sm font-semibold">{asset.name}</p>
              <p className="text-xs text-[color:var(--ptl-text-muted)]">Shared PTL Crew production reference</p>
            </div>
          ))}
        </div>
        <EmptyLine text="Side-view, back-view, close-up, and scale exports are expected future approved assets." />
      </GlassPanel>
    );
  }

  if (section === "Expressions") return <ExpressionGallery character={character} scenes={scenes} onCanvas={onCanvas} />;
  if (section === "Outfits") return <OutfitGallery character={character} onCanvas={onCanvas} />;
  if (section === "Personality") return <PersonalitySection character={character} onEdit={onEdit} />;
  if (section === "Relationships") return <RelationshipsSection relationships={relationships} character={character} />;
  if (section === "Voice") return <VoiceSection character={character} voiceAssets={voiceAssets} />;
  if (section === "Animation") return <AnimationSection character={character} animationAssets={animationAssets} onDreamFrame={onDreamFrame} />;
  if (section === "Props") return <PropsSection character={character} onCanvas={onCanvas} />;
  if (section === "Locations") return <LocationsSection locations={locations} scenes={scenes} />;
  if (section === "Production") return <ProductionSection projects={projects} episodes={episodes} scenes={scenes} assets={assets} jobs={jobs} />;
  if (section === "Continuity") return <ContinuitySection character={character} />;
  if (section === "Assets") return <AssetGallery assets={assets} scenes={scenes} />;
  return <NotesSection character={character} />;
}

function CharacterEditPanel({
  draft,
  setDraft,
  onSave,
  onCancel,
  onDelete,
}: {
  draft: Character;
  setDraft: (draft: Character) => void;
  onSave: (event: FormEvent) => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  return (
    <GlassPanel>
      <form className="grid gap-4" onSubmit={onSave}>
        <SectionHeader eyebrow="Edit" title="Section editing foundation" />
        <div className="grid gap-4 lg:grid-cols-3">
          <PtlField label="Character name"><PtlInput value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} required /></PtlField>
          <PtlField label="Display name"><PtlInput value={draft.displayName ?? ""} onChange={(event) => setDraft({ ...draft, displayName: event.target.value })} /></PtlField>
          <PtlField label="Nickname"><PtlInput value={draft.nickname ?? ""} onChange={(event) => setDraft({ ...draft, nickname: event.target.value })} /></PtlField>
          <PtlField label="Role"><PtlInput value={draft.role ?? ""} onChange={(event) => setDraft({ ...draft, role: event.target.value })} /></PtlField>
          <PtlField label="Age"><PtlInput value={draft.age ?? ""} onChange={(event) => setDraft({ ...draft, age: event.target.value })} /></PtlField>
          <PtlField label="Status">
            <PtlSelect value={draft.status ?? "concept"} onChange={(event) => setDraft({ ...draft, status: event.target.value })}>
              <option value="concept">concept</option>
              <option value="developing">developing</option>
              <option value="production-ready">production-ready</option>
              <option value="archived">archived</option>
            </PtlSelect>
          </PtlField>
        </div>
        <PtlField label="Description"><PtlTextarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></PtlField>
        <PtlField label="Short description"><PtlTextarea value={draft.shortDescription ?? ""} onChange={(event) => setDraft({ ...draft, shortDescription: event.target.value })} /></PtlField>
        <div className="grid gap-4 lg:grid-cols-2">
          <PtlField label="Biography"><PtlTextarea value={draft.biography ?? ""} onChange={(event) => setDraft({ ...draft, biography: event.target.value })} /></PtlField>
          <PtlField label="Personality"><PtlTextarea value={draft.personality ?? ""} onChange={(event) => setDraft({ ...draft, personality: event.target.value })} /></PtlField>
          <PtlField label="Expressions, one per line"><PtlTextarea value={draft.expressions.join("\n")} onChange={(event) => setDraft({ ...draft, expressions: toList(event.target.value) })} /></PtlField>
          <PtlField label="Outfits, one per line"><PtlTextarea value={draft.outfits.join("\n")} onChange={(event) => setDraft({ ...draft, outfits: toList(event.target.value) })} /></PtlField>
          <PtlField label="Voice notes"><PtlTextarea value={draft.voiceNotes ?? ""} onChange={(event) => setDraft({ ...draft, voiceNotes: event.target.value })} /></PtlField>
          <PtlField label="Animation notes"><PtlTextarea value={draft.animationNotes ?? ""} onChange={(event) => setDraft({ ...draft, animationNotes: event.target.value })} /></PtlField>
          <PtlField label="Continuity notes"><PtlTextarea value={draft.continuityNotes ?? ""} onChange={(event) => setDraft({ ...draft, continuityNotes: event.target.value })} /></PtlField>
          <PtlField label="Consistency prompt"><PtlTextarea value={draft.consistencyPrompt} onChange={(event) => setDraft({ ...draft, consistencyPrompt: event.target.value })} /></PtlField>
        </div>
        <div className="flex flex-wrap gap-2">
          <PtlButton type="submit">Save Changes</PtlButton>
          <PtlButton type="button" variant="secondary" onClick={onCancel}>Cancel</PtlButton>
          <PtlButton type="button" variant="danger" onClick={onDelete}>Delete Character</PtlButton>
        </div>
      </form>
    </GlassPanel>
  );
}

function ReadinessPanel({ readiness }: { readiness: ReturnType<typeof calculateCharacterReadiness> }) {
  return (
    <GlassPanel>
      <SectionHeader eyebrow="Production Readiness" title={`${readiness.percentage}% ready`} />
      <div className="grid gap-2">
        {readiness.categories.map((category) => (
          <div key={category.category} className="grid grid-cols-[32px_1fr_auto] items-center gap-3 rounded-[14px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.035] p-3">
            <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-white/[0.055] text-sm font-black text-[color:var(--ptl-cyan-soft)]">{readinessMark(category.state)}</span>
            <p className="font-semibold">{category.label}</p>
            <span className="text-xs font-semibold text-[color:var(--ptl-text-muted)]">{category.state}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-[16px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.035] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--ptl-text-muted)]">Next recommended task</p>
        <p className="mt-2 font-display text-lg font-semibold">{readiness.nextTask}</p>
        <p className="mt-1 text-sm text-[color:var(--ptl-text-secondary)]">{readiness.missingCategories.length} readiness areas need review.</p>
      </div>
      {readiness.warnings.length > 0 && <ListArea title="Missing readiness items" items={readiness.warnings} />}
    </GlassPanel>
  );
}

function readinessMark(state: string): string {
  if (state === "complete" || state === "ready") return "OK";
  if (state === "in-progress" || state === "started") return "MID";
  return "NEW";
}

function ExpressionGallery({ character, scenes, onCanvas }: { character: Character; scenes: ReturnType<typeof scenesForCharacter>; onCanvas: () => void }) {
  const expressions = character.bible?.expressions ?? [];
  return (
    <GlassPanel>
      <SectionHeader eyebrow="Expression Library" title={`${character.name} expression board`} action={<PtlButton variant="secondary" onClick={onCanvas}>Generate Expression</PtlButton>} />
      {expressions.length ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {expressions.map((expression) => (
            <div key={expression.id} className="group overflow-hidden rounded-[18px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.035] transition duration-200 hover:-translate-y-1 hover:border-[color:var(--ptl-border-active)] hover:bg-[color:var(--ptl-bg-hover)]">
              <div className="grid aspect-video place-items-center transition duration-200 group-hover:brightness-110" style={{ background: `linear-gradient(135deg, ${character.bible?.accentColor ?? "#31D9FF"}55, ${character.bible?.accentSoftColor ?? "#8B5CFF"}22)` }}>
                <div className="grid h-20 w-20 place-items-center rounded-full border border-white/25 bg-black/20 font-display text-2xl font-semibold text-white">{expression.name.slice(0, 2)}</div>
              </div>
              <div className="grid gap-2 p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display text-lg font-semibold">{expression.name}</h3>
                  <StatusBadge status={expression.status} />
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-[color:var(--ptl-text-muted)]">
                  <span className="rounded-[10px] bg-white/[0.05] px-2 py-1">{expression.sceneIds?.length ?? 0} scenes</span>
                  <span className="rounded-[10px] bg-white/[0.05] px-2 py-1">{expression.animationNotes ? "animation notes" : "no notes"}</span>
                </div>
                <details className="rounded-[12px] border border-[color:var(--ptl-border-subtle)] bg-black/10 p-3">
                  <summary className="cursor-pointer text-sm font-semibold text-[color:var(--ptl-cyan-soft)]">Quick open</summary>
                  <p className="mt-2 text-sm text-[color:var(--ptl-text-secondary)]">{expression.animationNotes}</p>
                  <p className="mt-2 text-xs text-[color:var(--ptl-text-muted)]">{expression.sceneIds?.map((id) => scenes.find((scene) => scene.id === id)?.title).filter(Boolean).join(", ") || "No scene usage yet"}</p>
                </details>
              </div>
            </div>
          ))}
        </div>
      ) : <EmptyLine text="No expression cards are linked yet." />}
    </GlassPanel>
  );
}

function OutfitGallery({ character, onCanvas }: { character: Character; onCanvas: () => void }) {
  const outfits = character.bible?.outfits ?? [];
  return (
    <GlassPanel>
      <SectionHeader eyebrow="Outfit Library" title={`${character.name} wardrobe references`} action={<PtlButton variant="secondary" onClick={onCanvas}>Generate Outfit</PtlButton>} />
      {outfits.length ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {outfits.map((outfit) => (
            <div key={outfit.id} className="group rounded-[18px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.035] p-4 transition duration-200 hover:-translate-y-1 hover:border-[color:var(--ptl-border-active)] hover:bg-[color:var(--ptl-bg-hover)]">
              <div className="mb-4 grid aspect-[4/3] place-items-center rounded-[16px] transition duration-200 group-hover:brightness-110" style={{ background: `linear-gradient(135deg, ${(outfit.palette?.[0] ?? character.bible?.accentColor ?? "#31D9FF")}66, ${(outfit.palette?.[1] ?? character.bible?.accentSoftColor ?? "#8B5CFF")}22)` }}>
                <span className="rounded-[12px] bg-black/20 px-3 py-2 font-display text-lg font-semibold">{outfit.category}</span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-lg font-semibold">{outfit.name}</h3>
                <StatusBadge status={outfit.status} />
              </div>
              <p className="mt-2 text-sm text-[color:var(--ptl-text-secondary)]">{outfit.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">{(outfit.palette ?? []).map((color) => <span key={color} className="h-7 w-7 rounded-[9px] border border-white/20" style={{ backgroundColor: color }} aria-label={color} />)}</div>
              <p className="mt-3 text-xs text-[color:var(--ptl-text-muted)]">Shoes: {outfit.footwear ?? "Not set"} · Episodes: {outfit.episodeIds?.length ?? 0} · Scenes: {outfit.sceneIds?.length ?? 0}</p>
              <details className="mt-3 rounded-[12px] border border-[color:var(--ptl-border-subtle)] bg-black/10 p-3">
                <summary className="cursor-pointer text-sm font-semibold text-[color:var(--ptl-cyan-soft)]">Quick open</summary>
                <p className="mt-2 text-sm text-[color:var(--ptl-text-secondary)]">{outfit.continuityNotes}</p>
                <p className="mt-2 text-xs text-[color:var(--ptl-text-muted)]">Accessories: {(outfit.accessories ?? []).join(", ") || "none"}</p>
              </details>
            </div>
          ))}
        </div>
      ) : <EmptyLine text="No structured outfit cards yet." />}
    </GlassPanel>
  );
}

function PropsSection({ character, onCanvas }: { character: Character; onCanvas: () => void }) {
  const props = character.bible?.props ?? [];
  return (
    <GlassPanel>
      <SectionHeader eyebrow="Props" title={`${character.name} reusable props`} action={<PtlButton variant="secondary" onClick={onCanvas}>Create Prop Reference</PtlButton>} />
      {props.length ? (
        <div className="grid gap-3 md:grid-cols-3">
          {props.map((prop) => (
            <div key={prop.id} className="rounded-[18px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.035] p-4">
              <div className="mb-3 grid h-24 place-items-center rounded-[16px] bg-white/[0.045] text-3xl font-semibold" style={{ color: character.bible?.accentSoftColor }}>{prop.name.slice(0, 1)}</div>
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-lg font-semibold">{prop.name}</h3>
                <StatusBadge status={prop.importance} />
              </div>
              <p className="mt-2 text-sm text-[color:var(--ptl-text-secondary)]">{prop.description}</p>
              <p className="mt-3 text-xs text-[color:var(--ptl-text-muted)]">{prop.continuityNotes}</p>
            </div>
          ))}
        </div>
      ) : <EmptyLine text="No structured prop cards yet." />}
    </GlassPanel>
  );
}

function PersonalitySection({ character, onEdit }: { character: Character; onEdit: () => void }) {
  const guide = character.bible?.personalityGuide;
  return (
    <GlassPanel>
      <SectionHeader eyebrow="Writer Guide" title="Personality and reactions" action={<PtlButton variant="secondary" onClick={onEdit}>Edit Personality</PtlButton>} />
      <div className="grid gap-4 xl:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="leading-7 text-[color:var(--ptl-text-secondary)]">{character.personality || "No personality profile yet."}</p>
          <div className="mt-4 flex flex-wrap gap-2">{(guide?.coreTraits ?? []).map((trait) => <span key={trait} className="rounded-[12px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.04] px-3 py-2 text-sm font-semibold">{trait}</span>)}</div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Info label="Humor" value={guide?.humorStyle ?? "Not set"} />
          <Info label="Leadership" value={guide?.leadershipStyle ?? "Not set"} />
          <Info label="Problem Solving" value={guide?.problemSolving ?? "Not set"} />
          <Info label="Communication" value={guide?.communicationStyle ?? "Not set"} />
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <ListArea title="Strengths" items={character.strengths ?? []} />
        <ListArea title="Weaknesses" items={character.weaknesses ?? []} />
        <ListArea title="Likes" items={guide?.likes ?? character.interests ?? []} />
        <ListArea title="Dislikes" items={guide?.dislikes ?? []} />
        <ListArea title="Comfort Items" items={guide?.comfortItems ?? []} />
        <ListArea title="Catchphrases" items={character.catchphrases ?? []} />
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {Object.entries(guide?.reactions ?? {}).map(([mood, reaction]) => <Info key={mood} label={`When ${mood}`} value={reaction ?? "Not set"} />)}
      </div>
    </GlassPanel>
  );
}

function RelationshipsSection({ relationships, character }: { relationships: Character[]; character: Character }) {
  const records = character.bible?.relationships ?? [];
  return (
    <GlassPanel>
      <SectionHeader eyebrow="Relationships" title={`${character.name}'s connected cast`} />
      {relationships.length ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {relationships.map((related) => {
            const record = records.find((item) => item.targetCharacterId === related.id);
            return (
            <Link key={related.id} to={`/characters/${related.id}`} className="focus-ring group rounded-[18px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.035] p-4 transition duration-200 hover:-translate-y-1 hover:border-[color:var(--ptl-border-active)] hover:bg-[color:var(--ptl-bg-hover)]">
              <CharacterArtwork src={related.portrait || related.heroImage} alt={`${related.name} portrait`} variant="hero" fit="contain" className="mb-3" />
              <p className="font-display text-lg font-semibold transition group-hover:text-[color:var(--ptl-cyan-soft)]">{related.name}</p>
              <p className="mt-1 text-sm text-[color:var(--ptl-violet-soft)]">{record?.label ?? related.role}</p>
              <TrustMeter value={record?.closeness ?? 4} />
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[color:var(--ptl-text-muted)]">
                <span className="rounded-[10px] bg-white/[0.05] px-2 py-1">{record?.sceneIds?.length ?? 0} shared scenes</span>
                <span className="rounded-[10px] bg-white/[0.05] px-2 py-1">{record?.episodeIds?.length ?? 0} episodes</span>
              </div>
              <p className="mt-3 text-xs font-semibold text-[color:var(--ptl-cyan-soft)]">Open Character Bible</p>
            </Link>
          );})}
        </div>
      ) : <EmptyLine text="No relationship records yet." />}
    </GlassPanel>
  );
}

function VoiceSection({ character, voiceAssets }: { character: Character; voiceAssets: ReturnType<typeof voiceClipsForCharacter> }) {
  const voice = character.bible?.voiceProfile;
  return (
    <GlassPanel>
      <SectionHeader eyebrow="Voice" title="Voice production reference" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Info label="Description" value={character.speakingStyle ?? "Not set"} />
        <Info label="Tone" value={voice?.tone ?? character.tone ?? "Not set"} />
        <Info label="Energy" value={voice?.emotionalRange?.join(", ") ?? "Not set"} />
        <Info label="Speed" value={voice?.speakingSpeed ?? "Not set"} />
        <Info label="Accent Notes" value={voice?.dialectNotes ?? "Not set"} />
        <Info label="Voice notes" value={character.voiceNotes ?? "Not set"} />
        <Info label="Approved clips" value={voiceAssets.length} />
        <Info label="Voice Status" value={voice?.status ?? "missing"} />
      </div>
      <ListArea title="Example Lines" items={voice?.dialogueExamples ?? character.catchphrases ?? []} />
      <EmptyLine text={voice?.voicePrompt ?? "Voice prompt not set."} />
    </GlassPanel>
  );
}

function AnimationSection({ character, animationAssets, onDreamFrame }: { character: Character; animationAssets: ReturnType<typeof animationsForCharacter>; onDreamFrame: () => void }) {
  const refs = character.bible?.animationReferences ?? [];
  return (
    <GlassPanel>
      <SectionHeader eyebrow="Animation" title="Motion guide" action={<PtlButton variant="secondary" onClick={onDreamFrame}>Open DreamFrame</PtlButton>} />
      <Info label="Animation notes" value={character.animationNotes ?? "Not set"} />
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {refs.map((ref) => (
          <div key={ref.id} className="rounded-[18px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.035] p-4">
            <div className="mb-3 grid aspect-video place-items-center rounded-[16px] bg-white/[0.045]">
              <span className="font-display text-lg font-semibold">{ref.category}</span>
            </div>
            <div className="flex items-center justify-between gap-2"><h3 className="font-display text-lg font-semibold">{ref.name}</h3><StatusBadge status={ref.status} /></div>
            <p className="mt-2 text-sm text-[color:var(--ptl-text-secondary)]">{ref.notes}</p>
          </div>
        ))}
        {animationAssets.map((asset) => <Info key={asset.id} label={asset.type} value={asset.name} />)}
      </div>
      {!animationAssets.length && !refs.length && <EmptyLine text="No approved animation references linked to this character yet." />}
    </GlassPanel>
  );
}

function LocationsSection({ locations, scenes }: { locations: ReturnType<typeof locationsForCharacter>; scenes: ReturnType<typeof scenesForCharacter> }) {
  return (
    <GlassPanel>
      <SectionHeader eyebrow="Locations" title="Scene-derived location usage" />
      {locations.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {locations.map((location) => (
            <Info key={location.id} label={location.name} value={`${scenes.filter((scene) => scene.locationId === location.id).length} scene appearances`} />
          ))}
        </div>
      ) : <EmptyLine text="No linked production locations yet." />}
    </GlassPanel>
  );
}

function ProductionSection({ projects, episodes, scenes, assets, jobs }: { projects: ReturnType<typeof projectsForCharacter>; episodes: ReturnType<typeof episodesForCharacter>; scenes: ReturnType<typeof scenesForCharacter>; assets: ReturnType<typeof assetsForCharacter>; jobs: ReturnType<typeof renderJobsForCharacter> }) {
  const voiceCount = assets.filter((asset) => asset.type === "audio").length;
  const animationCount = assets.filter((asset) => asset.type === "video").length;
  const storyboardCount = assets.filter((asset) => asset.type === "storyboard").length;
  const expressionTarget = 6;
  const outfitTarget = 3;
  const storyboardTarget = Math.max(1, scenes.length);
  const renderReady = jobs.filter((job) => job.status === "completed").length;
  const currentScene = scenes.find((scene) => scene.status !== "completed") ?? scenes[0];
  const blockers = scenes.flatMap((scene) => scene.blockers ?? []).filter((blocker) => !blocker.resolved);
  return (
    <GlassPanel>
      <SectionHeader eyebrow="Production" title="Usage across PTL AI Nexus" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <ProductionMeter label="Expressions" value={Math.min(expressionTarget, assets.filter((asset) => asset.category === "Expression").length)} max={expressionTarget} />
        <ProductionMeter label="Outfits" value={Math.min(outfitTarget, assets.filter((asset) => asset.category === "Outfit").length)} max={outfitTarget} />
        <ProductionMeter label="Voice" value={voiceCount} max={2} />
        <ProductionMeter label="Animation" value={animationCount} max={2} />
        <ProductionMeter label="Continuity" value={scenes.length ? scenes.filter((scene) => scene.characterIds.length).length : 0} max={Math.max(1, scenes.length)} />
        <ProductionMeter label="Storyboards" value={storyboardCount} max={storyboardTarget} />
        <ProductionMeter label="Render Readiness" value={renderReady} max={Math.max(1, jobs.length || 2)} />
        <ProductionMeter label="Assets" value={assets.length} max={6} />
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-4 xl:grid-cols-8">
        <Stat label="Projects" value={projects.length} />
        <Stat label="Episodes" value={episodes.length} />
        <Stat label="Scenes" value={scenes.length} />
        <Stat label="Assets" value={assets.length} />
        <Stat label="Voice" value={voiceCount} />
        <Stat label="Animations" value={animationCount} />
        <Stat label="Storyboards" value={storyboardCount} />
        <Stat label="Renders" value={jobs.length} />
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <Info label="Current Assignment" value={currentScene ? currentScene.title : "No active assignment"} />
        <Info label="Current Blockers" value={blockers.length} />
        <Info label="Continue" value={currentScene ? currentScene.nextTask ?? currentScene.productionPhase ?? "Open scene" : "Review character assets"} />
      </div>
      {blockers.length > 0 && (
        <div className="mt-4 grid gap-2">
          {blockers.map((blocker) => <div key={blocker.id} className="rounded-[14px] border border-amber-300/30 bg-amber-300/10 p-3 text-sm text-amber-100">{blocker.message}</div>)}
        </div>
      )}
      <ProductionTimeline scenes={scenes} className="mt-5" />
      <div className="mt-4 grid gap-3">
        {scenes.map((scene) => (
          <Link key={scene.id} to={`/projects/${scene.projectId}/episodes/${scene.episodeId ?? ""}/scenes/${scene.id}`} className="focus-ring rounded-[16px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.035] p-4 transition hover:border-[color:var(--ptl-border-active)]">
            <p className="font-semibold">{scene.order}. {scene.title}</p>
            <p className="mt-1 text-sm text-[color:var(--ptl-text-secondary)]">{scene.location} · {scene.productionPhase ?? scene.status}</p>
          </Link>
        ))}
      </div>
    </GlassPanel>
  );
}

function ContinuitySection({ character }: { character: Character }) {
  const rules = character.bible?.continuityRules ?? [];
  return (
    <GlassPanel>
      <SectionHeader eyebrow="Continuity" title="Character consistency rules" />
      <Info label="Continuity notes" value={character.continuityNotes ?? "Not set"} />
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rules.map((rule) => (
          <div key={rule.id} className="rounded-[18px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.035] p-4">
            <div className="flex items-center justify-between gap-2"><h3 className="font-display text-lg font-semibold">{rule.title}</h3><StatusBadge status={rule.severity} /></div>
            <p className="mt-2 text-sm text-[color:var(--ptl-text-secondary)]">{rule.rule}</p>
            <p className="mt-3 text-xs text-[color:var(--ptl-text-muted)]">{rule.category} · {rule.active ? "active" : "inactive"}</p>
          </div>
        ))}
      </div>
      {!rules.length && <EmptyLine text="Structured continuity rules are ready, but no conflict warnings are stored yet." />}
    </GlassPanel>
  );
}

function AssetGallery({ assets, scenes }: { assets: ReturnType<typeof assetsForCharacter>; scenes: ReturnType<typeof scenesForCharacter> }) {
  const [filter, setFilter] = useState("All");
  const groups = [
    ["Portraits", assets.filter((asset) => asset.type === "character-reference")],
    ["Storyboards", assets.filter((asset) => asset.type === "storyboard")],
    ["Voice", assets.filter((asset) => asset.type === "audio")],
    ["Animation", assets.filter((asset) => asset.type === "video")],
    ["Renders", assets.filter((asset) => asset.type === "generated-image")],
  ] as const;
  const visibleGroups = groups
    .map(([label, groupAssets]) => [label, filter === "All" || filter === label ? groupAssets : []] as const)
    .filter(([, groupAssets]) => groupAssets.length);
  return (
    <GlassPanel>
      <SectionHeader eyebrow="Assets" title="Character-linked assets" />
      {assets.length ? (
        <div className="grid gap-5">
          <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Asset filters">
            {["All", ...groups.map(([label]) => label)].map((label) => (
              <button key={label} type="button" onClick={() => setFilter(label)} className={`focus-ring min-h-10 shrink-0 rounded-[12px] px-3 text-sm font-semibold ${filter === label ? "bg-[image:var(--ptl-gradient-primary)] text-[#03101b]" : "border border-[color:var(--ptl-border-subtle)] bg-white/[0.035] text-[color:var(--ptl-text-secondary)]"}`}>
                {label}
              </button>
            ))}
          </div>
          {visibleGroups.map(([label, groupAssets]) => (
            <section key={label}>
              <h3 className="mb-3 font-display text-lg font-semibold">{label}</h3>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {groupAssets.map((asset) => {
                  const scene = scenes.find((item) => item.id === asset.sceneId);
                  return (
                    <div key={asset.id} className="group rounded-[16px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.035] p-3 transition duration-200 hover:-translate-y-1 hover:border-[color:var(--ptl-border-active)] hover:bg-[color:var(--ptl-bg-hover)]">
                      <MediaPreview src={asset.url} alt={asset.name} className="aspect-video" />
                      <p className="mt-3 font-semibold transition group-hover:text-[color:var(--ptl-cyan-soft)]">{asset.name}</p>
                      <p className="text-sm text-[color:var(--ptl-text-secondary)]">{asset.type} · {scene?.title ?? "No scene"}</p>
                      {scene && <Link className="focus-ring mt-3 inline-flex min-h-9 items-center rounded-[10px] bg-white/[0.06] px-3 text-xs font-semibold text-[color:var(--ptl-cyan-soft)]" to={`/projects/${scene.projectId}/episodes/${scene.episodeId ?? ""}/scenes/${scene.id}`}>Open Scene</Link>}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      ) : <EmptyLine text="No assets are linked specifically to this character yet." />}
    </GlassPanel>
  );
}

function NotesSection({ character }: { character: Character }) {
  const notes = character.bible?.notes ?? [];
  return (
    <GlassPanel>
      <SectionHeader eyebrow="Notes" title="Production notes" />
      {notes.length ? (
        <div className="grid gap-3">
          {notes.map((note) => (
            <div key={note.id} className="rounded-[16px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.035] p-4">
              <p className="font-semibold">{note.title}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[color:var(--ptl-text-muted)]">{note.type} · {note.authorLabel}</p>
              <p className="mt-2 text-sm text-[color:var(--ptl-text-secondary)]">{note.content}</p>
            </div>
          ))}
        </div>
      ) : <EmptyLine text="No structured notes yet." />}
    </GlassPanel>
  );
}

function ProductionTimeline({ scenes, className = "" }: { scenes: ReturnType<typeof scenesForCharacter>; className?: string }) {
  const milestones = [
    { label: "Planning", complete: true },
    { label: "Story", complete: scenes.some((scene) => scene.stageProgress?.story === "completed" || scene.stageProgress?.story === "approved") },
    { label: "Storyboard", complete: scenes.some((scene) => scene.stageProgress?.storyboard === "completed" || scene.stageProgress?.storyboard === "approved") },
    { label: "Animation", complete: scenes.some((scene) => scene.stageProgress?.animation === "completed" || scene.stageProgress?.animation === "approved") },
    { label: "Voice", complete: scenes.some((scene) => scene.stageProgress?.voice === "completed" || scene.stageProgress?.voice === "approved") },
    { label: "Review", complete: scenes.some((scene) => scene.approvalState === "approved") },
    { label: "Completed", complete: scenes.some((scene) => scene.status === "completed") },
  ];
  return (
    <div className={className}>
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--ptl-text-muted)]">Production timeline</p>
      <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Character production timeline">
        {milestones.map((milestone, index) => (
          <div key={milestone.label} className="flex min-w-[128px] items-center gap-2">
            <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border text-xs font-black ${milestone.complete ? "border-emerald-300/45 bg-emerald-300/15 text-emerald-100" : "border-[color:var(--ptl-border-subtle)] bg-white/[0.035] text-[color:var(--ptl-text-muted)]"}`}>
              {milestone.complete ? "OK" : index + 1}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{milestone.label}</p>
              <p className="text-xs text-[color:var(--ptl-text-muted)]">{milestone.complete ? "Complete" : "Open"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductionMeter({ label, value, max }: { label: string; value: number; max: number }) {
  const boundedMax = Math.max(1, max);
  const boundedValue = Math.max(0, Math.min(value, boundedMax));
  const percent = Math.round((boundedValue / boundedMax) * 100);
  const blocks = Array.from({ length: 10 }, (_, index) => index < Math.round(percent / 10));
  return (
    <div className="rounded-[16px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.035] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-white">{label}</p>
        <span className="text-xs text-[color:var(--ptl-text-muted)]">{boundedValue}/{boundedMax}</span>
      </div>
      <div className="grid grid-cols-10 gap-1" aria-label={`${label} ${percent}% complete`}>
        {blocks.map((filled, index) => <span key={index} className={`h-3 rounded-full ${filled ? "bg-[color:var(--ptl-cyan)] shadow-[var(--ptl-glow-cyan)]" : "bg-white/10"}`} />)}
      </div>
    </div>
  );
}

function TrustMeter({ value }: { value: number }) {
  const bounded = Math.max(0, Math.min(5, value));
  return (
    <div className="mt-3" aria-label={`Trust level ${bounded} of 5`}>
      <div className="mb-1 flex items-center justify-between gap-3 text-xs text-[color:var(--ptl-text-muted)]">
        <span>Trust</span>
        <span>{bounded}/5</span>
      </div>
      <div className="grid grid-cols-5 gap-1">
        {Array.from({ length: 5 }, (_, index) => <span key={index} className={`h-2 rounded-full ${index < bounded ? "bg-[color:var(--ptl-violet-soft)] shadow-[var(--ptl-glow-violet)]" : "bg-white/10"}`} />)}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[14px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.035] p-3">
      <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--ptl-text-muted)]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[14px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.035] p-3">
      <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--ptl-text-muted)]">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold text-white">{value}</p>
    </div>
  );
}

function ListArea({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-4 rounded-[16px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.035] p-4">
      <p className="font-semibold text-[color:var(--ptl-cyan-soft)]">{title}</p>
      <ul className="mt-2 grid gap-1 text-sm text-[color:var(--ptl-text-secondary)]">
        {items.length ? items.map((item) => <li key={item}>{item}</li>) : <li>Not set.</li>}
      </ul>
    </div>
  );
}

function EmptyLine({ text }: { text: string }) {
  return <p className="mt-4 rounded-[14px] border border-dashed border-[color:var(--ptl-border-subtle)] bg-white/[0.025] p-4 text-sm text-[color:var(--ptl-text-secondary)]">{text}</p>;
}
