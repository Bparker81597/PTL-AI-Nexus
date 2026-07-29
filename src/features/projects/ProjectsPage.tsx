import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { useClusterStore } from "../../app/useClusterStore";
import { FeaturePanel, GlassPanel, MediaPreview, PageHeader, PtlButton, PtlField, PtlInput, PtlSelect, PtlTextarea, StatusBadge } from "../../components/ptl";
import { projectProgress } from "../../utils/projectMetrics";

export function ProjectsPage() {
  const { projects, characters, assets, scenes, createProject } = useClusterStore();
  const [name, setName] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    await createProject({ name, description: "New creator project", type: "mixed" });
    setName("");
  };

  return (
    <div className="grid gap-5">
      <PageHeader eyebrow="Projects" title="Production portfolio" />
      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <GlassPanel>
          <h3 className="mb-4 font-display text-xl font-semibold">Start new project</h3>
          <form className="grid gap-4" onSubmit={submit}>
            <PtlField label="Project name"><PtlInput value={name} onChange={(event) => setName(event.target.value)} /></PtlField>
            <PtlField label="Description"><PtlTextarea defaultValue="Characters, images, clips, audio, storyboards, scenes, and render jobs." /></PtlField>
            <PtlField label="Type"><PtlSelect defaultValue="mixed"><option>mixed</option><option>character</option><option>image</option><option>video</option><option>audio</option></PtlSelect></PtlField>
            <PtlButton type="submit">Create Project</PtlButton>
          </form>
        </GlassPanel>
        <div className="grid gap-5">
          {projects.map((project) => {
            const projectScenes = scenes.filter((scene) => scene.projectId === project.id);
            const projectAssets = assets.filter((asset) => asset.projectId === project.id);
            const artwork = projectAssets.find((asset) => asset.type === "generated-image") ?? projectAssets[0];
            return (
              <FeaturePanel key={project.id}>
                <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
                  <MediaPreview src={artwork?.url} alt={`${project.name} artwork`} className="aspect-video" />
                  <div>
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <Link to={`/projects/${project.id}`} className="font-display text-2xl font-semibold hover:text-[color:var(--ptl-cyan)]">{project.name}</Link>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--ptl-text-secondary)]">{project.description}</p>
                      </div>
                      <StatusBadge status={project.status} />
                    </div>
                    <div className="mt-5 grid gap-3 md:grid-cols-4">
                      <Metric label="Scenes" value={projectScenes.length} />
                      <Metric label="Assets" value={projectAssets.length} />
                      <Metric label="Characters" value={characters.filter((character) => project.characterIds.includes(character.id)).length} />
                      <Metric label="Progress" value={`${projectProgress(projectScenes)}%`} />
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <Link to={`/projects/${project.id}`}><PtlButton>Open Project</PtlButton></Link>
                      <PtlButton variant="ghost">Archive</PtlButton>
                    </div>
                  </div>
                </div>
              </FeaturePanel>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[14px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.035] p-3">
      <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--ptl-text-muted)]">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold">{value}</p>
    </div>
  );
}
