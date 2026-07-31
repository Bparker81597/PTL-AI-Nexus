import { Card, PageHeader, StatusBadge } from "../../components/Ui";
import { providerStatusItems } from "../../providers/providerStatus";

export function AiEnginesPage() {
  return (
    <>
      <PageHeader eyebrow="AI Engines" title="Provider adapter system" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {providerStatusItems.map((provider) => (
          <Card key={provider.id}>
            <div className="flex items-center justify-between gap-3"><h3 className="text-xl font-black">{provider.name}</h3><StatusBadge status={provider.status} /></div>
            <p className="mt-2 text-sm text-slate-300">{provider.category} provider</p>
            <div className="mt-4 flex flex-wrap gap-2">{provider.capabilities.map((capability) => <span key={capability} className="rounded-full bg-purple-300/15 px-3 py-1 text-xs font-bold text-purple-100">{capability}</span>)}</div>
            {provider.id === "live-video-gateway" ? (
              <p className="mt-4 text-sm text-slate-300">Uses VITE_API_BASE_URL to call a secure server-side generation gateway. Provider secrets must stay on that backend.</p>
            ) : provider.id !== "mock" && (
              <p className="mt-4 text-sm text-slate-300">Typed configuration and connection-test placeholder. No production API calls are made.</p>
            )}
          </Card>
        ))}
      </div>
    </>
  );
}
