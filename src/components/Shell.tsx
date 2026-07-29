import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useClusterStore } from "../app/useClusterStore";

const links = [
  ["Dashboard", "/"],
  ["Character Studio", "/characters"],
  ["NovaCanvas", "/canvas"],
  ["DreamFrame", "/dreamframe"],
  ["NovaTone", "/novatone"],
  ["Projects", "/projects"],
  ["Render Queue", "/render-queue"],
  ["Asset Library", "/assets"],
  ["AI Engines", "/engines"],
  ["Settings", "/settings"],
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const settings = useClusterStore((state) => state.settings);
  const jobs = useClusterStore((state) => state.renderJobs);
  const notices = useClusterStore((state) => state.notices);
  const dismissNotice = useClusterStore((state) => state.dismissNotice);
  const activeJobs = jobs.filter((job) => ["queued", "preparing", "running"].includes(job.status)).length;

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="glass sticky top-0 z-20 border-x-0 border-t-0 lg:h-screen lg:border-y-0 lg:border-l-0">
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-300 text-lg font-black text-navy-950">P</div>
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-cyan-200">Parker Tech Labs</p>
            <h1 className="text-xl font-black">PTL AI Cluster</h1>
          </div>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-3 pb-4 lg:block lg:space-y-1 lg:overflow-visible" aria-label="Primary">
          {links.map(([label, href]) => (
            <NavLink
              key={href}
              to={href}
              end={href === "/"}
              className={({ isActive }) =>
                `focus-ring block whitespace-nowrap rounded-xl px-4 py-3 text-sm font-bold transition ${
                  isActive ? "bg-cyan-300 text-navy-950" : "text-slate-200 hover:bg-white/10"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div>
        <header className="sticky top-0 z-10 border-b border-white/10 bg-navy-950/72 px-4 py-4 backdrop-blur-xl md:px-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-200">Current workspace</p>
              <h2 className="text-lg font-black">{settings?.currentWorkspace ?? "Loading workspace"}</h2>
            </div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <label className="sr-only" htmlFor="global-search">Search</label>
              <input id="global-search" className="focus-ring min-h-11 rounded-xl border border-white/10 bg-white/10 px-4 text-sm text-white placeholder:text-slate-400 md:w-80" placeholder="Search projects, characters, assets" />
              <span className="rounded-xl bg-teal-300/15 px-4 py-3 text-sm font-bold text-teal-100">{activeJobs} active generations</span>
              <button className="focus-ring rounded-xl bg-white/10 px-4 py-3 text-sm font-bold" type="button">Notifications</button>
              <div className="grid h-11 w-11 place-items-center rounded-full bg-purple-300 text-sm font-black text-navy-950" aria-label="User profile placeholder">BP</div>
            </div>
          </div>
        </header>
        <main className="px-4 py-6 md:px-8">{children}</main>
        <div className="fixed bottom-4 right-4 z-30 grid gap-2">
          {notices.slice(0, 3).map((notice) => (
            <button key={notice.id} type="button" onClick={() => dismissNotice(notice.id)} className="glass max-w-sm rounded-xl px-4 py-3 text-left text-sm font-bold">
              {notice.message}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
