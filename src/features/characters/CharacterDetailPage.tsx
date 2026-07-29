import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useClusterStore } from "../../app/useClusterStore";
import { Button, Card, Field, PageHeader, inputClass, textareaClass } from "../../components/Ui";
import type { Character } from "../../types/domain";

const toList = (value: string): string[] =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

export function CharacterDetailPage() {
  const { characterId } = useParams();
  const navigate = useNavigate();
  const { characters, projects, updateCharacter, duplicateCharacter, deleteCharacter, addCharacterToProject } =
    useClusterStore();
  const character = characters.find((item) => item.id === characterId);
  const monsterProject = projects.find((project) => project.id === "project-monster-truck") ?? projects[0];
  const [isEditing, setIsEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [draft, setDraft] = useState<Character | undefined>(character);

  const colorText = useMemo(() => draft?.colors.join("\n") ?? "", [draft?.colors]);

  useEffect(() => {
    if (character && !isEditing) {
      setDraft(character);
    }
  }, [character, isEditing]);

  if (!character && !draft) {
    return (
      <Card>
        <p>Character not found.</p>
        <Link className="text-cyan-200 underline" to="/characters">
          Back to Character Studio
        </Link>
      </Card>
    );
  }

  if (!character || !draft) {
    return <p className="text-slate-300">Loading character...</p>;
  }

  const save = async (event: FormEvent) => {
    event.preventDefault();
    await updateCharacter(draft);
    setIsEditing(false);
  };

  const cancel = () => {
    setDraft(character);
    setIsEditing(false);
  };

  const openCanvas = () => {
    navigate(`/canvas?projectId=${monsterProject?.id ?? ""}&characterIds=${character.id}`, {
      state: {
        projectId: monsterProject?.id,
        characterIds: [character.id],
        prompt: `${character.name} in a polished Parker Tech Labs monster truck adventure scene. ${character.consistencyPrompt}`,
      },
    });
  };

  const openDreamFrame = () => {
    navigate(`/dreamframe?projectId=${monsterProject?.id ?? ""}&characterIds=${character.id}`, {
      state: {
        projectId: monsterProject?.id,
        characterIds: [character.id],
        motionPrompt: `${character.name} moves with expressive, consistent animated character motion.`,
      },
    });
  };

  return (
    <>
      <PageHeader eyebrow="Character detail" title={character.name}>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setIsEditing(true)}>Edit Character</Button>
          <Button variant="secondary" onClick={() => void duplicateCharacter(character.id)}>
            Duplicate Character
          </Button>
          <Button variant="secondary" onClick={openCanvas}>
            Use in NovaCanvas
          </Button>
          <Button variant="secondary" onClick={openDreamFrame}>
            Use in DreamFrame
          </Button>
          <Button
            variant="secondary"
            onClick={() => monsterProject && void addCharacterToProject(monsterProject.id, character.id)}
          >
            Add to Project
          </Button>
        </div>
      </PageHeader>

      {isEditing ? (
        <Card>
          <form className="grid gap-4" onSubmit={save}>
            <div className="grid gap-4 lg:grid-cols-2">
              <Field label="Character name">
                <input
                  className={inputClass}
                  value={draft.name}
                  onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                  required
                />
              </Field>
              <Field label="Age range">
                <input
                  className={inputClass}
                  value={draft.ageRange ?? ""}
                  onChange={(event) => setDraft({ ...draft, ageRange: event.target.value })}
                />
              </Field>
              <Field label="Visual style">
                <input
                  className={inputClass}
                  value={draft.visualStyle}
                  onChange={(event) => setDraft({ ...draft, visualStyle: event.target.value })}
                />
              </Field>
              <Field label="Default outfit">
                <input
                  className={inputClass}
                  value={draft.defaultOutfit ?? ""}
                  onChange={(event) => setDraft({ ...draft, defaultOutfit: event.target.value })}
                />
              </Field>
            </div>
            <Field label="Description">
              <textarea
                className={textareaClass}
                value={draft.description}
                onChange={(event) => setDraft({ ...draft, description: event.target.value })}
              />
            </Field>
            <div className="grid gap-4 lg:grid-cols-3">
              <Field label="Outfits, one per line">
                <textarea
                  className={textareaClass}
                  value={draft.outfits.join("\n")}
                  onChange={(event) => setDraft({ ...draft, outfits: toList(event.target.value) })}
                />
              </Field>
              <Field label="Expressions, one per line">
                <textarea
                  className={textareaClass}
                  value={draft.expressions.join("\n")}
                  onChange={(event) => setDraft({ ...draft, expressions: toList(event.target.value) })}
                />
              </Field>
              <Field label="Colors, one hex value per line">
                <textarea
                  className={textareaClass}
                  value={colorText}
                  onChange={(event) => setDraft({ ...draft, colors: toList(event.target.value) })}
                />
              </Field>
            </div>
            <Field label="Consistency prompt">
              <textarea
                className={textareaClass}
                value={draft.consistencyPrompt}
                onChange={(event) => setDraft({ ...draft, consistencyPrompt: event.target.value })}
              />
            </Field>
            <Field label="Negative prompt">
              <textarea
                className={textareaClass}
                value={draft.negativePrompt ?? ""}
                onChange={(event) => setDraft({ ...draft, negativePrompt: event.target.value })}
              />
            </Field>
            <div className="grid gap-4 lg:grid-cols-2">
              <Field label="LoRA name placeholder">
                <input
                  className={inputClass}
                  value={draft.loraName ?? ""}
                  onChange={(event) => setDraft({ ...draft, loraName: event.target.value })}
                />
              </Field>
              <Field label="LoRA strength">
                <input
                  className={inputClass}
                  type="number"
                  min={0}
                  max={1}
                  step={0.01}
                  value={draft.loraStrength ?? 0}
                  onChange={(event) => setDraft({ ...draft, loraStrength: Number(event.target.value) })}
                />
              </Field>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="submit">Save Changes</Button>
              <Button variant="secondary" onClick={cancel}>
                Cancel
              </Button>
              <Button variant="danger" onClick={() => setConfirmingDelete(true)}>
                Delete Character
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <h3 className="mb-4 text-xl font-black">Large reference-image gallery</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {character.referenceImages.map((asset) => (
                <figure key={asset.id} className="rounded-xl bg-white/7 p-3">
                  <img src={asset.url} alt={asset.name} className="aspect-video rounded-lg object-cover" />
                  <figcaption className="mt-2 text-sm font-bold">{asset.name}</figcaption>
                </figure>
              ))}
            </div>
          </Card>
          <div className="grid gap-4">
            <Card>
              <h3 className="text-xl font-black">{character.name}</h3>
              <p className="mt-2 leading-7 text-slate-300">{character.description}</p>
              <dl className="mt-4 grid gap-3 text-sm">
                <div><dt className="font-black text-cyan-100">Age range</dt><dd>{character.ageRange}</dd></div>
                <div><dt className="font-black text-cyan-100">Visual style</dt><dd>{character.visualStyle}</dd></div>
                <div><dt className="font-black text-cyan-100">Default outfit</dt><dd>{character.defaultOutfit}</dd></div>
                <div><dt className="font-black text-cyan-100">Created</dt><dd>{new Date(character.createdAt).toLocaleString()}</dd></div>
                <div><dt className="font-black text-cyan-100">Updated</dt><dd>{new Date(character.updatedAt).toLocaleString()}</dd></div>
              </dl>
            </Card>
            <Card>
              <h3 className="mb-3 text-xl font-black">Outfits</h3>
              <div className="flex flex-wrap gap-2">{character.outfits.map((item) => <span key={item} className="rounded-full bg-white/10 px-3 py-2 text-sm font-bold">{item}</span>)}</div>
            </Card>
            <Card>
              <h3 className="mb-3 text-xl font-black">Expressions</h3>
              <div className="flex flex-wrap gap-2">{character.expressions.map((item) => <span key={item} className="rounded-full bg-cyan-300/15 px-3 py-2 text-sm font-bold">{item}</span>)}</div>
            </Card>
          </div>
          <Card>
            <h3 className="mb-3 text-xl font-black">Prompts</h3>
            <p className="text-sm font-black text-cyan-100">Consistency prompt</p>
            <p className="mt-2 leading-7 text-slate-300">{character.consistencyPrompt}</p>
            <p className="mt-4 text-sm font-black text-cyan-100">Negative prompt</p>
            <p className="mt-2 leading-7 text-slate-300">{character.negativePrompt}</p>
          </Card>
          <Card>
            <h3 className="mb-3 text-xl font-black">Color palette and LoRA</h3>
            <div className="mb-4 flex flex-wrap gap-2">{character.colors.map((color) => <span key={color} className="h-10 w-10 rounded-xl border border-white/20" style={{ backgroundColor: color }} aria-label={color} />)}</div>
            <p className="text-slate-300">LoRA: {character.loraName ?? "Placeholder not configured"}</p>
            <p className="text-slate-300">Strength: {character.loraStrength ?? 0}</p>
          </Card>
        </div>
      )}

      {confirmingDelete && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-navy-950/80 p-4">
          <Card className="max-w-md">
            <h3 className="text-xl font-black">Delete {character.name}?</h3>
            <p className="mt-2 text-slate-300">This removes the character from local storage. Project links remain as historical IDs.</p>
            <div className="mt-5 flex gap-2">
              <Button
                variant="danger"
                onClick={() => {
                  void deleteCharacter(character.id);
                  navigate("/characters");
                }}
              >
                Confirm Delete
              </Button>
              <Button variant="secondary" onClick={() => setConfirmingDelete(false)}>
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
