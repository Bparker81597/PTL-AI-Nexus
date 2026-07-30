import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useClusterStore } from "../../app/useClusterStore";
import { Button, Card, Field, PageHeader, StatusBadge, inputClass, textareaClass } from "../../components/Ui";

interface DreamFrameRouteState {
  projectId?: string;
  sceneId?: string;
  sourceAssetId?: string;
  characterIds?: string[];
  motionPrompt?: string;
  aspectRatio?: string;
}

export function DreamFramePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const routeState = (location.state ?? {}) as DreamFrameRouteState;
  const { assets, characters, projects, renderJobs, scenes, generate, refreshAll } = useClusterStore();
  const [selectedProjectId, setSelectedProjectId] = useState(routeState.projectId ?? params.get("projectId") ?? projects[0]?.id ?? "");
  const [selectedSceneId, setSelectedSceneId] = useState(routeState.sceneId ?? params.get("sceneId") ?? "");
  const [sourceAssetId, setSourceAssetId] = useState(routeState.sourceAssetId ?? params.get("sourceAssetId") ?? "");
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>(
    routeState.characterIds ?? params.get("characterIds")?.split(",").filter(Boolean) ?? characters.slice(0, 2).map((character) => character.id),
  );
  const selectedScene = scenes.find((scene) => scene.id === selectedSceneId);
  const sourceAsset = assets.find((asset) => asset.id === sourceAssetId);
  const selectedCharacters = characters.filter((character) => selectedCharacterIds.includes(character.id));
  const projectScenes = scenes.filter((scene) => scene.projectId === selectedProjectId);
  const sourceImages = assets.filter((asset) => asset.projectId === selectedProjectId && asset.type === "generated-image");
  const [motionPrompt, setMotionPrompt] = useState(routeState.motionPrompt ?? selectedScene?.motionPrompt ?? "Camera tracks the monster truck as it jumps through teal energy rings");
  const [actionPrompt, setActionPrompt] = useState(selectedScene?.action ?? "The PTL Crew moves with expressive, consistent animated character motion.");
  const [cameraMovement, setCameraMovement] = useState(selectedScene?.cameraMovement ?? "Tracking shot");
  const [duration, setDuration] = useState<number>(selectedScene?.duration ?? 5);
  const [aspectRatio, setAspectRatio] = useState(routeState.aspectRatio ?? selectedScene?.aspectRatio ?? "16:9");
  const [resolution, setResolution] = useState(selectedScene?.resolution ?? "1080p");
  const [fps, setFps] = useState(selectedScene?.fps ?? 24);
  const [motionStrength, setMotionStrength] = useState(selectedScene?.motionStrength ?? 0.68);
  const [seed, setSeed] = useState(4102);
  const [negativeMotionPrompt, setNegativeMotionPrompt] = useState("warped motion, flicker, face drift, broken wheels");
  const [validation, setValidation] = useState("");
  const [lastJobId, setLastJobId] = useState<string | undefined>();

  const lastJob = renderJobs.find((job) => job.id === lastJobId);
  const lastAsset = useMemo(
    () => assets.find((asset) => lastJob?.outputAssetIds.includes(asset.id)),
    [assets, lastJob],
  );

  useEffect(() => {
    if (!lastJobId) return;
    const timer = window.setInterval(() => void refreshAll(), 350);
    return () => window.clearInterval(timer);
  }, [lastJobId, refreshAll]);

  useEffect(() => {
    if (!selectedScene) return;
    setMotionPrompt(selectedScene.motionPrompt);
    setActionPrompt(
      [
        selectedScene.action,
        ...characters
          .filter((character) => selectedScene.characterIds.includes(character.id))
          .map((character) => character.animationNotes)
          .filter(Boolean),
      ].join("\n"),
    );
    setCameraMovement(selectedScene.cameraMovement);
    setDuration(selectedScene.duration);
    setAspectRatio(selectedScene.aspectRatio);
    setResolution(selectedScene.resolution);
    setFps(selectedScene.fps);
    setMotionStrength(selectedScene.motionStrength);
    if (selectedScene.sourceImageAssetId) setSourceAssetId(selectedScene.sourceImageAssetId);
    setSelectedCharacterIds(selectedScene.characterIds);
  }, [characters, selectedScene]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedProjectId || !selectedSceneId || !sourceAssetId || !motionPrompt.trim()) {
      setValidation("Select a project, scene, source image, and motion prompt before generating a clip.");
      return;
    }
    setValidation("");
    const job = await generate({
      projectId: selectedProjectId,
      generationType: "image-to-video",
      prompt: `${motionPrompt}\nCharacter action: ${actionPrompt}`,
      negativePrompt: negativeMotionPrompt,
      characterIds: selectedCharacterIds,
      sourceAssetIds: [sourceAssetId],
      settings: {
        sceneId: selectedSceneId,
        cameraMovement,
        duration,
        aspectRatio,
        resolution,
        fps,
        motionStrength,
        seed,
        negativeMotionPrompt,
      },
    });
    setLastJobId(job.id);
    navigate(`/render-queue?projectId=${selectedProjectId}&generationType=image-to-video`);
  };

  return (
    <>
      <PageHeader eyebrow="DreamFrame" title="Scene-animation workspace" />
      <div className="grid gap-4 xl:grid-cols-[440px_1fr]">
        <Card>
          <form className="grid gap-4" onSubmit={submit}>
            {validation && <p className="rounded-xl bg-rose-300/15 p-3 text-sm font-bold text-rose-100">{validation}</p>}
            <Field label="Project selector">
              <select className={inputClass} value={selectedProjectId} onChange={(event) => setSelectedProjectId(event.target.value)} required>
                {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
              </select>
            </Field>
            <Field label="Scene selector">
              <select className={inputClass} value={selectedSceneId} onChange={(event) => setSelectedSceneId(event.target.value)} required>
                <option value="">Select scene</option>
                {projectScenes.map((scene) => <option key={scene.id} value={scene.id}>{scene.order}. {scene.title}</option>)}
              </select>
            </Field>
            <Field label="Source-image selector">
              <select className={inputClass} value={sourceAssetId} onChange={(event) => setSourceAssetId(event.target.value)} required>
                <option value="">Select source image</option>
                {sourceImages.map((asset) => <option key={asset.id} value={asset.id}>{asset.name}</option>)}
              </select>
            </Field>
            <Field label="Character selector">
              <select
                className={inputClass}
                multiple
                value={selectedCharacterIds}
                onChange={(event) => setSelectedCharacterIds(Array.from(event.target.selectedOptions, (option) => option.value))}
              >
                {characters.map((character) => <option key={character.id} value={character.id}>{character.name}</option>)}
              </select>
            </Field>
            <Field label="Motion prompt"><textarea className={textareaClass} value={motionPrompt} onChange={(event) => setMotionPrompt(event.target.value)} /></Field>
            <Field label="Character-action prompt"><textarea className={textareaClass} value={actionPrompt} onChange={(event) => setActionPrompt(event.target.value)} /></Field>
            <div className="rounded-[16px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.035] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100">Animation profiles</p>
              <div className="mt-3 grid gap-3">
                {selectedCharacters.map((character) => (
                  <div key={character.id} className="rounded-xl bg-white/7 p-3">
                    <strong>{character.name}</strong>
                    <p className="mt-1 text-xs text-slate-300">{character.role ?? "Character"} · {character.tone ?? "Voice tone not set"}</p>
                    <p className="mt-2 text-xs leading-5 text-slate-300">{character.animationNotes || character.continuityNotes || character.consistencyPrompt}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Camera movement"><input className={inputClass} value={cameraMovement} onChange={(event) => setCameraMovement(event.target.value)} /></Field>
              <Field label="Duration"><select className={inputClass} value={duration} onChange={(event) => setDuration(Number(event.target.value))}><option value={3}>3 seconds</option><option value={5}>5 seconds</option><option value={8}>8 seconds</option><option value={10}>10 seconds</option></select></Field>
              <Field label="Aspect ratio"><select className={inputClass} value={aspectRatio} onChange={(event) => setAspectRatio(event.target.value)}><option>16:9</option><option>9:16</option><option>1:1</option></select></Field>
              <Field label="Resolution"><select className={inputClass} value={resolution} onChange={(event) => setResolution(event.target.value)}><option>1080p</option><option>720p</option></select></Field>
              <Field label="FPS"><input className={inputClass} type="number" value={fps} onChange={(event) => setFps(Number(event.target.value))} /></Field>
              <Field label="Seed"><input className={inputClass} type="number" value={seed} onChange={(event) => setSeed(Number(event.target.value))} /></Field>
            </div>
            <Field label="Motion strength"><input className={inputClass} type="range" min={0} max={1} step={0.01} value={motionStrength} onChange={(event) => setMotionStrength(Number(event.target.value))} /></Field>
            <Field label="Negative motion prompt"><textarea className={textareaClass} value={negativeMotionPrompt} onChange={(event) => setNegativeMotionPrompt(event.target.value)} /></Field>
            <Button type="submit">{selectedProjectId && selectedSceneId && sourceAssetId ? "Generate Simulated Clip" : "Complete Required Fields"}</Button>
          </form>
        </Card>
        <div className="grid gap-4">
          <Card>
            <h3 className="mb-4 text-xl font-black">Source-image preview</h3>
            {sourceAsset ? (
              <img src={sourceAsset.url} alt={sourceAsset.name} className="aspect-video rounded-2xl object-cover" />
            ) : (
              <div className="grid aspect-video place-items-center rounded-2xl bg-white/10 text-slate-300">Select a source image</div>
            )}
          </Card>
          <Card>
            <h3 className="mb-4 text-xl font-black">Render status</h3>
            {lastJob ? (
              <div>
                <div className="flex items-center justify-between"><strong>{lastJob.name}</strong><StatusBadge status={lastJob.status} /></div>
                <div className="mt-3 h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-cyan-300" style={{ width: `${lastJob.progress}%` }} /></div>
                {lastAsset && <Button variant="secondary" onClick={() => navigate("/assets")}>Open completed clip in Asset Library</Button>}
              </div>
            ) : (
              <p className="text-slate-300">No new clip job started yet.</p>
            )}
          </Card>
          <Card>
            <h3 className="mb-4 text-xl font-black">Scene queue</h3>
            <div className="grid gap-3">
              {renderJobs.filter((job) => job.generationType.includes("video")).map((job) => (
                <div key={job.id} className="flex items-center justify-between rounded-xl bg-white/7 p-3"><span className="font-bold">{job.name}</span><StatusBadge status={job.status} /></div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
