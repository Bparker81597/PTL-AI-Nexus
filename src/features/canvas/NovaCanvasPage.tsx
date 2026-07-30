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
  const { characters, assets, projects, scenes, renderJobs, productionContext, locations, generate, refreshAll, setWorkflowFocus } = useClusterStore();
  const [selectedProjectId, setSelectedProjectId] = useState(
    routeState.projectId ?? params.get("projectId") ?? productionContext.activeProjectId ?? projects[0]?.id ?? "",
  );
  const [selectedSceneId, setSelectedSceneId] = useState(routeState.sceneId ?? params.get("sceneId") ?? productionContext.activeSceneId ?? "");
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>(
    routeState.characterIds ?? params.get("characterIds")?.split(",").filter(Boolean) ?? productionContext.activeCharacterIds ?? characters.slice(0, 2).map((character) => character.id),
  );
  const selectedCharacters = characters.filter((character) => selectedCharacterIds.includes(character.id));
  const selectedScene = scenes.find((scene) => scene.id === selectedSceneId);
  const selectedLocation = locations.find((location) => location.id === (selectedScene?.locationId ?? productionContext.activeLocationId));
  const selectedProjectScenes = scenes.filter((scene) => scene.projectId === selectedProjectId);
  const consistencyText = selectedCharacters
    .map((character) =>
      [
        character.defaultPrompt ?? character.consistencyPrompt,
        character.personality ? `Personality: ${character.personality}` : "",
        character.continuityNotes ? `Continuity: ${character.continuityNotes}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    )
    .join("\n\n");
  const [prompt, setPrompt] = useState(
    routeState.prompt ??
      `${selectedScene?.title ?? "PTL Crew character lineup for the pilot episode"}. ${consistencyText}`,
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
    setWorkflowFocus("visual-development", "/canvas");
  }, [setWorkflowFocus]);

  useEffect(() => {
    if (!lastJobId) return;
    const timer = window.setInterval(() => void refreshAll(), 350);
    return () => window.clearInterval(timer);
  }, [lastJobId, refreshAll]);

  useEffect(() => {
    if (!selectedScene) return;
    setSelectedCharacterIds(selectedScene.characterIds);
    setAspectRatio(selectedScene.aspectRatio);
  }, [selectedScene]);

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
        episodeId: selectedScene?.episodeId ?? productionContext.activeEpisodeId,
        seasonId: selectedScene?.seasonId ?? productionContext.activeSeasonId,
        locationId: selectedLocation?.id,
        assetPurpose: "storyboard-frame",
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
            {selectedLocation && (
              <div className="rounded-[16px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.035] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100">Active location</p>
                <h3 className="mt-2 font-display text-lg font-semibold">{selectedLocation.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{selectedLocation.visualNotes}</p>
              </div>
            )}
            <Field label="Relevant consistency prompts">
              <textarea className={textareaClass} value={consistencyText} readOnly aria-label="Relevant consistency prompts" />
            </Field>
            <div className="rounded-[16px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.035] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100">Character Bible context</p>
              <div className="mt-3 grid gap-3">
                {selectedCharacters.map((character) => (
                  <div key={character.id} className="rounded-xl bg-white/7 p-3">
                    <strong>{character.name}</strong>
                    <p className="mt-1 text-xs text-slate-300">{character.role ?? "Character"} · {character.defaultOutfit ?? "Default outfit"}</p>
                    <p className="mt-2 text-xs leading-5 text-slate-300">{character.defaultPrompt ?? character.consistencyPrompt}</p>
                  </div>
                ))}
              </div>
            </div>
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
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Production action"><select className={inputClass}><option>Generate storyboard frame</option><option>Generate background</option><option>Generate prop</option><option>Generate character expression</option><option>Generate outfit reference</option><option>Generate final illustration</option></select></Field>
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
