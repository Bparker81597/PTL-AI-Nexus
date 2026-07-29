import { FormEvent, useState } from "react";
import { useClusterStore } from "../../app/useClusterStore";
import { Button, Card, Field, PageHeader, StatusBadge, inputClass, textareaClass } from "../../components/Ui";

export function DreamFramePage() {
  const { assets, characters, projects, renderJobs, generate } = useClusterStore();
  const [motionPrompt, setMotionPrompt] = useState("Camera tracks the monster truck as it jumps through teal energy rings");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await generate({
      projectId: projects[0]?.id,
      generationType: "image-to-video",
      prompt: motionPrompt,
      characterIds: characters.map((character) => character.id),
      sourceAssetIds: assets.filter((asset) => asset.type === "generated-image").slice(0, 1).map((asset) => asset.id),
      settings: { camera: "tracking shot", duration: 5, aspectRatio: "16:9", resolution: "1080p", fps: 24, motionStrength: 0.68 },
    });
  };

  return (
    <>
      <PageHeader eyebrow="DreamFrame" title="Mini-clip generation" />
      <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <Card>
          <form className="grid gap-4" onSubmit={submit}>
            <Field label="Source image"><select className={inputClass}>{assets.filter((asset) => asset.type === "generated-image").map((asset) => <option key={asset.id}>{asset.name}</option>)}</select></Field>
            <Field label="Character"><select className={inputClass}>{characters.map((character) => <option key={character.id}>{character.name}</option>)}</select></Field>
            <Field label="Motion prompt"><textarea className={textareaClass} value={motionPrompt} onChange={(e) => setMotionPrompt(e.target.value)} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Camera"><select className={inputClass}><option>Tracking shot</option><option>Dolly in</option><option>Orbit</option></select></Field>
              <Field label="Duration"><select className={inputClass}><option>3 seconds</option><option>5 seconds</option><option>8 seconds</option><option>10 seconds</option></select></Field>
              <Field label="Aspect ratio"><select className={inputClass}><option>16:9</option><option>9:16</option></select></Field>
              <Field label="Resolution"><select className={inputClass}><option>1080p</option><option>720p</option></select></Field>
              <Field label="FPS"><input className={inputClass} type="number" defaultValue={24} /></Field>
              <Field label="Motion strength"><input className={inputClass} type="range" min={0} max={1} step={0.01} defaultValue={0.68} /></Field>
            </div>
            <Button type="submit">Generate Clip</Button>
          </form>
        </Card>
        <div className="grid gap-4">
          <Card>
            <h3 className="mb-4 text-xl font-black">Mock video preview</h3>
            <div className="grid aspect-video place-items-center rounded-2xl bg-gradient-to-br from-cyan-300/25 via-purple-300/20 to-teal-300/20 text-center">
              <div><p className="text-2xl font-black">DreamFrame Preview</p><p className="text-slate-300">Video connector placeholder</p></div>
            </div>
          </Card>
          <Card>
            <h3 className="mb-4 text-xl font-black">Scene queue</h3>
            <div className="grid gap-3">{renderJobs.filter((job) => job.generationType.includes("video")).map((job) => <div key={job.id} className="flex items-center justify-between rounded-xl bg-white/7 p-3"><span className="font-bold">{job.name}</span><StatusBadge status={job.status} /></div>)}</div>
          </Card>
        </div>
      </div>
    </>
  );
}
