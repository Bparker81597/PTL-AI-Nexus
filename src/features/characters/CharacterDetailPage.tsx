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
  const { characters, projects, scenes, assets, renderJobs, updateCharacter, duplicateCharacter, deleteCharacter, addCharacterToProject } =
    useClusterStore();
  const character = characters.find((item) => item.id === characterId);
  const monsterProject = projects.find((project) => project.id === "project-monster-truck") ?? projects[0];
  const characterProjects = projects.filter((project) => project.characterIds.includes(characterId ?? ""));
  const characterScenes = scenes.filter((scene) => scene.characterIds.includes(characterId ?? ""));
  const characterAssets = assets.filter((asset) => asset.characterIds?.includes(characterId ?? "") || asset.characterId === characterId);
  const characterJobs = renderJobs.filter((job) => job.request.characterIds?.includes(characterId ?? ""));
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
        prompt: `${character.defaultPrompt ?? character.name} in a polished Parker Tech Labs monster truck adventure scene. ${character.consistencyPrompt}`,
      },
    });
  };

  const openDreamFrame = () => {
    navigate(`/dreamframe?projectId=${monsterProject?.id ?? ""}&characterIds=${character.id}`, {
      state: {
        projectId: monsterProject?.id,
        characterIds: [character.id],
        motionPrompt: character.animationNotes || `${character.name} moves with expressive, consistent animated character motion.`,
      },
    });
  };

  return (
    <>
      <PageHeader eyebrow="Character Bible" title={character.name}>
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
              <Field label="Nickname">
                <input
                  className={inputClass}
                  value={draft.nickname ?? ""}
                  onChange={(event) => setDraft({ ...draft, nickname: event.target.value })}
                />
              </Field>
              <Field label="Role">
                <input
                  className={inputClass}
                  value={draft.role ?? ""}
                  onChange={(event) => setDraft({ ...draft, role: event.target.value })}
                />
              </Field>
              <Field label="Age">
                <input
                  className={inputClass}
                  value={draft.age ?? ""}
                  onChange={(event) => setDraft({ ...draft, age: event.target.value })}
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
              <Field label="Occupation">
                <input
                  className={inputClass}
                  value={draft.occupation ?? ""}
                  onChange={(event) => setDraft({ ...draft, occupation: event.target.value })}
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
            <div className="grid gap-4 lg:grid-cols-2">
              <Field label="Biography">
                <textarea
                  className={textareaClass}
                  value={draft.biography ?? ""}
                  onChange={(event) => setDraft({ ...draft, biography: event.target.value })}
                />
              </Field>
              <Field label="Personality">
                <textarea
                  className={textareaClass}
                  value={draft.personality ?? ""}
                  onChange={(event) => setDraft({ ...draft, personality: event.target.value })}
                />
              </Field>
            </div>
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
            <div className="grid gap-4 lg:grid-cols-3">
              <Field label="Strengths, one per line">
                <textarea className={textareaClass} value={(draft.strengths ?? []).join("\n")} onChange={(event) => setDraft({ ...draft, strengths: toList(event.target.value) })} />
              </Field>
              <Field label="Motivations, one per line">
                <textarea className={textareaClass} value={(draft.motivations ?? []).join("\n")} onChange={(event) => setDraft({ ...draft, motivations: toList(event.target.value) })} />
              </Field>
              <Field label="Catchphrases, one per line">
                <textarea className={textareaClass} value={(draft.catchphrases ?? []).join("\n")} onChange={(event) => setDraft({ ...draft, catchphrases: toList(event.target.value) })} />
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
            <div className="grid gap-4 lg:grid-cols-3">
              <Field label="Animation notes">
                <textarea className={textareaClass} value={draft.animationNotes ?? ""} onChange={(event) => setDraft({ ...draft, animationNotes: event.target.value })} />
              </Field>
              <Field label="Voice notes">
                <textarea className={textareaClass} value={draft.voiceNotes ?? ""} onChange={(event) => setDraft({ ...draft, voiceNotes: event.target.value })} />
              </Field>
              <Field label="Continuity notes">
                <textarea className={textareaClass} value={draft.continuityNotes ?? ""} onChange={(event) => setDraft({ ...draft, continuityNotes: event.target.value })} />
              </Field>
            </div>
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
        <div className="grid gap-4 2xl:grid-cols-[minmax(280px,0.9fr)_minmax(360px,1.15fr)_minmax(280px,0.85fr)]">
          <div className="grid gap-4">
            <Card className="overflow-hidden p-0">
              <img src={character.heroImage || character.portrait || character.referenceImages[0]?.url} alt={`${character.name} hero artwork`} className="aspect-[4/5] w-full object-cover" />
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100">{character.role}</p>
                <h3 className="mt-1 font-display text-2xl font-semibold">{character.name}</h3>
                <p className="mt-2 text-sm text-slate-300">{character.occupation}</p>
              </div>
            </Card>
            <Card>
              <h3 className="mb-4 text-xl font-black">Reference gallery</h3>
              <div className="grid gap-3">
                {character.referenceImages.map((asset) => (
                  <figure key={asset.id} className="rounded-xl bg-white/7 p-3">
                    <img src={asset.url} alt={asset.name} className="aspect-video rounded-lg object-cover" />
                    <figcaption className="mt-2 text-sm font-bold">{asset.name}</figcaption>
                  </figure>
                ))}
              </div>
            </Card>
            <Card><ChipGroup title="Expressions" items={character.expressions} /></Card>
            <Card><ChipGroup title="Outfits" items={character.outfits} /></Card>
            <Card><ChipGroup title="Accessories" items={character.accessories ?? []} empty="No accessories set." /></Card>
          </div>

          <div className="grid gap-4">
            <Card>
              <h3 className="text-xl font-black">Biography</h3>
              <p className="mt-3 leading-7 text-slate-300">{character.biography || character.description}</p>
              <dl className="mt-5 grid gap-3 text-sm md:grid-cols-2">
                <Info label="Age" value={character.age ?? character.ageRange ?? "Not set"} />
                <Info label="Species" value={character.species ?? "Not set"} />
                <Info label="Status" value={character.status ?? "Active"} />
                <Info label="Visual style" value={character.visualStyle} />
              </dl>
            </Card>
            <Card>
              <h3 className="mb-3 text-xl font-black">Personality and story</h3>
              <p className="leading-7 text-slate-300">{character.personality || character.description}</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <ListBlock title="Strengths" items={character.strengths ?? []} />
                <ListBlock title="Weaknesses" items={character.weaknesses ?? []} />
                <ListBlock title="Fears" items={character.fears ?? []} />
                <ListBlock title="Goals" items={character.goals ?? []} />
              </div>
            </Card>
            <Card>
              <h3 className="mb-3 text-xl font-black">Relationships</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <ListBlock title="Family" items={character.family ?? []} />
                <ListBlock title="Friends" items={character.friends ?? []} />
                <ListBlock title="Rivals" items={character.rivals ?? []} />
                <ListBlock title="Mentors" items={character.mentors ?? []} />
              </div>
            </Card>
            <Card>
              <h3 className="mb-3 text-xl font-black">Timeline appearances</h3>
              <div className="grid gap-3">
                {characterScenes.map((scene) => (
                  <div key={scene.id} className="rounded-xl bg-white/7 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <strong>{scene.order}. {scene.title}</strong>
                      <span className="text-xs text-cyan-100">{scene.status}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-300">{scene.location} · {scene.emotion}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid gap-4">
            <Card>
              <h3 className="mb-3 text-xl font-black">Production notes</h3>
              <Note label="Animation" value={character.animationNotes} />
              <Note label="Voice" value={character.voiceNotes} />
              <Note label="Continuity" value={character.continuityNotes} />
            </Card>
            <Card>
              <h3 className="mb-3 text-xl font-black">Prompt profile</h3>
              <Note label="Default prompt" value={character.defaultPrompt ?? character.consistencyPrompt} />
              <Note label="Consistency prompt" value={character.consistencyPrompt} />
              <Note label="Negative prompt" value={character.negativePrompt} />
            </Card>
            <Card>
              <h3 className="mb-3 text-xl font-black">Voice profile</h3>
              <Note label="Speaking style" value={character.speakingStyle} />
              <Note label="Tone" value={character.tone} />
              <Note label="Narration style" value={character.narrationStyle} />
              <ChipGroup title="Catchphrases" items={character.catchphrases ?? []} empty="No catchphrases set." />
            </Card>
            <Card>
              <h3 className="mb-3 text-xl font-black">Usage</h3>
              <Info label="Projects" value={characterProjects.length} />
              <Info label="Scenes" value={characterScenes.length} />
              <Info label="Recent assets" value={characterAssets.length} />
              <Info label="Render jobs" value={characterJobs.length} />
            </Card>
            <Card>
              <h3 className="mb-3 text-xl font-black">Color palette and LoRA</h3>
              <div className="mb-4 flex flex-wrap gap-2">{(character.colorPalette ?? character.colors).map((color) => <span key={color} className="h-10 w-10 rounded-xl border border-white/20" style={{ backgroundColor: color }} aria-label={color} />)}</div>
              <p className="text-slate-300">LoRA: {character.loraName ?? "Placeholder not configured"}</p>
              <p className="text-slate-300">Strength: {character.loraStrength ?? 0}</p>
            </Card>
          </div>
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

function Info({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[14px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.035] p-3">
      <p className="text-xs uppercase tracking-[0.14em] text-[color:var(--ptl-text-muted)]">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function ChipGroup({ title, items, empty = "Nothing set." }: { title: string; items: string[]; empty?: string }) {
  return (
    <div>
      <h3 className="mb-3 text-xl font-black">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {items.length ? items.map((item) => <span key={item} className="rounded-[10px] border border-cyan-200/20 bg-cyan-300/10 px-3 py-2 text-sm font-bold">{item}</span>) : <p className="text-sm text-slate-300">{empty}</p>}
      </div>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl bg-white/7 p-3">
      <p className="text-sm font-black text-cyan-100">{title}</p>
      <ul className="mt-2 grid gap-1 text-sm text-slate-300">
        {items.length ? items.map((item) => <li key={item}>{item}</li>) : <li>Not set</li>}
      </ul>
    </div>
  );
}

function Note({ label, value }: { label: string; value?: string }) {
  return (
    <div className="mb-4 last:mb-0">
      <p className="text-sm font-black text-cyan-100">{label}</p>
      <p className="mt-2 leading-6 text-slate-300">{value || "Not set."}</p>
    </div>
  );
}
