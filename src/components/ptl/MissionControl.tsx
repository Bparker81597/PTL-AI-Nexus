import { Link, useNavigate } from "react-router-dom";
import type { Asset, Character, Project, RenderJob, Scene } from "../../types/domain";
import { projectProgress } from "../../utils/projectMetrics";
import { FeaturePanel, GlassPanel, MetricChip, PtlButton, PtlProgress, SectionHeader, StatusBadge, StatusDot } from "./primitives";
import { MediaPreview } from "./MediaPreview";

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
  return (
    <FeaturePanel className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(260px,0.95fr)]">
      <div className="relative z-10 flex min-w-0 flex-col justify-between gap-8">
        <div>
          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--ptl-cyan-soft)]">
            <StatusDot tone="cyan" pulse />
            Active Project
          </div>
          <h2 className="break-words font-display text-[28px] font-semibold leading-tight md:text-[34px]">{project.name}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--ptl-text-secondary)] md:text-base">{project.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={`/projects/${project.id}`}><PtlButton>Open Project</PtlButton></Link>
          <Link to={`/projects/${project.id}`}><PtlButton variant="secondary">New Scene</PtlButton></Link>
          <PtlButton variant="ghost">Export Episode</PtlButton>
        </div>
        <div className="grid gap-3 sm:grid-cols-4">
          <MetricChip label="Scenes" value={scenes.length} />
          <MetricChip label="Assets" value={assets.filter((asset) => asset.projectId === project.id).length} tone="violet" />
          <MetricChip label="Characters" value={characters.filter((character) => project.characterIds.includes(character.id)).length} />
          <MetricChip label="Progress" value={`${progress}%`} tone="success" />
        </div>
      </div>
      <div className="relative min-h-[260px] min-w-0 overflow-hidden rounded-[22px] border border-[color:var(--ptl-border-subtle)]">
        {artwork ? (
          <MediaPreview src={artwork.url} alt={`${project.name} project artwork`} className="h-full min-h-[260px]" />
        ) : (
          <div className="h-full min-h-[260px] bg-[image:var(--ptl-gradient-primary)] opacity-70" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050b18]/80 via-[#050b18]/20 to-transparent" />
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
  selectedSceneId,
  onSelect,
}: {
  project: Project;
  scenes: Scene[];
  assets: Asset[];
  jobs: RenderJob[];
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
      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-max gap-3">
          {ordered.map((scene) => {
            const thumbnail = assets.find((asset) => asset.id === scene.sourceImageAssetId || asset.id === scene.outputVideoAssetId);
            const selected = scene.id === selectedSceneId;
            const status = statusForScene(scene, jobs);
            return (
              <button
                key={scene.id}
                type="button"
                onClick={() => onSelect?.(scene)}
                onDoubleClick={() => navigate(`/projects/${project.id}`)}
                className={`focus-ring group w-[240px] rounded-[18px] border p-3 text-left transition duration-200 hover:-translate-y-0.5 ${
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
  children,
}: {
  title: string;
  description: string;
  summary: string;
  href: string;
  tone?: "cyan" | "violet" | "blue" | "magenta";
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
          <h3 className="font-display text-lg font-semibold">{title}</h3>
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
