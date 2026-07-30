import { Card, PageHeader } from "../../components/Ui";
import { NexusLogo, OrbitDivider } from "../../components/ptl";

const brittanyReference = `${import.meta.env.BASE_URL}assets/parker-tech-labs/brittany/branding/brittanyverse-character-bible.png`;

export function SettingsPage() {
  return (
    <>
      <PageHeader eyebrow="Settings" title="Workspace configuration" />
      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            <NexusLogo className="h-24 w-24 shrink-0" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--ptl-cyan-soft)]">Built by Parker Tech Labs</p>
              <h2 className="mt-2 font-display text-2xl font-semibold">PTL AI Nexus</h2>
              <p className="mt-1 text-[color:var(--ptl-text-secondary)]">A Creative Universe</p>
              <p className="mt-4 max-w-xl text-sm leading-6 text-[color:var(--ptl-text-secondary)]">One platform. Infinite creativity. Everything connects.</p>
            </div>
          </div>
          <OrbitDivider className="my-5" />
          <div className="grid gap-2 text-sm text-[color:var(--ptl-text-secondary)]">
            <p><strong className="text-white">Creative modules:</strong> Character Studio, NovaCanvas, DreamFrame, NovaTone, CodeVerse, NovaKart.</p>
            <p><strong className="text-white">Production layer:</strong> Projects, Timeline, Scenes, Assets, AI Engines.</p>
          </div>
        </Card>
        <Card>
          <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
            <div className="overflow-hidden rounded-[20px] border border-[color:var(--ptl-border-active)] bg-[#07111f]">
              <img src={brittanyReference} alt="Brittany Parker founder character bible reference" className="aspect-[4/5] h-full w-full object-cover object-left" loading="lazy" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--ptl-cyan-soft)]">Founder Profile</p>
              <h3 className="mt-2 font-display text-2xl font-semibold">Brittany Parker</h3>
              <p className="mt-1 text-sm font-semibold text-[color:var(--ptl-violet-soft)]">Founder, Creator, Builder, and Dreamer</p>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-[color:var(--ptl-text-secondary)]">
                Brittany represents the Parker Tech Labs platform layer: innovation, creative technology, product development, coding,
                visual art, music, strategy, leadership, and creator education. Her mission is to empower creators, developers, and
                dreamers to build greater futures.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Parker Tech Labs", "PTL AI Nexus", "NovaTone", "NovaCanvas", "CodeVerse", "PTL Universe"].map((item) => (
                  <span key={item} className="rounded-[10px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.035] px-3 py-2 text-xs font-semibold text-[color:var(--ptl-text-secondary)]">
                    {item}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm font-medium text-white">Build. Learn. Create.</p>
            </div>
          </div>
        </Card>
        <Card className="xl:col-span-2">
          <h3 className="mb-3 text-xl font-black">Security rules</h3>
          <p className="max-w-3xl leading-7 text-slate-300">
            Frontend environment variables can only use public values. RunPod keys, Cloudflare R2 secrets,
            Supabase service keys, and provider credentials must live in a secure backend service.
          </p>
        </Card>
      </div>
    </>
  );
}
