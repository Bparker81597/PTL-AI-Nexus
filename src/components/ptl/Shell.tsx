import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { useClusterStore } from "../../app/useClusterStore";
import { providerStatusItems } from "../../providers/providerStatus";
import { GlassPanel, IconButton, PtlButton, SectionHeader, StatusBadge, StatusDot } from "./primitives";
import { ModuleGlyph, NexusLogo, NexusOrb, NexusWordmark, OrbitDivider } from "./brand";

const groups = [
  {
    label: "MAIN",
    links: [
      ["Mission Control", "/", "mission"],
      ["Character Studio", "/characters", "characters"],
      ["NovaCanvas", "/canvas", "canvas"],
      ["DreamFrame", "/dreamframe", "dreamframe"],
      ["NovaTone", "/novatone", "novatone"],
    ],
  },
  {
    label: "PRODUCTION",
    links: [
      ["Projects", "/projects", "projects"],
      ["Timeline", "/projects/project-monster-truck", "timeline"],
      ["Render Queue", "/render-queue", "queue"],
      ["Asset Library", "/assets", "assets"],
    ],
  },
  {
    label: "SYSTEM",
    links: [
      ["AI Engines", "/engines", "engines"],
      ["Settings", "/settings", "settings"],
    ],
  },
] as const;

function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-[236px] shrink-0 flex-col border-r border-[color:var(--ptl-border-subtle)] bg-[rgba(5,11,24,0.62)] p-4 backdrop-blur-xl lg:flex">
      <div className="mb-7">
        <NexusWordmark />
        <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-[color:var(--ptl-text-muted)]">Built by Parker Tech Labs</p>
      </div>
      <nav className="grid gap-6" aria-label="Primary navigation">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-2 text-[11px] font-semibold tracking-[0.16em] text-[color:var(--ptl-text-muted)]">{group.label}</p>
            <div className="grid gap-1">
              {group.links.map(([label, href, icon]) => (
                <NavLink
                  key={href}
                  to={href}
                  end={href === "/"}
                  className={({ isActive }) =>
                    `focus-ring flex min-h-11 items-center gap-3 rounded-[12px] border px-3 text-sm font-medium transition duration-200 hover:-translate-y-0.5 ${
                      isActive
                        ? "border-[color:var(--ptl-border-active)] bg-[color:var(--ptl-bg-hover)] text-white shadow-[var(--ptl-glow-cyan)]"
                        : "border-transparent text-[color:var(--ptl-text-secondary)] hover:bg-white/[0.04] hover:text-white"
                    }`
                  }
                >
                  <span className="grid h-7 w-7 place-items-center rounded-[10px] bg-white/[0.06] text-[color:var(--ptl-cyan-soft)]">
                    <ModuleGlyph module={icon} className="h-4 w-4" />
                  </span>
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="mt-6 rounded-[18px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.035] p-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--ptl-cyan-soft)]">Brand hierarchy</p>
        <div className="mt-3 space-y-2 text-xs text-[color:var(--ptl-text-secondary)]">
          <p className="font-semibold text-white">Parker Tech Labs</p>
          <OrbitDivider />
          <p>PTL AI Nexus</p>
          <p className="text-[color:var(--ptl-text-muted)]">A Creative Universe</p>
        </div>
      </div>
      <div className="mt-auto rounded-[18px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.035] p-3">
        <p className="text-xs text-[color:var(--ptl-text-muted)]">Signed in as</p>
        <div className="mt-2 flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-[image:var(--ptl-gradient-primary)] text-sm font-semibold text-[#03101b]">BP</div>
          <div>
            <p className="text-sm font-semibold">Parker Tech Labs</p>
            <p className="text-xs text-[color:var(--ptl-text-muted)]">Creator workspace</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function MobileNav() {
  const links = groups.flatMap((group) => group.links);
  return (
    <nav className="mobile-bottom-nav fixed inset-x-3 bottom-3 z-40 overflow-x-auto rounded-[20px] border border-[color:var(--ptl-border-subtle)] bg-[rgba(5,11,24,0.9)] p-2 backdrop-blur-xl lg:hidden" aria-label="Mobile navigation">
      <div className="flex min-w-max gap-1">
      {links.map(([label, href, icon]) => (
        <NavLink key={href} to={href} end={href === "/"} aria-label={label} className={({ isActive }) => `focus-ring grid min-h-12 w-[72px] place-items-center rounded-[14px] px-1 text-center text-[10px] font-semibold ${isActive ? "bg-[color:var(--ptl-bg-hover)] text-[color:var(--ptl-cyan)]" : "text-[color:var(--ptl-text-secondary)]"}`}>
          <ModuleGlyph module={icon} className="h-5 w-5" />
          <span className="line-clamp-1">{label.replace("Character ", "").replace("Render ", "")}</span>
        </NavLink>
      ))}
      </div>
    </nav>
  );
}

function Topbar() {
  const settings = useClusterStore((state) => state.settings);
  const jobs = useClusterStore((state) => state.renderJobs);
  const activeJobs = jobs.filter((job) => ["queued", "preparing", "running"].includes(job.status)).length;
  return (
    <header className="sticky top-0 z-30 border-b border-[color:var(--ptl-border-subtle)] bg-[rgba(5,11,24,0.72)] px-0 py-4 backdrop-blur-xl">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--ptl-cyan-soft)]">PTL AI Nexus</p>
          <h1 className="font-display text-xl font-semibold md:text-2xl">{settings?.currentWorkspace ?? "Parker Tech Labs"}</h1>
          <p className="text-xs text-[color:var(--ptl-text-muted)]">One platform. Infinite creativity. Everything connects.</p>
        </div>
        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2 sm:flex sm:flex-wrap">
          <label className="sr-only" htmlFor="global-search">Search projects, assets, characters</label>
          <input id="global-search" className="focus-ring col-span-3 min-h-11 min-w-0 flex-1 rounded-[12px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.055] px-4 text-sm text-white placeholder:text-[color:var(--ptl-text-muted)] sm:col-auto sm:w-80" placeholder="Search projects, assets, characters..." />
          <span className="inline-flex min-h-11 items-center gap-2 rounded-[12px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.04] px-3 text-sm text-[color:var(--ptl-text-secondary)]"><StatusDot tone={activeJobs ? "cyan" : "muted"} pulse={activeJobs > 0} />{activeJobs} active</span>
          <IconButton label="Notifications">
            <NexusLogo className="h-6 w-6" title="Nexus notification center" />
          </IconButton>
          <div className="grid h-11 w-11 place-items-center rounded-full bg-[image:var(--ptl-gradient-primary)] text-sm font-semibold text-[#03101b]" aria-label="User profile placeholder">BP</div>
        </div>
      </div>
    </header>
  );
}

function RightRail() {
  const projects = useClusterStore((state) => state.projects);
  const assets = useClusterStore((state) => state.assets);
  const scenes = useClusterStore((state) => state.scenes);
  const jobs = useClusterStore((state) => state.renderJobs);
  const project = projects.find((item) => item.id === "project-monster-truck") ?? projects[0];
  const projectScenes = project ? scenes.filter((scene) => scene.projectId === project.id) : [];
  const latestJob = [...jobs].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  const latestAsset = [...assets].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  const connected = providerStatusItems.filter((item) => item.status === "connected");
  return (
    <aside className="grid gap-4 xl:w-[292px] xl:shrink-0">
      <GlassPanel as="aside">
        <SectionHeader eyebrow="PTL Producer" title="Creative guidance" />
        <div className="mb-4 grid h-20 place-items-center rounded-[16px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.035]">
          <NexusOrb className="h-16 w-16" />
        </div>
        <p className="text-sm leading-6 text-[color:var(--ptl-text-secondary)]">
          {projectScenes.some((scene) => scene.status === "image-ready")
            ? "A scene is ready for animation. Send its source image to DreamFrame when you are ready."
            : latestJob?.status === "completed"
              ? "Your latest render completed and is available in the Asset Library."
              : "Build the next PTL Crew pilot scene from the production timeline."}
        </p>
        <div className="mt-4 flex items-center justify-between gap-3 rounded-[14px] bg-white/[0.035] px-3 py-2 text-xs text-[color:var(--ptl-text-muted)]">
          <span>Build. Learn. Create.</span>
          <NexusOrb className="h-8 w-8" />
        </div>
        <PtlButton className="mt-4 w-full" variant="secondary">Open Producer</PtlButton>
      </GlassPanel>
      <GlassPanel>
        <SectionHeader eyebrow="Activity" title="Recent signals" />
        <div className="grid gap-3">
          {latestJob && <ActivityLine title={`${latestJob.generationType} ${latestJob.status}`} meta={latestJob.projectName ?? "No project"} />}
          {latestAsset && <ActivityLine title={`${latestAsset.type} saved`} meta={latestAsset.name} />}
          {project && <ActivityLine title="Project active" meta={`${projectScenes.length} scenes in timeline`} />}
        </div>
      </GlassPanel>
      <GlassPanel>
        <SectionHeader eyebrow="Systems" title="Engine status" />
        <div className="grid gap-2">
          {providerStatusItems.slice(0, 5).map((provider) => (
            <div key={provider.id} className="flex items-center justify-between gap-3 rounded-[12px] bg-white/[0.035] px-3 py-2">
              <span className="text-sm font-medium">{provider.name}</span>
              <StatusBadge status={provider.status} />
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-[color:var(--ptl-text-muted)]">{connected.length} live provider, external engines not configured.</p>
      </GlassPanel>
    </aside>
  );
}

function ActivityLine({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="flex gap-3">
      <span className="mt-1 h-2 w-2 rounded-full bg-[color:var(--ptl-cyan)] shadow-[var(--ptl-glow-cyan)]" />
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-[color:var(--ptl-text-muted)]">{meta}</p>
      </div>
    </div>
  );
}

export function PtlAppShell({ children }: { children: ReactNode }) {
  const notices = useClusterStore((state) => state.notices);
  const dismissNotice = useClusterStore((state) => state.dismissNotice);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const seen = window.localStorage.getItem("ptl.nexus.onboarding.seen");
    setShowOnboarding(!seen);
  }, []);

  const completeOnboarding = () => {
    window.localStorage.setItem("ptl.nexus.onboarding.seen", "true");
    setShowOnboarding(false);
  };

  return (
    <div className="min-h-screen lg:flex">
      <Sidebar />
      <div className="min-w-0 flex-1 pb-32 lg:pb-0">
        <div className="mx-auto grid w-full max-w-[1780px] gap-5 px-3 sm:px-4 lg:px-6 xl:grid-cols-[minmax(0,1fr)_292px]">
          <div className="min-w-0 overflow-x-hidden">
            <Topbar />
            <main className="ptl-fade-in min-w-0 overflow-x-hidden py-5">{children}</main>
          </div>
          <div className="hidden py-5 xl:block">
            <RightRail />
          </div>
          <div className="xl:hidden">
            <RightRail />
          </div>
        </div>
      </div>
      <MobileNav />
      {showOnboarding && <NexusOnboarding onClose={completeOnboarding} />}
      <div className="fixed bottom-20 right-4 z-50 grid gap-2 lg:bottom-4">
        {notices.slice(0, 3).map((notice) => (
          <button key={notice.id} type="button" onClick={() => dismissNotice(notice.id)} className="focus-ring max-w-sm rounded-[16px] border border-[color:var(--ptl-border-subtle)] bg-[color:var(--ptl-bg-panel-strong)] px-4 py-3 text-left text-sm font-medium shadow-[var(--ptl-glow-cyan)] backdrop-blur-xl">
            {notice.message}
          </button>
        ))}
      </div>
    </div>
  );
}

function NexusOnboarding({ onClose }: { onClose: () => void }) {
  const steps = [
    ["Mission Control", "Manage active productions, scenes, and progress.", "/", "mission"],
    ["Characters", "Keep references, outfits, prompts, and continuity connected.", "/characters", "characters"],
    ["Creative Modules", "Create and manage images, clips, audio, and assets.", "/canvas", "canvas"],
  ] as const;

  return (
    <div
      className="fixed inset-0 z-[70] grid items-start justify-center overflow-y-auto bg-[#050b18]/78 px-4 py-[max(1rem,env(safe-area-inset-top))] backdrop-blur-md sm:items-center sm:px-6 sm:py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="nexus-welcome-title"
    >
      <GlassPanel className="w-full max-w-[680px] min-w-0 rounded-[24px] border-[color:var(--ptl-border-active)] p-5 shadow-[var(--ptl-glow-cyan)] sm:p-6 md:p-7">
        <div className="text-center md:flex md:items-center md:gap-6 md:text-left">
          <NexusLogo className="mx-auto h-24 w-24 shrink-0 md:mx-0 md:h-28 md:w-28" />
          <div className="mt-5 min-w-0 md:mt-0">
            <p className="text-[clamp(0.75rem,2.8vw,0.875rem)] font-semibold uppercase tracking-[0.2em] text-[color:var(--ptl-cyan-soft)]">Parker Tech Labs</p>
            <h2 id="nexus-welcome-title" className="mt-2 font-display text-[clamp(2rem,9vw,2.5rem)] font-semibold leading-tight">PTL AI Nexus</h2>
            <p className="mt-2 text-[clamp(1.3rem,5vw,1.6rem)] leading-tight text-[color:var(--ptl-text-secondary)]">A Creative Universe</p>
            <p className="mx-auto mt-4 max-w-xl text-[clamp(1rem,3.8vw,1.125rem)] leading-7 text-[color:var(--ptl-text-secondary)] md:mx-0">
              Welcome to PTL AI Nexus, the creative production workspace from Parker Tech Labs. Let&apos;s bring your next world to life.
            </p>
            <Link to="/" onClick={onClose} className="focus-ring mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-[12px] border border-transparent bg-[image:var(--ptl-gradient-primary)] px-5 text-sm font-semibold text-[#03101b] shadow-[var(--ptl-glow-cyan)] transition duration-200 hover:brightness-110 sm:w-auto">
              Enter Mission Control
            </Link>
          </div>
        </div>
        <OrbitDivider className="my-4 sm:my-5" />
        <div className="grid gap-2.5 md:grid-cols-3">
          {steps.map(([title, copy, href, icon]) => (
            <Link
              key={title}
              to={href}
              onClick={onClose}
              className="focus-ring flex min-h-16 items-center gap-3 rounded-[16px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.035] p-4 text-left transition hover:border-[color:var(--ptl-border-active)] hover:bg-[color:var(--ptl-bg-hover)] md:block md:min-h-0"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-white/[0.06] text-[color:var(--ptl-cyan-soft)] md:mb-3">
                <ModuleGlyph module={icon} className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[clamp(1.05rem,4vw,1.2rem)] font-semibold leading-tight">{title}</span>
                <span className="mt-1 block text-[clamp(0.95rem,3.3vw,1rem)] leading-5 text-[color:var(--ptl-text-secondary)]">{copy}</span>
              </span>
              <span className="shrink-0 text-lg text-[color:var(--ptl-cyan-soft)] md:hidden" aria-hidden="true">&gt;</span>
            </Link>
          ))}
        </div>
        <Link
          to="/settings"
          onClick={onClose}
          className="focus-ring mt-4 flex min-h-11 items-center justify-between rounded-[14px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.025] px-4 py-3 text-sm text-[color:var(--ptl-text-secondary)] transition hover:bg-white/[0.05]"
        >
          <span>
            <span className="block font-semibold text-white">Built by Brittany Parker</span>
            <span className="text-xs text-[color:var(--ptl-text-muted)]">Founder of Parker Tech Labs</span>
          </span>
          <span className="text-lg text-[color:var(--ptl-cyan-soft)]" aria-hidden="true">&gt;</span>
        </Link>
      </GlassPanel>
    </div>
  );
}
