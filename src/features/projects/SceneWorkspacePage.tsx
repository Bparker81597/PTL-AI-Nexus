import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useClusterStore } from "../../app/useClusterStore";
import { Button, Card, Field, PageHeader, StatusBadge, inputClass, textareaClass } from "../../components/Ui";
import { ProductionContextIndicator, PtlProgress } from "../../components/ptl";
import type { ProductionPhase, SceneStageProgress, SceneStageState } from "../../types/domain";
import { missingRequirements, nextTaskForScene, productionStageLabels, sceneCompletion } from "../../utils/productionIntelligence";

const phases: ProductionPhase[] = ["concept", "writing", "preproduction", "storyboard", "visual-development", "animation", "audio", "rendering", "review", "completed"];
const stageStates: SceneStageState[] = ["not-started", "in-progress", "blocked", "ready-for-review", "approved", "completed"];
const stageOrder: Array<keyof SceneStageProgress> = ["story", "storyboard", "visualAssets", "animation", "voice", "music", "soundEffects", "finalRender", "review"];

export function SceneWorkspacePage() {
  const { projectId, episodeId, sceneId } = useParams();
  const navigate = useNavigate();
  const {
    assets,
    characters,
    episodes,
    locations,
    productionContext,
    projects,
    renderJobs,
    scenes,
    seasons,
    setActiveScene,
    updateScene,
  } = useClusterStore();
  const scene = scenes.find((item) => item.id === sceneId);
  const project = projects.find((item) => item.id === projectId);
  const episode = episodes.find((item) => item.id === episodeId);
  const [notes, setNotes] = useState(scene?.notes ?? "");

  useEffect(() => {
    if (sceneId) setActiveScene(sceneId);
  }, [sceneId, setActiveScene]);

  useEffect(() => {
    setNotes(scene?.notes ?? "");
  }, [scene?.id, scene?.notes]);

  if (!scene || !project) {
    return <Card><p>Scene not found.</p><Link className="text-cyan-200 underline" to="/projects">Back to projects</Link></Card>;
  }

  const sceneAssets = assets.filter((asset) => asset.sceneId === scene.id);
  const sceneJobs = renderJobs.filter((job) => job.sceneId === scene.id);
  const sceneCharacters = characters.filter((character) => scene.characterIds.includes(character.id));
  const location = locations.find((item) => item.id === scene.locationId);
  const next = nextTaskForScene(scene, assets, renderJobs);
  const missing = missingRequirements(scene, assets, renderJobs);

  const saveStage = (stage: keyof SceneStageProgress, state: SceneStageState) =>
    updateScene({ ...scene, stageProgress: { ...scene.stageProgress, [stage]: state } });

  const saveScenePatch = (patch: Partial<typeof scene>) => updateScene({ ...scene, ...patch });

  const openModule = (module: "canvas" | "dreamframe" | "novatone" | "render-queue") => {
    const query = `projectId=${project.id}&episodeId=${episode?.id ?? ""}&sceneId=${scene.id}`;
    if (module === "canvas") navigate(`/canvas?${query}`);
    if (module === "dreamframe") navigate(`/dreamframe?${query}`);
    if (module === "novatone") navigate(`/novatone?${query}`);
    if (module === "render-queue") navigate(`/render-queue?${query}`);
  };

  return (
    <>
      <PageHeader eyebrow={`Episode ${episode?.number ?? ""} Scene ${scene.order}`} title={scene.title}>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => openModule(next.module === "projects" ? "canvas" : next.module)}>Continue Task</Button>
          <Button variant="secondary" onClick={() => openModule("canvas")}>Open NovaCanvas</Button>
          <Button variant="secondary" onClick={() => openModule("dreamframe")}>Open DreamFrame</Button>
          <Button variant="secondary" onClick={() => openModule("novatone")}>Open NovaTone</Button>
          <Button variant="secondary" onClick={() => openModule("render-queue")}>Render Queue</Button>
        </div>
      </PageHeader>

      <ProductionContextIndicator context={productionContext} projects={projects} seasons={seasons} episodes={episodes} scenes={scenes} characters={characters} locations={locations} className="mb-4" />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_360px]">
        <div className="grid gap-4">
          <Card>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">Scene Workspace</p>
                <p className="mt-2 max-w-3xl text-slate-300">{scene.description}</p>
              </div>
              <StatusBadge status={scene.productionPhase ?? scene.status} />
            </div>
            <div className="mt-4">
              <PtlProgress value={sceneCompletion(scene)} label={`${sceneCompletion(scene)}% scene completion`} />
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <Info label="Episode" value={episode ? `Episode ${episode.number}: ${episode.title}` : "Unassigned"} />
              <Info label="Location" value={location?.name ?? scene.location} />
              <Info label="Next task" value={next.label} />
            </div>
          </Card>

          <Card>
            <h2 className="font-display text-xl font-semibold">Production Stages</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {stageOrder.map((stage) => (
                <Field key={stage} label={productionStageLabels[stage]}>
                  <select className={inputClass} value={scene.stageProgress?.[stage] ?? "not-started"} onChange={(event) => void saveStage(stage, event.target.value as SceneStageState)}>
                    {stageStates.map((state) => <option key={state} value={state}>{state}</option>)}
                  </select>
                </Field>
              ))}
            </div>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <ProductionArea title="Story" items={[scene.objective ?? scene.action, scene.dialogue || "Dialogue not set."]} />
            <ProductionArea title="Characters" items={sceneCharacters.map((character) => `${character.name} - ${character.role ?? "Character"}`)} />
            <ProductionArea title="Location" items={[location?.description ?? scene.location, location?.visualNotes ?? "Location visual notes not set."]} />
            <ProductionArea title="Storyboard" items={[`Status: ${scene.stageProgress?.storyboard ?? "not-started"}`, `${sceneAssets.filter((asset) => asset.type === "storyboard").length} storyboard assets`]} />
            <ProductionArea title="Visual Assets" items={sceneAssets.filter((asset) => asset.type === "generated-image" || asset.type === "character-reference").map((asset) => asset.name)} empty="No visual assets linked." />
            <ProductionArea title="Animation" items={sceneAssets.filter((asset) => asset.type === "video").map((asset) => asset.name)} empty="No clips linked." />
            <ProductionArea title="Dialogue and Voice" items={sceneAssets.filter((asset) => asset.type === "audio").map((asset) => asset.name)} empty="No voice clips linked." />
            <ProductionArea title="Music and Sound" items={[`Music: ${scene.stageProgress?.music ?? "not-started"}`, `Sound effects: ${scene.stageProgress?.soundEffects ?? "not-started"}`]} />
            <ProductionArea title="Render and Review" items={[`${sceneJobs.length} render jobs`, `Approval: ${scene.approvalState ?? "not-ready"}`]} />
          </div>
        </div>

        <aside className="grid gap-4">
          <Card>
            <h2 className="font-display text-xl font-semibold">Controls</h2>
            <div className="mt-4 grid gap-3">
              <Field label="Production phase">
                <select className={inputClass} value={scene.productionPhase ?? "storyboard"} onChange={(event) => void saveScenePatch({ productionPhase: event.target.value as ProductionPhase })}>
                  {phases.map((phase) => <option key={phase} value={phase}>{phase}</option>)}
                </select>
              </Field>
              <Field label="Location">
                <select className={inputClass} value={scene.locationId ?? ""} onChange={(event) => {
                  const nextLocation = locations.find((item) => item.id === event.target.value);
                  void saveScenePatch({ locationId: nextLocation?.id, location: nextLocation?.name ?? scene.location });
                }}>
                  <option value="">No location selected</option>
                  {locations.filter((item) => item.projectId === project.id).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </Field>
              <Field label="Approval state">
                <select className={inputClass} value={scene.approvalState ?? "not-ready"} onChange={(event) => void saveScenePatch({ approvalState: event.target.value as typeof scene.approvalState })}>
                  <option value="not-ready">not-ready</option>
                  <option value="needs-review">needs-review</option>
                  <option value="approved">approved</option>
                  <option value="changes-requested">changes-requested</option>
                </select>
              </Field>
              <Field label="Production notes">
                <textarea className={textareaClass} value={notes} onChange={(event) => setNotes(event.target.value)} />
              </Field>
              <Button onClick={() => void saveScenePatch({ notes })}>Save Notes</Button>
            </div>
          </Card>
          <Card>
            <h2 className="font-display text-xl font-semibold">Blockers</h2>
            <div className="mt-3 grid gap-2">
              {(scene.blockers ?? []).filter((blocker) => !blocker.resolved).map((blocker) => (
                <div key={blocker.id} className="rounded-xl border border-amber-300/30 bg-amber-300/10 p-3 text-sm text-amber-100">{blocker.message}</div>
              ))}
              {missing.map((item) => <div key={item} className="rounded-xl bg-white/[0.04] p-3 text-sm text-slate-300">{item}</div>)}
              {!(scene.blockers ?? []).length && !missing.length && <p className="text-sm text-slate-300">No blockers detected.</p>}
            </div>
          </Card>
        </aside>
      </div>
    </>
  );
}

function Info({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-[14px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.035] p-3"><p className="text-xs uppercase tracking-[0.14em] text-[color:var(--ptl-text-muted)]">{label}</p><p className="mt-1 text-sm font-semibold text-white">{value}</p></div>;
}

function ProductionArea({ title, items, empty = "Not started." }: { title: string; items: string[]; empty?: string }) {
  const filtered = items.filter(Boolean);
  return (
    <Card>
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <div className="mt-3 grid gap-2">
        {filtered.length ? filtered.map((item) => <p key={item} className="rounded-xl bg-white/[0.04] p-3 text-sm text-slate-300">{item}</p>) : <p className="text-sm text-slate-300">{empty}</p>}
      </div>
    </Card>
  );
}
