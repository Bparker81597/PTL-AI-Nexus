import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useClusterStore } from "../../app/useClusterStore";
import { Button, Card, Field, PageHeader, inputClass, textareaClass } from "../../components/Ui";

interface CanvasRouteState {
  projectId?: string;
  sceneId?: string;
  characterIds?: string[];
  prompt?: string;
  aspectRatio?: string;
}

export function NovaCanvasPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const routeState = (location.state ?? {}) as CanvasRouteState;
  const { characters, assets, projects, scenes, renderJobs, generate, refreshAll } = useClusterStore();
  const [selectedProjectId, setSelectedProjectId] = useState(
    routeState.projectId ?? params.get("projectId") ?? projects[0]?.id ?? "",
  );
  const [selectedSceneId, setSelectedSceneId] = useState(routeState.sceneId ?? params.get("sceneId") ?? "");
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>(
    routeState.characterIds ?? params.get("characterIds")?.split(",").filter(Boolean) ?? characters.slice(0, 2).map((character) => character.id),
  );
  const selectedCharacters = characters.filter((character) => selectedCharacterIds.includes(character.id));
  const selectedScene = scenes.find((scene) => scene.id === selectedSceneId);
  const selectedProjectScenes = scenes.filter((scene) => scene.projectId === selectedProjectId);
  const consistencyText = selectedCharacters.map((character) => character.consistencyPrompt).join("\n");
  const [prompt, setPrompt] = useState(
    routeState.prompt ??
      `${selectedScene?.title ?? "Eric and Maize reveal a glowing monster truck in a futuristic workshop"}. ${consistencyText}`,
  );
  const [negativePrompt, setNegativePrompt] = useState(
    selectedCharacters.map((character) => character.negativePrompt).filter(Boolean).join(", ") ||
      "blurry, inconsistent faces, extra fingers",
  );
  const [aspectRatio, setAspectRatio] = useState(routeState.aspectRatio ?? selectedScene?.aspectRatio ?? "16:9");
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

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedProjectId || !prompt.trim()) return;
    const job = await generate({
      projectId: selectedProjectId,
      generationType: "image",
      prompt,
      negativePrompt,
      characterIds: selectedCharacterIds,
      settings: {
        style: "3D adventure",
        aspectRatio,
        seed: 2401,
        quality: "high",
        count: 4,
        sceneId: selectedSceneId || undefined,
        consistencyPrompts: consistencyText,
      },
    });
    setLastJobId(job.id);
  };

  const sendToDreamFrame = () => {
    if (!lastAsset) return;
    navigate(`/dreamframe?projectId=${lastAsset.projectId ?? ""}&sceneId=${lastAsset.sceneId ?? ""}&sourceAssetId=${lastAsset.id}`, {
      state: {
        projectId: lastAsset.projectId,
        sceneId: lastAsset.sceneId,
        sourceAssetId: lastAsset.id,
        characterIds: lastAsset.characterIds,
        aspectRatio,
        motionPrompt: selectedScene?.motionPrompt,
      },
    });
  };

  return (
    <>
      <PageHeader eyebrow="NovaCanvas" title="Image generation workspace" />
      <div className="grid gap-4 xl:grid-cols-[440px_1fr]">
        <Card>
          <form className="grid gap-4" onSubmit={submit}>
            <Field label="Project selector">
              <select className={inputClass} value={selectedProjectId} onChange={(event) => setSelectedProjectId(event.target.value)} required>
                {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
              </select>
            </Field>
            <Field label="Scene selector">
              <select className={inputClass} value={selectedSceneId} onChange={(event) => setSelectedSceneId(event.target.value)}>
                <option value="">No scene selected</option>
                {selectedProjectScenes.map((scene) => <option key={scene.id} value={scene.id}>{scene.order}. {scene.title}</option>)}
              </select>
            </Field>
            <Field label="Prompt">
              <textarea className={textareaClass} value={prompt} onChange={(event) => setPrompt(event.target.value)} required />
            </Field>
            <Field label="Relevant consistency prompts">
              <textarea className={textareaClass} value={consistencyText} readOnly aria-label="Relevant consistency prompts" />
            </Field>
            <Field label="Negative prompt">
              <textarea className={textareaClass} value={negativePrompt} onChange={(event) => setNegativePrompt(event.target.value)} />
            </Field>
            <Field label="Character selector">
              <select
                className={inputClass}
                multiple
                value={selectedCharacterIds}
                onChange={(event) => setSelectedCharacterIds(Array.from(event.target.selectedOptions, (option) => option.value))}
                aria-label="Character selector"
              >
                {characters.map((character) => <option key={character.id} value={character.id}>{character.name}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Style"><select className={inputClass}><option>3D adventure</option><option>Concept art</option><option>Storyboard</option></select></Field>
              <Field label="Aspect ratio"><select className={inputClass} value={aspectRatio} onChange={(event) => setAspectRatio(event.target.value)}><option>16:9</option><option>1:1</option><option>9:16</option></select></Field>
              <Field label="Seed"><input className={inputClass} type="number" defaultValue={2401} /></Field>
              <Field label="Quality"><select className={inputClass}><option>High</option><option>Draft</option></select></Field>
              <Field label="Images"><input className={inputClass} type="number" min={1} max={4} defaultValue={4} /></Field>
              <Field label="Reference upload"><input className={inputClass} type="file" /></Field>
            </div>
            <Button type="submit">{selectedProjectId && prompt.trim() ? "Generate Simulated Images" : "Select Project and Prompt"}</Button>
          </form>
        </Card>
        <div className="grid gap-4">
          {lastJob && (
            <Card>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-xl font-black">Latest simulated result</h3>
                  <p className="text-sm text-slate-300">Mock Provider active - results are simulated.</p>
                </div>
                <strong>{lastJob.status} {lastJob.progress}%</strong>
              </div>
              {lastAsset && (
                <div className="mt-4">
                  <img src={lastAsset.url} alt={lastAsset.name} className="aspect-video rounded-xl object-cover" />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={() => navigate("/assets")}>Open Asset</Button>
                    <Button onClick={sendToDreamFrame}>Use in DreamFrame</Button>
                    <Button variant="secondary" onClick={() => void generate({ projectId: selectedProjectId, generationType: "image", prompt, negativePrompt, characterIds: selectedCharacterIds, settings: { aspectRatio, sceneId: selectedSceneId || undefined, variation: false } })}>Regenerate</Button>
                    <Button variant="secondary" onClick={() => void generate({ projectId: selectedProjectId, generationType: "image", prompt: `${prompt} variation`, negativePrompt, characterIds: selectedCharacterIds, sourceAssetIds: [lastAsset.id], settings: { aspectRatio, sceneId: selectedSceneId || undefined, variation: true } })}>Create Variation</Button>
                  </div>
                </div>
              )}
            </Card>
          )}
          <Card>
            <h3 className="mb-4 text-xl font-black">Generation history</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {assets.filter((asset) => asset.type === "generated-image").map((asset) => (
                <figure key={asset.id} className="rounded-xl bg-white/7 p-3">
                  <img src={asset.url} alt={asset.name} className="aspect-video rounded-lg object-cover" />
                  <figcaption className="mt-3 text-sm font-bold">{asset.name}</figcaption>
                  <p className="text-xs text-cyan-100">{asset.isMock ? "Simulated Mock Provider asset" : "Real asset"}</p>
                </figure>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
