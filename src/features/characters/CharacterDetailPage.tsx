import { Link, useParams } from "react-router-dom";
import { useClusterStore } from "../../app/useClusterStore";
import { Button, Card, PageHeader } from "../../components/Ui";

export function CharacterDetailPage() {
  const { characterId } = useParams();
  const character = useClusterStore((state) => state.characters.find((item) => item.id === characterId));

  if (!character) return <Card><p>Character not found.</p><Link to="/characters">Back to Character Studio</Link></Card>;

  return (
    <>
      <PageHeader eyebrow="Character detail" title={character.name}>
        <Link to="/dreamframe"><Button>Use in Scene</Button></Link>
      </PageHeader>
      <div className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
        <Card>
          <h3 className="mb-3 text-xl font-black">Reference-image gallery</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {character.referenceImages.map((asset) => <img key={asset.id} src={asset.url} alt={asset.name} className="aspect-video rounded-xl object-cover" />)}
          </div>
          <h3 className="mb-3 mt-6 text-xl font-black">Consistency prompt editor</h3>
          <textarea aria-label="Consistency prompt" className="min-h-36 w-full rounded-xl border border-white/10 bg-white/10 p-3 text-sm" defaultValue={character.consistencyPrompt} />
        </Card>
        <div className="grid gap-4">
          <Card><h3 className="mb-3 text-xl font-black">Expressions</h3><div className="flex flex-wrap gap-2">{character.expressions.map((item) => <span key={item} className="rounded-full bg-cyan-300/15 px-3 py-2 text-sm font-bold">{item}</span>)}</div></Card>
          <Card><h3 className="mb-3 text-xl font-black">Outfits</h3><div className="grid gap-2">{character.outfits.map((item) => <span key={item} className="rounded-xl bg-white/7 p-3 font-bold">{item}</span>)}</div></Card>
          <Card><h3 className="mb-3 text-xl font-black">LoRA settings</h3><p className="text-slate-300">{character.loraName ?? "No LoRA attached yet"} at strength {character.loraStrength ?? 0}</p></Card>
        </div>
      </div>
    </>
  );
}
