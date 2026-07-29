import { FormEvent, useState } from "react";
import { useClusterStore } from "../../app/useClusterStore";
import { Button, Card, Field, PageHeader, inputClass, textareaClass } from "../../components/Ui";

export function NovaTonePage() {
  const { assets, projects, generate } = useClusterStore();
  const [dialogue, setDialogue] = useState("Eric: Let's build the biggest jump Parker Tech Labs has ever seen!");

  const submit = async (generationType: "voice" | "music" | "sound-effect") => {
    await generate({ projectId: projects[0]?.id, generationType, prompt: dialogue, settings: { duration: 12, voice: "Bright kid hero" } });
  };

  return (
    <>
      <PageHeader eyebrow="NovaTone" title="Audio generation workspace" />
      <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <Card>
          <form className="grid gap-4" onSubmit={(event: FormEvent) => event.preventDefault()}>
            <Field label="Voice selector"><select className={inputClass}><option>Eric bright</option><option>Maize confident</option><option>Narrator warm</option></select></Field>
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
