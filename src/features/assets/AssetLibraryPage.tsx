import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useClusterStore } from "../../app/useClusterStore";
import { Button, Card, PageHeader, StatusBadge, inputClass } from "../../components/Ui";

export function AssetLibraryPage() {
  const navigate = useNavigate();
  const { assets, projects, scenes, characters, updateAsset, deleteAsset } = useClusterStore();
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const filtered = useMemo(
    () =>
      assets.filter((asset) => {
        const searchable = [asset.name, asset.type, asset.category, ...(asset.tags ?? [])].filter(Boolean).join(" ").toLowerCase();
        return searchable.includes(query.toLowerCase());
      }),
    [assets, query],
  );

  return (
    <>
      <PageHeader eyebrow="Asset Library" title="Creator asset manager">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input aria-label="Search assets" className={inputClass} placeholder="Search assets" value={query} onChange={(event) => setQuery(event.target.value)} />
          <select aria-label="View mode" className={inputClass} value={view} onChange={(event) => setView(event.target.value as "grid" | "list")}><option>grid</option><option>list</option></select>
        </div>
      </PageHeader>
      <div className={view === "grid" ? "grid gap-4 md:grid-cols-2 xl:grid-cols-3" : "grid gap-3"}>
        {filtered.map((asset) => {
          const project = projects.find((item) => item.id === asset.projectId);
          const scene = scenes.find((item) => item.id === asset.sceneId);
          const linkedCharacters = characters.filter((character) => asset.characterIds?.includes(character.id) || asset.characterId === character.id);
          const validLocalFile = asset.url.startsWith("blob:") || asset.url.startsWith("data:");
          return (
            <Card key={asset.id}>
              {asset.url.startsWith("http") || asset.url.startsWith("data:image") || asset.url.startsWith("blob:") ? (
                <img src={asset.url} alt={asset.name} className="mb-4 aspect-video rounded-xl object-cover" />
              ) : (
                <div className="mb-4 grid aspect-video place-items-center rounded-xl bg-white/10 text-sm font-bold">{asset.type}</div>
              )}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-black">{asset.name}</h3>
                  <p className="text-sm text-slate-300">{asset.type}</p>
                  {asset.category && <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100">{asset.category}</p>}
                </div>
                <StatusBadge status={asset.isMock ? "mock" : "real"} />
              </div>
              {asset.tags && asset.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {asset.tags.slice(0, 6).map((tag) => <span key={tag} className="rounded-[10px] bg-white/10 px-2 py-1 text-xs">{tag}</span>)}
                </div>
              )}
              <dl className="mt-4 grid gap-2 text-sm text-slate-300">
                <div><dt className="font-black text-cyan-100">Project</dt><dd>{project?.name ?? "Unassigned"}</dd></div>
                <div><dt className="font-black text-cyan-100">Scene</dt><dd>{scene?.title ?? "Unassigned"}</dd></div>
                <div><dt className="font-black text-cyan-100">Characters</dt><dd>{linkedCharacters.map((character) => character.name).join(", ") || "None"}</dd></div>
                <div><dt className="font-black text-cyan-100">Provider</dt><dd>{asset.providerId ?? "local"}</dd></div>
                <div><dt className="font-black text-cyan-100">Created</dt><dd>{new Date(asset.createdAt).toLocaleString()}</dd></div>
                <div><dt className="font-black text-cyan-100">Dimensions / duration</dt><dd>{asset.dimensions ?? "N/A"} {asset.duration ? `- ${asset.duration}s` : ""}</dd></div>
                <div><dt className="font-black text-cyan-100">Metadata</dt><dd>{JSON.stringify(asset.metadata ?? {})}</dd></div>
              </dl>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="secondary">Open</Button>
                {asset.type === "generated-image" && <Button variant="secondary" onClick={() => navigate(`/canvas?projectId=${asset.projectId ?? ""}&sceneId=${asset.sceneId ?? ""}`)}>Use in NovaCanvas</Button>}
                {asset.type === "generated-image" && <Button onClick={() => navigate(`/dreamframe?projectId=${asset.projectId ?? ""}&sceneId=${asset.sceneId ?? ""}&sourceAssetId=${asset.id}`, { state: { projectId: asset.projectId, sceneId: asset.sceneId, sourceAssetId: asset.id, characterIds: asset.characterIds } })}>Use in DreamFrame</Button>}
                {project ? (
                  <Button variant="secondary" onClick={() => void updateAsset({ ...asset, projectId: undefined })}>Remove from Project</Button>
                ) : (
                  <Button variant="secondary" onClick={() => projects[0] && void updateAsset({ ...asset, projectId: projects[0].id })}>Add to Project</Button>
                )}
                {validLocalFile && <a className="focus-ring inline-flex min-h-11 items-center rounded-xl bg-white/10 px-4 text-sm font-black" href={asset.url} download={asset.name}>Download</a>}
                <Button variant="danger" onClick={() => window.confirm("Delete this asset?") && void deleteAsset(asset.id)}>Delete</Button>
              </div>
            </Card>
          );
        })}
      </div>
      {filtered.length === 0 && <Card><p>No assets match your search.</p></Card>}
    </>
  );
}
