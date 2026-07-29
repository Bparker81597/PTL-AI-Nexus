import { useMemo, useState } from "react";
import { useClusterStore } from "../../app/useClusterStore";
import { Card, PageHeader, StatusBadge, inputClass } from "../../components/Ui";

export function AssetLibraryPage() {
  const assets = useClusterStore((state) => state.assets);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const filtered = useMemo(() => assets.filter((asset) => asset.name.toLowerCase().includes(query.toLowerCase())), [assets, query]);

  return (
    <>
      <PageHeader eyebrow="Asset Library" title="Creator asset manager">
        <div className="flex gap-2"><input aria-label="Search assets" className={inputClass} placeholder="Search assets" value={query} onChange={(e) => setQuery(e.target.value)} /><select aria-label="View mode" className={inputClass} value={view} onChange={(e) => setView(e.target.value as "grid" | "list")}><option>grid</option><option>list</option></select></div>
      </PageHeader>
      <div className={view === "grid" ? "grid gap-4 md:grid-cols-2 xl:grid-cols-4" : "grid gap-3"}>
        {filtered.map((asset) => (
          <Card key={asset.id}>
            {asset.url.startsWith("http") ? <img src={asset.url} alt={asset.name} className="mb-4 aspect-video rounded-xl object-cover" /> : <div className="mb-4 grid aspect-video place-items-center rounded-xl bg-white/10 text-sm font-bold">{asset.type}</div>}
            <div className="flex items-start justify-between gap-3"><strong>{asset.name}</strong><StatusBadge status={asset.type} /></div>
          </Card>
        ))}
      </div>
      {filtered.length === 0 && <Card><p>No assets match your search.</p></Card>}
    </>
  );
}
