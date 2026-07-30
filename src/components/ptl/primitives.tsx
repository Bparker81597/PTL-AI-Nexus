import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { NexusOrb, OrbitDivider } from "./brand";

type Tone = "cyan" | "violet" | "success" | "warning" | "danger" | "muted";

const toneClasses: Record<Tone, string> = {
  cyan: "border-[color:var(--ptl-border-active)] text-[color:var(--ptl-cyan)]",
  violet: "border-[color:var(--ptl-border-violet)] text-[color:var(--ptl-violet-soft)]",
  success: "border-emerald-300/35 text-emerald-200",
  warning: "border-amber-300/35 text-amber-200",
  danger: "border-rose-300/35 text-rose-200",
  muted: "border-white/10 text-[color:var(--ptl-text-secondary)]",
};

export function GlassPanel({ children, className = "", as = "section" }: { children: ReactNode; className?: string; as?: "section" | "div" | "article" | "aside" }) {
  const Component = as;
  return (
    <Component className={`rounded-[20px] border border-[color:var(--ptl-border-subtle)] bg-[color:var(--ptl-bg-panel)] p-5 backdrop-blur-xl transition duration-200 ${className}`}>
      {children}
    </Component>
  );
}

export function FeaturePanel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`relative overflow-hidden rounded-[24px] border border-[color:var(--ptl-border-default)] bg-[image:var(--ptl-gradient-panel)] p-5 shadow-[var(--ptl-glow-cyan)] transition duration-200 ${className}`}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--ptl-cyan)] to-transparent opacity-70" />
      {children}
    </section>
  );
}

export function SectionHeader({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--ptl-cyan-soft)]">{eyebrow}</p>}
        <h2 className="font-display text-xl font-semibold tracking-normal text-[color:var(--ptl-text-primary)]">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--ptl-cyan-soft)]">{eyebrow}</p>
        <h1 className="font-display text-[26px] font-semibold leading-tight text-[color:var(--ptl-text-primary)] md:text-[32px]">{title}</h1>
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </header>
  );
}

export function PtlButton({
  children,
  variant = "primary",
  loading = false,
  className = "",
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger"; loading?: boolean }) {
  const variants = {
    primary: "border-transparent bg-[image:var(--ptl-gradient-primary)] text-[#03101b] shadow-[var(--ptl-glow-cyan)] hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0",
    secondary: "border-[color:var(--ptl-border-violet)] bg-violet-400/10 text-white hover:-translate-y-0.5 hover:bg-violet-300/15 active:translate-y-0",
    ghost: "border-transparent bg-transparent text-[color:var(--ptl-text-secondary)] hover:bg-[color:var(--ptl-bg-hover)] hover:text-white",
    danger: "border-rose-300/30 bg-rose-400/12 text-rose-100 hover:-translate-y-0.5 hover:bg-rose-400/18 active:translate-y-0",
  };
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-[12px] border px-4 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {loading ? "Working..." : children}
    </button>
  );
}

export function IconButton({ label, children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; children: ReactNode }) {
  return (
    <button {...props} aria-label={label} className={`focus-ring grid h-11 w-11 place-items-center rounded-[12px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.04] text-[color:var(--ptl-text-secondary)] transition hover:bg-[color:var(--ptl-bg-hover)] hover:text-white ${className}`}>
      {children}
    </button>
  );
}

export function StatusDot({ tone = "muted", pulse = false }: { tone?: Tone; pulse?: boolean }) {
  const colors: Record<Tone, string> = {
    cyan: "bg-[color:var(--ptl-cyan)] shadow-[var(--ptl-glow-cyan)]",
    violet: "bg-[color:var(--ptl-violet-soft)] shadow-[var(--ptl-glow-violet)]",
    success: "bg-[color:var(--ptl-success)] shadow-[var(--ptl-glow-success)]",
    warning: "bg-[color:var(--ptl-warning)]",
    danger: "bg-[color:var(--ptl-danger)]",
    muted: "bg-[color:var(--ptl-text-muted)]",
  };
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${colors[tone]} ${pulse ? "animate-pulse" : ""}`} />;
}

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const tone: Tone =
    normalized.includes("complete") || normalized.includes("connected") || normalized.includes("ready")
      ? "success"
      : normalized.includes("failed") || normalized.includes("error") || normalized.includes("danger")
        ? "danger"
        : normalized.includes("queued") || normalized.includes("planned")
          ? "warning"
          : normalized.includes("render") || normalized.includes("running") || normalized.includes("generating")
            ? "cyan"
            : normalized.includes("not configured") || normalized.includes("disconnected") || normalized.includes("offline")
              ? "muted"
              : "violet";
  return (
    <span className={`inline-flex min-h-7 items-center gap-2 rounded-[10px] border bg-white/[0.035] px-2.5 text-xs font-semibold ${toneClasses[tone]}`}>
      <StatusDot tone={tone} pulse={tone === "cyan"} />
      {status}
    </span>
  );
}

export function MetricChip({ label, value, tone = "cyan" }: { label: string; value: ReactNode; tone?: Tone }) {
  return (
    <div className={`rounded-[14px] border bg-white/[0.035] px-3 py-2 ${toneClasses[tone]}`}>
      <p className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--ptl-text-muted)]">{label}</p>
      <p className="mt-1 font-display text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

export function PtlInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`focus-ring min-h-11 rounded-[12px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.055] px-3 text-sm text-white placeholder:text-[color:var(--ptl-text-muted)] ${props.className ?? ""}`} />;
}

export function PtlTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`focus-ring min-h-28 rounded-[12px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.055] p-3 text-sm text-white placeholder:text-[color:var(--ptl-text-muted)] ${props.className ?? ""}`} />;
}

export function PtlSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`focus-ring min-h-11 rounded-[12px] border border-[color:var(--ptl-border-subtle)] bg-[#101f38] px-3 text-sm text-white ${props.className ?? ""}`} />;
}

export function PtlField({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-[color:var(--ptl-text-secondary)]">
      <span>{label}</span>
      {children}
      {hint && <span className="text-xs text-[color:var(--ptl-text-muted)]">{hint}</span>}
    </label>
  );
}

export function PtlProgress({ value, label }: { value: number; label?: string }) {
  const bounded = Math.max(0, Math.min(100, value));
  return (
    <div aria-label={label} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={bounded}>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-[image:var(--ptl-gradient-primary)] transition-all duration-300" style={{ width: `${bounded}%` }} />
      </div>
      {label && <p className="mt-1 text-xs text-[color:var(--ptl-text-muted)]">{label}</p>}
    </div>
  );
}

export function EmptyState({ title, message, action }: { title: string; message: string; action?: ReactNode }) {
  return (
    <GlassPanel className="grid min-h-40 place-items-center text-center">
      <div>
        <div className="mx-auto mb-4 h-12 w-20">
          <OrbitDivider />
        </div>
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        <p className="mt-2 max-w-md text-sm text-[color:var(--ptl-text-secondary)]">{message}</p>
        {action && <div className="mt-4">{action}</div>}
      </div>
    </GlassPanel>
  );
}

export function LoadingState({ label = "Loading PTL workspace..." }: { label?: string }) {
  return (
    <GlassPanel className="flex min-h-40 items-center justify-center gap-4">
      <NexusOrb className="h-12 w-12" />
      <span className="text-sm text-[color:var(--ptl-text-secondary)]">{label}</span>
    </GlassPanel>
  );
}
