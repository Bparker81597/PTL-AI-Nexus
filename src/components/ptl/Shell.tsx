import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useClusterStore } from "../../app/useClusterStore";
import { providerStatusItems } from "../../providers/providerStatus";
import { GlassPanel, IconButton, PtlButton, SectionHeader, StatusBadge, StatusDot } from "./primitives";

const groups = [
  {
    label: "MAIN",
    links: [
      ["Mission Control", "/", "MC"],
      ["Character Studio", "/characters", "CS"],
      ["NovaCanvas", "/canvas", "NC"],
      ["DreamFrame", "/dreamframe", "DF"],
      ["NovaTone", "/novatone", "NT"],
    ],
  },
  {
    label: "PRODUCTION",
    links: [
      ["Projects", "/projects", "PR"],
      ["Timeline", "/projects/project-monster-truck", "TL"],
      ["Render Queue", "/render-queue", "RQ"],
      ["Asset Library", "/assets", "AL"],
    ],
  },
  {
    label: "SYSTEM",
    links: [
      ["AI Engines", "/engines", "AI"],
      ["Settings", "/settings", "ST"],
    ],
  },
] as const;

function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-[236px] shrink-0 flex-col border-r border-[color:var(--ptl-border-subtle)] bg-[rgba(5,11,24,0.62)] p-4 backdrop-blur-xl lg:flex">
      <div className="mb-8 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-[14px] border border-[color:var(--ptl-border-active)] bg-[color:var(--ptl-bg-hover)] font-display text-lg font-semibold text-[color:var(--ptl-cyan)] shadow-[var(--ptl-glow-cyan)]">P</div>
        <div>
          <p className="font-display text-lg font-semibold">PTL</p>
          <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--ptl-text-muted)]">AI Cluster</p>
        </div>
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
                    `focus-ring flex min-h-11 items-center gap-3 rounded-[12px] border px-3 text-sm font-medium transition duration-200 ${
                      isActive
                        ? "border-[color:var(--ptl-border-active)] bg-[color:var(--ptl-bg-hover)] text-white shadow-[var(--ptl-glow-cyan)]"
                        : "border-transparent text-[color:var(--ptl-text-secondary)] hover:bg-white/[0.04] hover:text-white"
                    }`
                  }
                >
                  <span className="grid h-7 w-7 place-items-center rounded-[10px] bg-white/[0.06] text-[11px] font-semibold text-[color:var(--ptl-cyan-soft)]">{icon}</span>
                  {label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="mt-auto rounded-[18px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.035] p-3">
        <p className="text-xs text-[color:var(--ptl-text-muted)]">Signed in as</p>
        <div className="mt-2 flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-[image:var(--ptl-gradient-primary)] text-sm font-semibold text-[#03101b]">BP</div>
          <div>
            <p className="text-sm font-semibold">Parker Labs</p>
            <p className="text-xs text-[color:var(--ptl-text-muted)]">Creator workspace</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function MobileNav() {
  const links = groups.flatMap((group) => group.links).slice(0, 5);
  return (
    <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-[20px] border border-[color:var(--ptl-border-subtle)] bg-[rgba(5,11,24,0.88)] p-2 backdrop-blur-xl lg:hidden" aria-label="Mobile navigation">
      {links.map(([label, href, icon]) => (
        <NavLink key={href} to={href} end={href === "/"} aria-label={label} className={({ isActive }) => `focus-ring grid min-h-12 place-items-center rounded-[14px] text-xs ${isActive ? "bg-[color:var(--ptl-bg-hover)] text-[color:var(--ptl-cyan)]" : "text-[color:var(--ptl-text-secondary)]"}`}>
          <span>{icon}</span>
        </NavLink>
      ))}
    </nav>
  );
}

function Topbar() {
  const settings = useClusterStore((state) => state.settings);
  const jobs = useClusterStore((state) => state.renderJobs);
  const activeJobs = jobs.filter((job) => ["queued", "preparing", "running"].includes(job.status)).length;
  return (
    <header className="sticky top-0 z-30 border-b border-[color:var(--ptl-border-subtle)] bg-[rgba(5,11,24,0.72)] px-4 py-4 backdrop-blur-xl lg:px-0">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--ptl-cyan-soft)]">Mission Control</p>
          <h1 className="font-display text-xl font-semibold md:text-2xl">{settings?.currentWorkspace ?? "Parker Tech Labs"}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="global-search">Search projects, assets, characters</label>
          <input id="global-search" className="focus-ring min-h-11 min-w-0 flex-1 rounded-[12px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.055] px-4 text-sm text-white placeholder:text-[color:var(--ptl-text-muted)] sm:w-80" placeholder="Search projects, assets, characters..." />
          <span className="inline-flex min-h-11 items-center gap-2 rounded-[12px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.04] px-3 text-sm text-[color:var(--ptl-text-secondary)]"><StatusDot tone={activeJobs ? "cyan" : "muted"} pulse={activeJobs > 0} />{activeJobs} active</span>
          <IconButton label="Notifications">N</IconButton>
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
        <div className="mb-4 grid h-20 place-items-center">
          <div className="h-14 w-14 rounded-full border border-[color:var(--ptl-border-active)] bg-[image:var(--ptl-gradient-primary)] opacity-90 shadow-[var(--ptl-glow-cyan)]" />
        </div>
        <p className="text-sm leading-6 text-[color:var(--ptl-text-secondary)]">
          {projectScenes.some((scene) => scene.status === "image-ready")
            ? "A scene is ready for animation. Send its source image to DreamFrame when you are ready."
            : latestJob?.status === "completed"
              ? "Your latest render completed and is available in the Asset Library."
              : "Build the next Monster Truck Adventure scene from the production timeline."}
        </p>
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
  return (
    <div className="min-h-screen lg:flex">
      <Sidebar />
      <div className="min-w-0 flex-1 pb-24 lg:pb-0">
        <div className="mx-auto grid w-full max-w-[1780px] gap-5 px-4 lg:px-6 xl:grid-cols-[minmax(0,1fr)_292px]">
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
