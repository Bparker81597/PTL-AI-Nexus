import { FormEvent, useState } from "react";
import { useClusterStore } from "../../app/useClusterStore";
import { Button, Card, Field, PageHeader, inputClass, textareaClass } from "../../components/Ui";

export function NovaCanvasPage() {
  const { characters, assets, projects, generate } = useClusterStore();
  const [prompt, setPrompt] = useState("Eric and Maize reveal a glowing monster truck in a futuristic workshop");
  const [negativePrompt, setNegativePrompt] = useState("blurry, inconsistent faces, extra fingers");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await generate({
      projectId: projects[0]?.id,
      generationType: "image",
      prompt,
      negativePrompt,
      characterIds: characters.slice(0, 2).map((character) => character.id),
      settings: { style: "3D adventure", aspectRatio: "16:9", seed: 2401, quality: "high", count: 4 },
    });
  };

  return (
    <>
      <PageHeader eyebrow="NovaCanvas" title="Image generation workspace" />
      <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
        <Card>
          <form className="grid gap-4" onSubmit={submit}>
            <Field label="Prompt"><textarea className={textareaClass} value={prompt} onChange={(e) => setPrompt(e.target.value)} /></Field>
            <Field label="Negative prompt"><textarea className={textareaClass} value={negativePrompt} onChange={(e) => setNegativePrompt(e.target.value)} /></Field>
            <Field label="Character selector"><select className={inputClass}>{characters.map((character) => <option key={character.id}>{character.name}</option>)}</select></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Style"><select className={inputClass}><option>3D adventure</option><option>Concept art</option><option>Storyboard</option></select></Field>
              <Field label="Aspect ratio"><select className={inputClass}><option>16:9</option><option>1:1</option><option>9:16</option></select></Field>
              <Field label="Seed"><input className={inputClass} type="number" defaultValue={2401} /></Field>
              <Field label="Quality"><select className={inputClass}><option>High</option><option>Draft</option></select></Field>
              <Field label="Images"><input className={inputClass} type="number" min={1} max={4} defaultValue={4} /></Field>
              <Field label="Reference upload"><input className={inputClass} type="file" /></Field>
            </div>
            <Button type="submit">Generate Images</Button>
          </form>
        </Card>
        <Card>
          <h3 className="mb-4 text-xl font-black">Generation history</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {assets.filter((asset) => asset.type === "generated-image").map((asset) => (
              <figure key={asset.id} className="rounded-xl bg-white/7 p-3">
                <img src={asset.url} alt={asset.name} className="aspect-video rounded-lg object-cover" />
                <figcaption className="mt-3 text-sm font-bold">{asset.name}</figcaption>
              </figure>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
