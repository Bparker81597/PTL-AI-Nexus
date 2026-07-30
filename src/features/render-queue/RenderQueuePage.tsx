import { Link, useSearchParams } from "react-router-dom";
import { useClusterStore } from "../../app/useClusterStore";
import { Button, Card, Field, PageHeader, StatusBadge, inputClass } from "../../components/Ui";
import type { GenerationType, RenderStatus } from "../../types/domain";

const generationTypes: Array<GenerationType | "all"> = ["all", "image", "image-to-video", "text-to-video", "voice", "music", "sound-effect"];
const statuses: Array<RenderStatus | "all"> = ["all", "queued", "preparing", "running", "completed", "failed", "cancelled"];

export function RenderQueuePage() {
  const [params, setParams] = useSearchParams();
  const { renderJobs, projects, scenes, assets, characters, productionContext, cancelJob, retryJob } = useClusterStore();
  const projectId = params.get("projectId") ?? productionContext.activeProjectId ?? "all";
  const generationType = params.get("generationType") ?? "all";
  const status = params.get("status") ?? "all";
  const sceneId = params.get("sceneId") ?? (projectId === "all" ? "all" : productionContext.activeSceneId ?? "all");

  const filtered = renderJobs.filter((job) => {
    const projectMatches = projectId === "all" || job.projectId === projectId;
    const typeMatches = generationType === "all" || job.generationType === generationType;
    const statusMatches = status === "all" || job.status === status;
    const sceneMatches = sceneId === "all" || job.sceneId === sceneId;
    return projectMatches && typeMatches && statusMatches && sceneMatches;
  });

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value === "all") next.delete(key);
    else next.set(key, value);
    setParams(next);
  };

  return (
    <>
      <PageHeader eyebrow="Render Queue" title="Job processing" />
      <Card className="mb-4">
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="Filter by project">
            <select className={inputClass} value={projectId} onChange={(event) => updateFilter("projectId", event.target.value)}>
              <option value="all">All projects</option>
              {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
            </select>
          </Field>
          <Field label="Filter by generation type">
            <select className={inputClass} value={generationType} onChange={(event) => updateFilter("generationType", event.target.value)}>
              {generationTypes.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </Field>
          <Field label="Filter by status">
            <select className={inputClass} value={status} onChange={(event) => updateFilter("status", event.target.value)}>
              {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </Field>
          <Field label="Filter by scene">
            <select className={inputClass} value={sceneId} onChange={(event) => updateFilter("sceneId", event.target.value)}>
              <option value="all">All scenes</option>
              {scenes.filter((scene) => projectId === "all" || scene.projectId === projectId).map((scene) => <option key={scene.id} value={scene.id}>{scene.order}. {scene.title}</option>)}
            </select>
          </Field>
        </div>
        <button
          type="button"
          className="focus-ring mt-3 text-sm font-semibold text-cyan-100"
          onClick={() => {
            const next = new URLSearchParams();
            next.set("projectId", "all");
            next.set("sceneId", "all");
            setParams(next);
          }}
        >
          View full queue
        </button>
      </Card>
      <Card>
        <div className="grid gap-3">
          {filtered.map((job) => {
            const scene = scenes.find((item) => item.id === job.sceneId);
            const source = assets.find((asset) => job.sourceAssetIds?.includes(asset.id));
            const output = assets.find((asset) => job.outputAssetIds.includes(asset.id));
            const jobCharacters = characters.filter((character) => job.request.characterIds?.includes(character.id));
            return (
              <div key={job.id} className="grid gap-4 rounded-xl bg-white/7 p-4 xl:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_1fr_auto] xl:items-center">
                <div>
                  <strong>{job.name}</strong>
                  <p className="text-sm text-slate-300">{job.projectName ?? "No project"}</p>
                  {scene && <p className="text-xs text-cyan-100">Scene: {scene.title}</p>}
                  {jobCharacters.length > 0 && <p className="text-xs text-slate-300">Characters: {jobCharacters.map((character) => character.name).join(", ")}</p>}
                </div>
                <span className="font-bold">{job.generationType}</span>
                <span>{job.providerId}</span>
                <StatusBadge status={job.status} />
                <div>
                  <div className="h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-cyan-300" style={{ width: `${job.progress}%` }} /></div>
                  <p className="mt-1 text-xs text-slate-300">{job.progress}% - {job.estimatedCompletion}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => void cancelJob(job.id)}>Cancel</Button>
                  <Button variant="secondary" onClick={() => void retryJob(job.id)}>Retry</Button>
                  {source && <Link to="/assets"><Button variant="secondary">View Source</Button></Link>}
                  {output && <Link to="/assets"><Button variant="secondary">View Output</Button></Link>}
                  {job.projectId && <Link to={`/projects/${job.projectId}`}><Button variant="secondary">Open Project</Button></Link>}
                  {scene && <Link to={`/projects/${scene.projectId}/episodes/${scene.episodeId ?? ""}/scenes/${scene.id}`}><Button variant="secondary">Open Scene</Button></Link>}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <p className="text-slate-300">No render jobs match the selected filters.</p>}
        </div>
      </Card>
    </>
  );
}
