import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { useClusterStore } from "../../app/useClusterStore";
import { FeaturePanel, GlassPanel, MediaPreview, PageHeader, PtlButton, PtlField, PtlInput, PtlTextarea, SectionHeader } from "../../components/ptl";

export function CharacterStudioPage() {
  const { characters, createCharacter } = useClusterStore();
  const [selectedCharacterId, setSelectedCharacterId] = useState(characters[0]?.id);
  const selected = characters.find((character) => character.id === selectedCharacterId) ?? characters[0];
  const [form, setForm] = useState({
    name: "",
    description: "",
    visualStyle: "Bright 3D animated adventure",
    consistencyPrompt: "",
  });

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) return;
    const character = await createCharacter(form);
    setSelectedCharacterId(character.id);
    setForm({ name: "", description: "", visualStyle: "Bright 3D animated adventure", consistencyPrompt: "" });
  };

  return (
    <div className="grid gap-5">
      <PageHeader eyebrow="PTL Character Studio" title="Character identity workspace">
        {selected && <Link to={`/characters/${selected.id}`}><PtlButton>Open {selected.name}</PtlButton></Link>}
      </PageHeader>

      <div className="grid gap-5 xl:grid-cols-[minmax(280px,360px)_1fr]">
        <GlassPanel>
          <SectionHeader eyebrow="Library" title="Characters" />
          <div className="grid gap-3">
            {characters.map((character) => (
              <button
                key={character.id}
                type="button"
                onClick={() => setSelectedCharacterId(character.id)}
                className={`focus-ring rounded-[16px] border p-3 text-left transition hover:bg-[color:var(--ptl-bg-hover)] ${
                  selected?.id === character.id ? "border-[color:var(--ptl-border-violet)] bg-violet-400/10" : "border-[color:var(--ptl-border-subtle)] bg-white/[0.03]"
                }`}
              >
                <div className="flex gap-3">
                  <MediaPreview src={character.referenceImages[0]?.url} alt={`${character.name} reference`} className="h-16 w-16 shrink-0" />
                  <div>
                    <h3 className="font-display text-lg font-semibold">{character.name}</h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-[color:var(--ptl-text-secondary)]">{character.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </GlassPanel>

        {selected && (
          <FeaturePanel>
            <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <MediaPreview src={selected.referenceImages[0]?.url} alt={`${selected.name} selected preview`} className="aspect-[4/5]" />
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--ptl-violet-soft)]">Selected Character</p>
                <h2 className="font-display text-3xl font-semibold">{selected.name}</h2>
                <p className="mt-3 leading-7 text-[color:var(--ptl-text-secondary)]">{selected.description}</p>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <Info label="Age Range" value={selected.ageRange ?? "Not set"} />
                  <Info label="Visual Style" value={selected.visualStyle} />
                  <Info label="Default Outfit" value={selected.defaultOutfit ?? "Not set"} />
                  <Info label="References" value={selected.referenceImages.length} />
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {selected.expressions.map((expression) => <span key={expression} className="rounded-[10px] border border-violet-200/20 bg-violet-300/10 px-3 py-2 text-sm">{expression}</span>)}
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {selected.colors.map((color) => <span key={color} className="h-9 w-9 rounded-[10px] border border-white/20" style={{ backgroundColor: color }} aria-label={color} />)}
                </div>
              </div>
            </div>
          </FeaturePanel>
        )}
      </div>

      <GlassPanel>
        <SectionHeader eyebrow="Create" title="New character profile" />
        <form className="grid gap-4 lg:grid-cols-2" onSubmit={submit}>
          <PtlField label="Name"><PtlInput value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></PtlField>
          <PtlField label="Visual style"><PtlInput value={form.visualStyle} onChange={(event) => setForm({ ...form, visualStyle: event.target.value })} /></PtlField>
          <PtlField label="Description"><PtlTextarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></PtlField>
          <PtlField label="Consistency prompt"><PtlTextarea value={form.consistencyPrompt} onChange={(event) => setForm({ ...form, consistencyPrompt: event.target.value })} /></PtlField>
          <div className="lg:col-span-2"><PtlButton type="submit">Save Character</PtlButton></div>
        </form>
      </GlassPanel>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[14px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.035] p-3">
      <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--ptl-text-muted)]">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
