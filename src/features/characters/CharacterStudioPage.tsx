import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { useClusterStore } from "../../app/useClusterStore";
import { Button, Card, Field, PageHeader, inputClass, textareaClass } from "../../components/Ui";

export function CharacterStudioPage() {
  const { characters, createCharacter } = useClusterStore();
  const [form, setForm] = useState({
    name: "",
    description: "",
    visualStyle: "Bright 3D animated adventure",
    consistencyPrompt: "",
  });

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) return;
    await createCharacter(form);
    setForm({ name: "", description: "", visualStyle: "Bright 3D animated adventure", consistencyPrompt: "" });
  };

  return (
    <>
      <PageHeader eyebrow="PTL Character Studio" title="Character consistency hub" />
      <div className="grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
        <Card>
          <h3 className="mb-4 text-xl font-black">Create character</h3>
          <form className="grid gap-4" onSubmit={submit}>
            <Field label="Name"><input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Description"><textarea className={textareaClass} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
            <Field label="Visual style"><input className={inputClass} value={form.visualStyle} onChange={(e) => setForm({ ...form, visualStyle: e.target.value })} /></Field>
            <Field label="Consistency prompt"><textarea className={textareaClass} value={form.consistencyPrompt} onChange={(e) => setForm({ ...form, consistencyPrompt: e.target.value })} /></Field>
            <Button type="submit">Save Character</Button>
          </form>
        </Card>
        <div className="grid gap-4 md:grid-cols-2">
          {characters.map((character) => (
            <Link key={character.id} to={`/characters/${character.id}`}>
              <Card className="h-full transition hover:-translate-y-1">
                <div className="mb-4 flex gap-2">
                  {character.colors.map((color) => <span key={color} className="h-6 w-6 rounded-full border border-white/20" style={{ background: color }} />)}
                </div>
                <h3 className="text-2xl font-black">{character.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{character.description}</p>
                <p className="mt-4 text-sm font-bold text-cyan-100">{character.referenceImages.length} references</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
