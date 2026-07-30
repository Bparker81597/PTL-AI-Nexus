import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useClusterStore } from "../../app/useClusterStore";
import {
  EmptyState,
  GlassPanel,
  LoadingState,
  ModuleCard,
  OrbitDivider,
  ProductionContextIndicator,
  ProjectHero,
  PtlButton,
  SceneTimeline,
  SectionHeader,
  StatusBadge,
} from "../../components/ptl";
import { continueDestination, missingRequirements, nextTaskForScene, projectCompletion, recentCompletions, unresolvedBlockers } from "../../utils/productionIntelligence";

export function DashboardPage() {
  const navigate = useNavigate();
  const { assets, characters, episodes, locations, productionContext, projects, renderJobs, scenes, seasons, loading, setActiveScene } = useClusterStore();
  const activeProject = projects.find((project) => project.id === productionContext.activeProjectId) ?? projects.find((project) => project.id === "project-monster-truck") ?? projects[0];
  const projectScenes = activeProject ? scenes.filter((scene) => scene.projectId === activeProject.id) : [];
  const [selectedSceneId, setSelectedSceneId] = useState(productionContext.activeSceneId ?? projectScenes[0]?.id);
  const selectedScene = projectScenes.find((scene) => scene.id === selectedSceneId) ?? projectScenes[0];
  const activeEpisode = episodes.find((episode) => episode.id === productionContext.activeEpisodeId);
  const imageAssets = assets.filter((asset) => asset.type === "generated-image");
  const videoAssets = assets.filter((asset) => asset.type === "video");
  const audioAssets = assets.filter((asset) => asset.type === "audio");
  const activeJobs = renderJobs.filter((job) => ["queued", "preparing", "running"].includes(job.status));
  const nextTask = selectedScene ? nextTaskForScene(selectedScene, assets, renderJobs) : undefined;
  const blockers = unresolvedBlockers(projectScenes, episodes.filter((episode) => episode.projectId === activeProject?.id));
  const missing = selectedScene ? missingRequirements(selectedScene, assets, renderJobs) : [];
  const completions = recentCompletions(projectScenes, assets, renderJobs);
  const continueTo = continueDestination(productionContext, projectScenes, assets, renderJobs);

  if (loading) return <LoadingState label="Loading Mission Control..." />;
  if (!activeProject) {
    return (
      <EmptyState
        title="Choose a project to begin creating."
        message="Mission Control centers around an active production project."
        action={<Link to="/projects"><PtlButton>Open Projects</PtlButton></Link>}
      />
    );
  }

  return (
    <div className="grid gap-5">
      <ProductionContextIndicator context={productionContext} projects={projects} seasons={seasons} episodes={episodes} scenes={scenes} characters={characters} locations={locations} />
      <ProjectHero project={activeProject} scenes={projectScenes} assets={assets} characters={characters} />

      <GlassPanel>
        <SectionHeader eyebrow="Today's Focus" title={nextTask?.label ?? "Continue the active production"} />
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr_0.9fr]">
          <div>
            <p className="text-sm leading-6 text-[color:var(--ptl-text-secondary)]">
              {activeEpisode ? `Episode ${activeEpisode.number}: ${activeEpisode.title}` : "No episode selected"} · {selectedScene ? `Scene ${selectedScene.order}: ${selectedScene.title}` : "No scene selected"}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <PtlButton onClick={() => navigate(continueTo)}>Continue Production</PtlButton>
              {selectedScene && <PtlButton variant="secondary" onClick={() => navigate(`/projects/${activeProject.id}/episodes/${selectedScene.episodeId ?? ""}/scenes/${selectedScene.id}`)}>Open Scene Workspace</PtlButton>}
            </div>
          </div>
          <SignalPanel title="Blockers" items={blockers.map((blocker) => blocker.message)} empty="No unresolved blockers." />
          <SignalPanel title="Missing Requirements" items={missing.slice(0, 4)} empty="No missing requirements for the active scene." />
        </div>
      </GlassPanel>

      <SceneTimeline
        project={activeProject}
        scenes={projectScenes}
        assets={assets}
        jobs={renderJobs}
        characters={characters}
        selectedSceneId={selectedScene?.id}
        onSelect={(scene) => {
          setSelectedSceneId(scene.id);
          setActiveScene(scene.id);
        }}
      />

      {selectedScene && (
        <GlassPanel>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--ptl-cyan-soft)]">Selected Scene</p>
              <h2 className="mt-1 font-display text-xl font-semibold">{selectedScene.title}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[color:var(--ptl-text-secondary)]">{selectedScene.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <PtlButton variant="secondary" onClick={() => navigate(`/projects/${activeProject.id}`)}>Open Scene</PtlButton>
              <PtlButton variant="ghost" onClick={() => navigate(`/canvas?projectId=${activeProject.id}&sceneId=${selectedScene.id}`)}>Open in NovaCanvas</PtlButton>
              <PtlButton onClick={() => navigate(`/dreamframe?projectId=${activeProject.id}&sceneId=${selectedScene.id}`)}>Animate Scene</PtlButton>
            </div>
          </div>
        </GlassPanel>
      )}

      <section>
        <SectionHeader eyebrow="Creative Modules" title="Production tools" />
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          <ModuleCard title="Character Studio" description="Manage Brooklyn, Maddie, Layla, Maize, outfits, expressions, and consistency prompts." summary={`${characters.length} characters`} href="/characters" tone="violet" icon="characters">
            <div className="flex -space-x-2">{characters.slice(0, 4).map((character) => <span key={character.id} className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-violet-300/20 text-xs font-semibold">{character.name.slice(0, 1)}</span>)}</div>
          </ModuleCard>
          <ModuleCard title="NovaCanvas" description="Generate project and scene-linked concept images." summary={`${imageAssets.length} image assets`} href="/canvas" tone="cyan" icon="canvas">
            <MiniPreview count={imageAssets.length} />
          </ModuleCard>
          <ModuleCard title="DreamFrame" description="Animate scene source images into simulated clips." summary={`${videoAssets.length} clip assets`} href="/dreamframe" tone="blue" icon="dreamframe">
            <MiniPreview count={videoAssets.length} />
          </ModuleCard>
          <ModuleCard title="NovaTone" description="Create dialogue, music cues, and production audio." summary={`${audioAssets.length} audio assets`} href="/novatone" tone="magenta" icon="novatone">
            <Waveform />
          </ModuleCard>
          <ModuleCard title="Render Queue" description="Track generation jobs from queued to complete." summary={`${activeJobs.length} active jobs`} href="/render-queue" tone="blue" icon="queue">
            <div className="flex items-center gap-2"><StatusBadge status={activeJobs.length ? "Rendering" : "Ready"} /><span className="text-sm text-[color:var(--ptl-text-secondary)]">{renderJobs.length} total</span></div>
          </ModuleCard>
          <ModuleCard title="Asset Library" description="Browse all generated images, clips, references, and audio." summary={`${assets.length} total assets`} href="/assets" tone="cyan" icon="assets">
            <MiniPreview count={assets.length} />
          </ModuleCard>
        </div>
      </section>

      <GlassPanel>
        <SectionHeader eyebrow="Nexus Ecosystem" title="Brand hierarchy" />
        <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr_1fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--ptl-text-muted)]">Parent company</p>
            <p className="mt-2 font-display text-xl font-semibold">Parker Tech Labs</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--ptl-text-muted)]">Creative operating system</p>
            <p className="mt-2 font-display text-xl font-semibold">PTL AI Nexus</p>
            <p className="text-sm text-[color:var(--ptl-text-secondary)]">A Creative Universe</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--ptl-text-muted)]">Future modules</p>
            <p className="mt-2 text-sm text-[color:var(--ptl-text-secondary)]">CodeVerse and NovaKart have reserved identity slots for the broader Parker Tech Labs ecosystem.</p>
          </div>
        </div>
        <OrbitDivider className="my-5" />
        <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--ptl-text-secondary)]">
          {["Character Studio", "NovaCanvas", "DreamFrame", "NovaTone", "CodeVerse", "NovaKart", "Projects", "Timeline", "Scenes", "Assets", "AI Engines"].map((item) => (
            <span key={item} className="rounded-[10px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.035] px-3 py-2">{item}</span>
          ))}
        </div>
      </GlassPanel>

      <GlassPanel>
        <SectionHeader eyebrow="Production Health" title="Repository-driven metrics" />
        <div className="grid gap-3 md:grid-cols-4">
          <MetricTile label="Project Progress" value={`${projectCompletion(activeProject, projectScenes)}%`} />
          <MetricTile label="Scenes Complete" value={`${projectScenes.filter((scene) => scene.status === "completed").length}/${projectScenes.length}`} />
          <MetricTile label="Linked Assets" value={assets.filter((asset) => asset.projectId === activeProject.id).length} />
          <MetricTile label="Render Jobs" value={renderJobs.filter((job) => job.projectId === activeProject.id).length} />
        </div>
      </GlassPanel>

      <GlassPanel>
        <SectionHeader eyebrow="Recent Completions" title="What changed recently" />
        <div className="grid gap-2">
          {completions.map((item) => <p key={item} className="rounded-xl bg-white/[0.04] p-3 text-sm text-[color:var(--ptl-text-secondary)]">{item}</p>)}
        </div>
      </GlassPanel>
    </div>
  );
}

function MetricTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[16px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.035] p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--ptl-text-muted)]">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold">{value}</p>
    </div>
  );
}

function MiniPreview({ count }: { count: number }) {
  return (
    <div className="grid h-12 grid-cols-4 gap-1">
      {Array.from({ length: 4 }, (_, index) => (
        <span key={index} className={`rounded-[10px] border border-white/10 ${index < Math.min(count, 4) ? "bg-[image:var(--ptl-gradient-primary)] opacity-80" : "bg-white/[0.04]"}`} />
      ))}
    </div>
  );
}

function Waveform() {
  return (
    <div className="flex h-12 items-end gap-1">
      {Array.from({ length: 20 }, (_, index) => <span key={index} className="flex-1 rounded-full bg-[color:var(--ptl-violet-soft)]/70" style={{ height: `${14 + ((index * 11) % 30)}px` }} />)}
    </div>
  );
}

function SignalPanel({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return (
    <div className="rounded-[16px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.035] p-4">
      <h3 className="font-display text-base font-semibold">{title}</h3>
      <div className="mt-3 grid gap-2">
        {items.length ? items.map((item) => <p key={item} className="text-sm text-[color:var(--ptl-text-secondary)]">{item}</p>) : <p className="text-sm text-[color:var(--ptl-text-muted)]">{empty}</p>}
      </div>
    </div>
  );
}
