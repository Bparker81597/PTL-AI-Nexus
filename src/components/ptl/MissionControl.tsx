import { Link, useNavigate } from "react-router-dom";
import type { Asset, Character, Project, RenderJob, Scene } from "../../types/domain";
import { projectProgress } from "../../utils/projectMetrics";
import { FeaturePanel, GlassPanel, MetricChip, PtlButton, PtlProgress, SectionHeader, StatusBadge, StatusDot } from "./primitives";
import { MediaPreview } from "./MediaPreview";
import { ModuleGlyph, OrbitDivider, type ModuleKey } from "./brand";

const statusForScene = (scene: Scene, jobs: RenderJob[]): string => {
  const sceneJobs = jobs.filter((job) => job.sceneId === scene.id);
  if (sceneJobs.some((job) => job.status === "failed")) return "Failed";
  if (sceneJobs.some((job) => job.status === "running" || job.status === "preparing")) return "Rendering";
  if (sceneJobs.some((job) => job.status === "queued")) return "Queued";
  if (scene.status === "completed") return "Complete";
  if (scene.status === "image-ready") return "Ready";
  return "Planned";
};

export function ProjectHero({
  project,
  scenes,
  assets,
  characters,
}: {
  project: Project;
  scenes: Scene[];
  assets: Asset[];
  characters: Character[];
}) {
  const artwork = assets.find((asset) => asset.projectId === project.id && asset.type === "generated-image") ?? assets.find((asset) => asset.projectId === project.id);
  const progress = projectProgress(scenes);
  const isPtlCrew = project.seriesId === "ptl-crew";
  const heroTitle = isPtlCrew ? "PTL Crew" : project.name;
  const currentProject = isPtlCrew ? "Series Foundation" : project.name;
  const currentFocus = isPtlCrew ? "Character Bible and Pilot Development" : "Production assembly";
  const progressAreas = isPtlCrew
    ? ["Brand Identity", "Character Bibles", "Pilot Story", "Visual Development", "Animation Tests", "Voice Development"]
    : project.productionGoals ?? [];
  return (
    <FeaturePanel className="grid min-w-0 gap-5 p-4 sm:p-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(260px,0.95fr)]">
      <div className="relative z-10 flex min-w-0 flex-col justify-between gap-6 sm:gap-8">
        <div>
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--ptl-cyan-soft)]">
            <StatusDot tone="cyan" pulse />
            Active Project
          </div>
          <p className="mb-2 text-sm font-medium text-[color:var(--ptl-violet-soft)]">{project.brand ?? "A Creative Universe"}</p>
          <h2 className="break-words font-display text-[26px] font-semibold leading-tight md:text-[38px]">{heroTitle}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--ptl-text-secondary)] md:text-base">{project.description}</p>
          <p className="mt-4 max-w-xl text-sm font-medium text-white">{project.tagline ?? "One platform. Infinite creativity. Everything connects."}</p>
          <div className="mt-4 grid gap-2 text-sm text-[color:var(--ptl-text-secondary)] sm:grid-cols-2">
            <p><strong className="text-white">Current project:</strong> {currentProject}</p>
            <p><strong className="text-white">Current focus:</strong> {currentFocus}</p>
          </div>
        </div>
        <div className="grid gap-2 sm:flex sm:flex-wrap">
          <Link className="min-w-0" to={`/projects/${project.id}`}><PtlButton className="w-full sm:w-auto">Continue Production</PtlButton></Link>
          <Link className="min-w-0" to="/characters"><PtlButton className="w-full sm:w-auto" variant="secondary">View Characters</PtlButton></Link>
          <Link className="min-w-0" to={`/projects/${project.id}`}><PtlButton className="w-full sm:w-auto" variant="secondary">Open Project</PtlButton></Link>
          <Link className="min-w-0" to={`/projects/${project.id}`}><PtlButton className="w-full sm:w-auto" variant="ghost">Create Scene</PtlButton></Link>
        </div>
        <OrbitDivider />
        {progressAreas.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {progressAreas.map((area) => (
              <span key={area} className="rounded-[10px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.035] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--ptl-text-secondary)]">{area}</span>
            ))}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricChip label="Scenes" value={scenes.length} />
          <MetricChip label="Assets" value={assets.filter((asset) => asset.projectId === project.id).length} tone="violet" />
          <MetricChip label="Characters" value={characters.filter((character) => project.characterIds.includes(character.id)).length} />
          <MetricChip label="Progress" value={`${progress}%`} tone="success" />
        </div>
      </div>
      <div className="relative min-h-[240px] min-w-0 overflow-hidden rounded-[22px] border border-[color:var(--ptl-border-subtle)] sm:min-h-[300px]">
        {artwork ? (
          <MediaPreview src={artwork.url} alt={`${project.name} project artwork`} className="h-full min-h-[240px] sm:min-h-[300px]" />
        ) : (
          <div className="h-full min-h-[300px] bg-[image:var(--ptl-gradient-primary)] opacity-70" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050b18]/85 via-[#050b18]/22 to-transparent" />
        <div className="absolute right-3 top-3 rounded-full border border-[color:var(--ptl-border-active)] bg-[#050b18]/45 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--ptl-cyan-soft)] backdrop-blur-md sm:right-6 sm:top-6 sm:text-xs">Nexus Film Desk</div>
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--ptl-text-secondary)]">Current Phase</p>
          <PtlProgress value={progress} label={`${progress}% episode assembly`} />
        </div>
      </div>
    </FeaturePanel>
  );
}

export function SceneTimeline({
  project,
  scenes,
  assets,
  jobs,
  characters,
  selectedSceneId,
  onSelect,
}: {
  project: Project;
  scenes: Scene[];
  assets: Asset[];
  jobs: RenderJob[];
  characters?: Character[];
  selectedSceneId?: string;
  onSelect?: (scene: Scene) => void;
}) {
  const navigate = useNavigate();
  const ordered = scenes.filter((scene) => scene.projectId === project.id).sort((a, b) => a.order - b.order);
  return (
    <GlassPanel className="min-w-0 overflow-hidden">
      <SectionHeader
        eyebrow="Production Timeline"
        title="Scene sequence"
        action={<Link to={`/projects/${project.id}`}><PtlButton variant="ghost">Open Storyboard</PtlButton></Link>}
      />
      <div className="overflow-x-auto pb-2" aria-label="Scrollable scene timeline">
        <div className="relative flex min-w-max gap-3 before:absolute before:left-8 before:right-8 before:top-[102px] before:h-px before:bg-gradient-to-r before:from-[color:var(--ptl-cyan)]/30 before:via-[color:var(--ptl-violet)]/35 before:to-transparent">
          {ordered.map((scene) => {
            const thumbnail = assets.find((asset) => asset.id === scene.sourceImageAssetId || asset.id === scene.outputVideoAssetId);
            const sceneCharacters = (characters ?? []).filter((character) => scene.characterIds.includes(character.id));
            const selected = scene.id === selectedSceneId;
            const status = statusForScene(scene, jobs);
            return (
              <button
                key={scene.id}
                type="button"
                onClick={() => onSelect?.(scene)}
                onDoubleClick={() => navigate(`/projects/${project.id}`)}
                className={`focus-ring group relative w-[78vw] max-w-[260px] rounded-[18px] border p-3 text-left transition duration-200 hover:-translate-y-1 sm:w-[240px] ${
                  selected ? "border-[color:var(--ptl-border-active)] bg-[color:var(--ptl-bg-hover)] shadow-[var(--ptl-glow-cyan)]" : "border-[color:var(--ptl-border-subtle)] bg-white/[0.035]"
                }`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--ptl-cyan-soft)]">Scene {scene.order}</span>
                  <StatusBadge status={status} />
                </div>
                <MediaPreview src={thumbnail?.url} alt={`${scene.title} thumbnail`} className="mb-3 aspect-video" />
                <h3 className="line-clamp-2 font-display text-base font-semibold">{scene.title}</h3>
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-[color:var(--ptl-text-secondary)]">{scene.description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {sceneCharacters.map((character) => (
                    <span key={character.id} className="rounded-[8px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.045] px-2 py-1 text-[11px] font-semibold text-[color:var(--ptl-text-secondary)]">
                      {character.name}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-[11px] text-[color:var(--ptl-text-muted)]">{scene.location} · {scene.emotion}</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <PtlProgress value={status === "Complete" ? 100 : status === "Ready" ? 55 : status === "Rendering" ? 70 : 18} />
                  <span className="text-right text-xs text-[color:var(--ptl-text-muted)]">{scene.duration}s</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </GlassPanel>
  );
}

export function ModuleCard({
  title,
  description,
  summary,
  href,
  tone = "cyan",
  icon,
  children,
}: {
  title: string;
  description: string;
  summary: string;
  href: string;
  tone?: "cyan" | "violet" | "blue" | "magenta";
  icon?: ModuleKey;
  children?: React.ReactNode;
}) {
  const toneMap = {
    cyan: "from-cyan-300/20 to-blue-400/10 border-cyan-200/20",
    violet: "from-violet-300/20 to-fuchsia-400/10 border-violet-200/20",
    blue: "from-sky-300/20 to-violet-400/10 border-sky-200/20",
    magenta: "from-fuchsia-300/20 to-violet-400/10 border-fuchsia-200/20",
  };
  return (
    <Link to={href} className={`focus-ring group rounded-[20px] border bg-gradient-to-br p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--ptl-glow-cyan)] ${toneMap[tone]}`}>
      <div className="flex min-h-[150px] flex-col justify-between">
        <div>
          <div className="mb-3 flex items-center gap-3">
            {icon && <span className="grid h-10 w-10 place-items-center rounded-[14px] border border-white/10 bg-white/[0.055] text-[color:var(--ptl-cyan-soft)]"><ModuleGlyph module={icon} className="h-5 w-5" /></span>}
            <h3 className="font-display text-lg font-semibold">{title}</h3>
          </div>
          <p className="mt-2 text-sm leading-5 text-[color:var(--ptl-text-secondary)]">{description}</p>
        </div>
        <div className="mt-4">
          {children}
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--ptl-text-muted)]">{summary}</p>
        </div>
      </div>
    </Link>
  );
}
