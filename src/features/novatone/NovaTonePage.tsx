import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useClusterStore } from "../../app/useClusterStore";
import { Button, Card, Field, PageHeader, inputClass, textareaClass } from "../../components/Ui";

export function NovaTonePage() {
  const { assets, projects, characters, generate } = useClusterStore();
  const [params] = useSearchParams();
  const { productionContext, scenes, locations, setWorkflowFocus } = useClusterStore();
  const selectedScene = scenes.find((scene) => scene.id === (params.get("sceneId") ?? productionContext.activeSceneId));
  const selectedLocation = locations.find((location) => location.id === (selectedScene?.locationId ?? productionContext.activeLocationId));
  const [selectedCharacterId, setSelectedCharacterId] = useState(productionContext.activeCharacterIds[0] ?? characters[0]?.id ?? "");
  const selectedCharacter = characters.find((character) => character.id === selectedCharacterId);
  const [dialogue, setDialogue] = useState(selectedScene?.dialogue || "Brooklyn: I have an idea!");

  useEffect(() => {
    setWorkflowFocus("audio", "/novatone");
  }, [setWorkflowFocus]);

  const submit = async (generationType: "voice" | "music" | "sound-effect") => {
    await generate({
      projectId: productionContext.activeProjectId ?? projects[0]?.id,
      generationType,
      prompt: dialogue,
      characterIds: selectedCharacter ? [selectedCharacter.id] : undefined,
      settings: {
        duration: 12,
        sceneId: selectedScene?.id ?? productionContext.activeSceneId,
        episodeId: selectedScene?.episodeId ?? productionContext.activeEpisodeId,
        seasonId: selectedScene?.seasonId ?? productionContext.activeSeasonId,
        locationId: selectedLocation?.id,
        productionType: generationType === "voice" ? "dialogue" : generationType === "music" ? "music" : "sound-effect",
        voice: selectedCharacter?.tone ?? "Bright kid hero",
        speakingStyle: selectedCharacter?.speakingStyle,
        voiceNotes: selectedCharacter?.voiceNotes,
      },
    });
  };

  return (
    <>
      <PageHeader eyebrow="NovaTone" title="Audio generation workspace" />
      <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <Card>
          <form className="grid gap-4" onSubmit={(event: FormEvent) => event.preventDefault()}>
            <Field label="Voice selector">
              <select className={inputClass} value={selectedCharacterId} onChange={(event) => setSelectedCharacterId(event.target.value)} aria-label="Voice selector">
                {characters.map((character) => <option key={character.id} value={character.id}>{character.name} - {character.tone ?? character.role ?? "Voice profile"}</option>)}
              </select>
            </Field>
            {selectedCharacter && (
              <div className="rounded-[16px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.035] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100">Character voice profile</p>
                <h3 className="mt-2 font-display text-lg font-semibold">{selectedCharacter.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{selectedCharacter.speakingStyle || selectedCharacter.voiceNotes || "Voice profile not set."}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(selectedCharacter.catchphrases ?? []).map((phrase) => <span key={phrase} className="rounded-[10px] bg-white/10 px-3 py-2 text-xs font-bold">{phrase}</span>)}
                </div>
              </div>
            )}
            {selectedScene && (
              <div className="rounded-[16px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.035] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100">Scene audio context</p>
                <h3 className="mt-2 font-display text-lg font-semibold">{selectedScene.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{selectedScene.emotion} at {selectedLocation?.name ?? selectedScene.location}</p>
              </div>
            )}
            <Field label="Dialogue input"><textarea className={textareaClass} value={dialogue} onChange={(e) => setDialogue(e.target.value)} /></Field>
            <Field label="Background-music prompt"><input className={inputClass} defaultValue="Upbeat futuristic adventure theme" /></Field>
            <Field label="Sound-effect prompt"><input className={inputClass} defaultValue="Monster truck engine sparkle boost" /></Field>
            <Field label="Audio duration"><input className={inputClass} type="number" defaultValue={12} /></Field>
            <div className="grid gap-2 sm:grid-cols-3">
              <Button onClick={() => void submit("voice")}>Generate Voice</Button>
              <Button onClick={() => void submit("music")}>Generate Music</Button>
              <Button onClick={() => void submit("sound-effect")}>Generate SFX</Button>
            </div>
          </form>
        </Card>
        <Card>
          <h3 className="mb-4 text-xl font-black">Audio track list</h3>
          <div className="grid gap-3">
            {assets.filter((asset) => asset.type === "audio").map((asset) => (
              <div key={asset.id} className="rounded-xl bg-white/7 p-4">
                <strong>{asset.name}</strong>
                <div className="mt-3 flex h-12 items-end gap-1 rounded-lg bg-navy-950/60 p-2" aria-label={`${asset.name} mock waveform`}>
                  {Array.from({ length: 32 }, (_, index) => <span key={index} className="flex-1 rounded bg-cyan-300/80" style={{ height: `${18 + ((index * 17) % 30)}px` }} />)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
