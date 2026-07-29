import type { ReactNode } from "react";

export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-200">{eyebrow}</p>
        <h2 className="text-3xl font-black tracking-normal text-white md:text-5xl">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`soft-card rounded-2xl p-5 ${className}`}>{children}</section>;
}

export function Button({ children, type = "button", onClick, variant = "primary" }: { children: ReactNode; type?: "button" | "submit"; onClick?: () => void; variant?: "primary" | "secondary" | "danger" }) {
  const styles = {
    primary: "bg-cyan-300 text-navy-950 hover:bg-cyan-200",
    secondary: "bg-white/10 text-white hover:bg-white/15",
    danger: "bg-rose-300 text-rose-950 hover:bg-rose-200",
  };
  return (
    <button type={type} onClick={onClick} className={`focus-ring min-h-11 rounded-xl px-4 text-sm font-black transition ${styles[variant]}`}>
      {children}
    </button>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-200">
      {label}
      {children}
    </label>
  );
}

export const inputClass = "focus-ring min-h-11 rounded-xl border border-white/10 bg-white/10 px-3 text-sm text-white placeholder:text-slate-400";
export const textareaClass = "focus-ring min-h-28 rounded-xl border border-white/10 bg-white/10 p-3 text-sm text-white placeholder:text-slate-400";

export function StatusBadge({ status }: { status: string }) {
  const color = status === "connected" || status === "completed" ? "bg-teal-300/20 text-teal-100" : status === "failed" || status === "error" ? "bg-rose-300/20 text-rose-100" : "bg-cyan-300/15 text-cyan-100";
  return <span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${color}`}>{status}</span>;
}
