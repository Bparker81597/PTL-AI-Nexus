import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useClusterStore } from "../../app/useClusterStore";
import { Button, Card, Field, PageHeader, StatusBadge, inputClass, textareaClass } from "../../components/Ui";
import { ProductionContextIndicator, PtlProgress } from "../../components/ptl";
import type { Scene } from "../../types/domain";
import { continueDestination, episodeCompletion, nextTaskForScene, projectCompletion, unresolvedBlockers } from "../../utils/productionIntelligence";

const tabs = ["Overview", "Characters", "Storyboard", "Scenes", "Images", "Clips", "Audio", "Render Jobs", "Activity"] as const;

export function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const {
    projects,
    characters,
    assets,
    episodes,
    locations,
    productionContext,
    renderJobs,
    scenes,
    seasons,
    setActiveEpisode,
    setActiveProject,
    setActiveScene,
    createScene,
    updateScene,
    deleteScene,
    duplicateScene,
    reorderScene,
    addCharacterToProject,
  } = useClusterStore();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Overview");
  const [editingScene, setEditingScene] = useState<Scene | undefined>();
  const [newSceneTitle, setNewSceneTitle] = useState("");
  const project = projects.find((item) => item.id === projectId);

  const projectScenes = useMemo(
    () => scenes.filter((scene) => scene.projectId === projectId).sort((a, b) => a.order - b.order),
    [projectId, scenes],
  );
  const projectAssets = assets.filter((asset) => asset.projectId === projectId);
  const projectJobs = renderJobs.filter((job) => job.projectId === projectId);
  const projectCharacters = characters.filter((character) => project?.characterIds.includes(character.id));
  const projectEpisodes = episodes.filter((episode) => episode.projectId === projectId);
  const projectSeasons = seasons.filter((season) => season.projectId === projectId);
  const projectLocations = locations.filter((location) => location.projectId === projectId);
  const activeEpisode = projectEpisodes.find((episode) => episode.id === productionContext.activeEpisodeId) ?? projectEpisodes[0];
  const activeScene = projectScenes.find((scene) => scene.id === productionContext.activeSceneId) ?? projectScenes[0];
  const nextTask = activeScene ? nextTaskForScene(activeScene, assets, renderJobs) : undefined;
  const blockers = unresolvedBlockers(projectScenes, projectEpisodes);
  const continueTo = continueDestination({ ...productionContext, activeProjectId: projectId, activeEpisodeId: activeEpisode?.id, activeSceneId: activeScene?.id }, projectScenes, assets, renderJobs);

  useEffect(() => {
    if (projectId) setActiveProject(projectId);
  }, [projectId, setActiveProject]);

  if (!project) {
    return (
      <Card>
        <p>Project not found.</p>
        <Link className="text-cyan-200 underline" to="/projects">
          Back to projects
        </Link>
      </Card>
    );
  }

  const sendSceneToCanvas = (scene: Scene) => {
    navigate(`/canvas?projectId=${project.id}&sceneId=${scene.id}`, {
      state: {
        projectId: project.id,
        sceneId: scene.id,
        characterIds: scene.characterIds,
        prompt: `${scene.title}. ${scene.description}. ${scene.action}. ${scene.emotion} animated Parker Tech Labs style.`,
        aspectRatio: scene.aspectRatio,
      },
    });
  };

  const sendSceneToDreamFrame = (scene: Scene) => {
    navigate(`/dreamframe?projectId=${project.id}&sceneId=${scene.id}`, {
      state: {
        projectId: project.id,
        sceneId: scene.id,
        sourceAssetId: scene.sourceImageAssetId,
        characterIds: scene.characterIds,
        motionPrompt: scene.motionPrompt,
        aspectRatio: scene.aspectRatio,
      },
    });
  };

  const addScene = async (event: FormEvent) => {
    event.preventDefault();
    if (!newSceneTitle.trim()) return;
    await createScene({
      projectId: project.id,
      title: newSceneTitle,
      description: "New PTL Crew pilot storyboard scene.",
      characterIds: project.characterIds,
    });
    setNewSceneTitle("");
  };

  const saveScene = async (event: FormEvent) => {
    event.preventDefault();
    if (!editingScene) return;
    await updateScene(editingScene);
    setEditingScene(undefined);
  };

  return (
    <>
      <PageHeader eyebrow="Project workspace" title={project.name}>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => navigate(continueTo)}>Continue Production</Button>
          <Button variant="secondary" onClick={() => setTab("Characters")}>Add Character</Button>
          <Button variant="secondary" onClick={() => navigate(`/canvas?projectId=${project.id}`)}>Generate Image</Button>
          <Button variant="secondary" onClick={() => setTab("Storyboard")}>Create Scene</Button>
          <Button variant="secondary" onClick={() => navigate("/novatone")}>Generate Audio</Button>
          <Button variant="secondary" onClick={() => navigate(`/render-queue?projectId=${project.id}`)}>Open Render Queue</Button>
          <Button variant="secondary">Export Project</Button>
        </div>
      </PageHeader>

      <ProductionContextIndicator context={productionContext} projects={projects} seasons={seasons} episodes={episodes} scenes={scenes} characters={characters} locations={locations} className="mb-4" />

      <Card className="mb-4">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">Production Hub</p>
            <h2 className="mt-2 font-display text-2xl font-semibold">{project.name}</h2>
            <p className="mt-2 text-sm font-semibold text-[color:var(--ptl-violet-soft)]">{project.tagline}</p>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-300">{project.description}</p>
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <Metric label="Completion" value={`${projectCompletion(project, scenes)}%`} />
              <Metric label="Episode" value={activeEpisode ? `E${activeEpisode.number}` : "None"} />
              <Metric label="Current Scene" value={activeScene ? `Scene ${activeScene.order}` : "None"} />
              <Metric label="Render Jobs" value={projectJobs.length} />
              <Metric label="Locations" value={projectLocations.length} />
            </div>
          </div>
          <div className="rounded-[18px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.035] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100">Next Recommended Task</p>
            <h3 className="mt-2 font-display text-lg font-semibold">{nextTask?.label ?? "Open the first incomplete scene"}</h3>
            <p className="mt-2 text-sm text-slate-300">{blockers.length ? `${blockers.length} blocker needs attention.` : "No production blockers detected for the active scene."}</p>
            <div className="mt-4"><Button onClick={() => navigate(continueTo)}>Continue Production</Button></div>
          </div>
        </div>
      </Card>

      <Card className="mb-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">Episodes</p>
            <h2 className="font-display text-xl font-semibold">Season structure</h2>
          </div>
          <p className="text-sm text-slate-300">{projectSeasons.map((season) => season.title).join(", ")}</p>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {projectEpisodes.map((episode) => {
            const episodeScenes = projectScenes.filter((scene) => episode.sceneIds.includes(scene.id));
            const completedScenes = episodeScenes.filter((scene) => scene.status === "completed").length;
            return (
              <div key={episode.id} className="rounded-[18px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.035] p-4 text-left transition hover:border-[color:var(--ptl-border-active)] hover:bg-[color:var(--ptl-bg-hover)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100">Episode {episode.number}</p>
                    <h3 className="mt-1 font-display text-lg font-semibold">{episode.title}</h3>
                  </div>
                  <StatusBadge status={episode.status} />
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-300">{episode.summary}</p>
                <div className="mt-3"><PtlProgress value={episodeCompletion(episode, scenes)} label={`${episodeCompletion(episode, scenes)}% complete`} /></div>
                <p className="mt-2 text-xs text-slate-300">{completedScenes} of {episodeScenes.length} scenes complete · {episode.productionPhase}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button onClick={() => {
                    setActiveEpisode(episode.id);
                    navigate(continueDestination({ ...productionContext, activeEpisodeId: episode.id, activeSceneId: episode.sceneIds[0] }, projectScenes, assets, renderJobs));
                  }}>Continue Episode</Button>
                  <Button variant="secondary" onClick={() => navigate(`/projects/${project.id}/episodes/${episode.id}/scenes/${episode.sceneIds[0]}`)}>Open Episode</Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Project sections">
        {tabs.map((item) => (
          <button
            key={item}
            className={`focus-ring whitespace-nowrap rounded-xl px-4 py-3 text-sm font-black ${tab === item ? "bg-cyan-300 text-navy-950" : "bg-white/10 text-white"}`}
            type="button"
            onClick={() => setTab(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card><p className="text-sm text-slate-300">Characters</p><strong className="text-4xl">{projectCharacters.length}</strong></Card>
          <Card><p className="text-sm text-slate-300">Scenes</p><strong className="text-4xl">{projectScenes.length}</strong></Card>
          <Card><p className="text-sm text-slate-300">Images</p><strong className="text-4xl">{projectAssets.filter((asset) => asset.type === "generated-image").length}</strong></Card>
          <Card><p className="text-sm text-slate-300">Clips</p><strong className="text-4xl">{projectAssets.filter((asset) => asset.type === "video").length}</strong></Card>
        </div>
      )}

      {tab === "Characters" && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {characters.map((character) => (
            <Card key={character.id}>
              <img src={character.portrait || character.heroImage || character.referenceImages[0]?.url} alt={`${character.name} portrait`} className="mb-4 aspect-[5/3] rounded-xl object-cover" />
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100">{character.role ?? "Character"}</p>
              <h3 className="mt-1 text-xl font-black">{character.name}</h3>
              <p className="mt-2 text-sm text-slate-300">{character.personality || character.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(character.tags ?? []).slice(0, 3).map((tag) => <span key={tag} className="rounded-[10px] bg-white/10 px-2 py-1 text-xs">{tag}</span>)}
              </div>
              <div className="mt-4 flex gap-2">
                <Link to={`/characters/${character.id}`}><Button variant="secondary">Open</Button></Link>
                <Button onClick={() => void addCharacterToProject(project.id, character.id)}>
                  {project.characterIds.includes(character.id) ? "Added" : "Add"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {(tab === "Storyboard" || tab === "Scenes") && (
        <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
          <Card>
            <h3 className="mb-4 text-xl font-black">Add a scene</h3>
            <form className="grid gap-3" onSubmit={addScene}>
              <Field label="Scene title">
                <input className={inputClass} value={newSceneTitle} onChange={(event) => setNewSceneTitle(event.target.value)} />
              </Field>
              <Button type="submit">Create Scene</Button>
            </form>
          </Card>
          <div className="grid gap-3">
            {projectScenes.map((scene) => (
              <Card key={scene.id}>
                <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <p className="text-sm font-black text-cyan-100">Scene {scene.order}</p>
                    <h3 className="text-xl font-black">{scene.title}</h3>
                    <p className="mt-2 text-slate-300">{scene.description}</p>
                  </div>
                  <StatusBadge status={scene.status} />
                </div>
                <div className="mt-4 grid gap-2 text-sm text-slate-300 md:grid-cols-2">
                  <p><strong className="text-white">Characters:</strong> {characters.filter((character) => scene.characterIds.includes(character.id)).map((character) => character.name).join(", ") || "None"}</p>
                  <p><strong className="text-white">Location:</strong> {scene.location}</p>
                  <p><strong className="text-white">Objective:</strong> {scene.action}</p>
                  <p><strong className="text-white">Emotion:</strong> {scene.emotion}</p>
                  <p><strong className="text-white">Camera:</strong> {scene.cameraMovement}</p>
                  <p><strong className="text-white">Duration:</strong> {scene.duration}s</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => {
                    setActiveScene(scene.id);
                    navigate(`/projects/${project.id}/episodes/${scene.episodeId ?? activeEpisode?.id ?? ""}/scenes/${scene.id}`);
                  }}>Open Scene Workspace</Button>
                  <Button variant="secondary" onClick={() => setEditingScene(scene)}>Edit</Button>
                  <Button variant="secondary" onClick={() => void duplicateScene(scene.id)}>Duplicate</Button>
                  <Button variant="secondary" onClick={() => void reorderScene(scene.id, "up")}>Move Up</Button>
                  <Button variant="secondary" onClick={() => void reorderScene(scene.id, "down")}>Move Down</Button>
                  <Button variant="secondary" onClick={() => sendSceneToCanvas(scene)}>Open in NovaCanvas</Button>
                  <Button variant="secondary" onClick={() => sendSceneToDreamFrame(scene)}>Open in DreamFrame</Button>
                  <Button variant="danger" onClick={() => window.confirm("Delete this scene?") && void deleteScene(scene.id)}>Delete</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tab === "Images" && <AssetStrip assets={projectAssets.filter((asset) => asset.type === "generated-image")} />}
      {tab === "Clips" && <AssetStrip assets={projectAssets.filter((asset) => asset.type === "video")} />}
      {tab === "Audio" && <AssetStrip assets={projectAssets.filter((asset) => asset.type === "audio")} />}
      {tab === "Render Jobs" && (
        <div className="grid gap-3">
          {projectJobs.map((job) => <Card key={job.id}><div className="flex items-center justify-between"><strong>{job.name}</strong><StatusBadge status={job.status} /></div></Card>)}
        </div>
      )}
      {tab === "Activity" && (
        <div className="grid gap-3">
          {[...projectJobs].reverse().map((job) => <Card key={job.id}><p className="font-bold">{job.name} - {job.status}</p></Card>)}
        </div>
      )}

      {editingScene && (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-navy-950/85 p-4">
          <Card className="mx-auto max-w-3xl">
            <form className="grid gap-4" onSubmit={saveScene}>
              <h3 className="text-2xl font-black">Edit scene</h3>
              <Field label="Title"><input className={inputClass} value={editingScene.title} onChange={(event) => setEditingScene({ ...editingScene, title: event.target.value })} /></Field>
              <Field label="Description"><textarea className={textareaClass} value={editingScene.description} onChange={(event) => setEditingScene({ ...editingScene, description: event.target.value })} /></Field>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Location"><input className={inputClass} value={editingScene.location} onChange={(event) => setEditingScene({ ...editingScene, location: event.target.value })} /></Field>
                <Field label="Action"><input className={inputClass} value={editingScene.action} onChange={(event) => setEditingScene({ ...editingScene, action: event.target.value })} /></Field>
                <Field label="Emotion"><input className={inputClass} value={editingScene.emotion} onChange={(event) => setEditingScene({ ...editingScene, emotion: event.target.value })} /></Field>
                <Field label="Camera movement"><input className={inputClass} value={editingScene.cameraMovement} onChange={(event) => setEditingScene({ ...editingScene, cameraMovement: event.target.value })} /></Field>
              </div>
              <Field label="Dialogue"><textarea className={textareaClass} value={editingScene.dialogue} onChange={(event) => setEditingScene({ ...editingScene, dialogue: event.target.value })} /></Field>
              <Field label="Motion prompt"><textarea className={textareaClass} value={editingScene.motionPrompt} onChange={(event) => setEditingScene({ ...editingScene, motionPrompt: event.target.value })} /></Field>
              <div className="grid gap-4 md:grid-cols-4">
                <Field label="Duration"><select className={inputClass} value={editingScene.duration} onChange={(event) => setEditingScene({ ...editingScene, duration: Number(event.target.value) as Scene["duration"] })}><option value={3}>3</option><option value={5}>5</option><option value={8}>8</option><option value={10}>10</option></select></Field>
                <Field label="Aspect ratio"><select className={inputClass} value={editingScene.aspectRatio} onChange={(event) => setEditingScene({ ...editingScene, aspectRatio: event.target.value })}><option>16:9</option><option>9:16</option><option>1:1</option></select></Field>
                <Field label="Resolution"><select className={inputClass} value={editingScene.resolution} onChange={(event) => setEditingScene({ ...editingScene, resolution: event.target.value })}><option>1080p</option><option>720p</option></select></Field>
                <Field label="FPS"><input className={inputClass} type="number" value={editingScene.fps} onChange={(event) => setEditingScene({ ...editingScene, fps: Number(event.target.value) })} /></Field>
              </div>
              <Field label="Motion strength"><input className={inputClass} type="range" min={0} max={1} step={0.01} value={editingScene.motionStrength} onChange={(event) => setEditingScene({ ...editingScene, motionStrength: Number(event.target.value) })} /></Field>
              <div className="flex gap-2">
                <Button type="submit">Save Scene</Button>
                <Button variant="secondary" onClick={() => setEditingScene(undefined)}>Cancel</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-[14px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.035] p-3"><p className="text-xs uppercase tracking-[0.14em] text-[color:var(--ptl-text-muted)]">{label}</p><p className="mt-1 font-display text-xl font-semibold text-white">{value}</p></div>;
}

function AssetStrip({ assets }: { assets: ReturnType<typeof useClusterStore.getState>["assets"] }) {
  if (assets.length === 0) {
    return <Card><p>No assets yet.</p></Card>;
  }
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {assets.map((asset) => (
        <Card key={asset.id}>
          {asset.url.startsWith("http") || asset.url.startsWith("data:image") ? (
            <img src={asset.url} alt={asset.name} className="mb-4 aspect-video rounded-xl object-cover" />
          ) : (
            <div className="mb-4 grid aspect-video place-items-center rounded-xl bg-white/10">{asset.type}</div>
          )}
          <strong>{asset.name}</strong>
          <p className="mt-2 text-sm text-slate-300">{asset.isMock ? "Simulated asset" : "Real asset"}</p>
        </Card>
      ))}
    </div>
  );
}
