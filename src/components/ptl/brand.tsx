import type { ReactNode, SVGProps } from "react";

type NexusLogoProps = SVGProps<SVGSVGElement> & {
  title?: string;
};

export function NexusLogo({ title = "PTL AI Nexus", className = "", ...props }: NexusLogoProps) {
  return (
    <svg viewBox="0 0 96 96" role="img" aria-label={title} className={className} {...props}>
      <defs>
        <linearGradient id="nexus-logo-gradient" x1="20" x2="78" y1="18" y2="78" gradientUnits="userSpaceOnUse">
          <stop stopColor="#31D9FF" />
          <stop offset="0.52" stopColor="#188DD7" />
          <stop offset="1" stopColor="#8B5CFF" />
        </linearGradient>
        <filter id="nexus-logo-glow" x="-35%" y="-35%" width="170%" height="170%">
          <feGaussianBlur stdDeviation="2.8" result="blur" />
          <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.19 0 0 0 0 0.85 0 0 0 0 1 0 0 0 .5 0" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx="48" cy="48" r="35" fill="none" stroke="url(#nexus-logo-gradient)" strokeWidth="4.4" opacity="0.48" />
      <path d="M24 48c13-19 35-24 54-18" fill="none" stroke="url(#nexus-logo-gradient)" strokeLinecap="round" strokeWidth="3" opacity="0.42" />
      <path
        d="M28 68V28h10.8l19.4 23.8V28H70v40H59.2L39.8 44.2V68H28Z"
        fill="url(#nexus-logo-gradient)"
        filter="url(#nexus-logo-glow)"
      />
      <path d="M73 16l2.4 5.6L81 24l-5.6 2.4L73 32l-2.4-5.6L65 24l5.6-2.4L73 16Z" fill="#F7FAFC" />
    </svg>
  );
}

export function NexusWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <NexusLogo className="h-12 w-12 shrink-0" />
      {!compact && (
        <div className="min-w-0">
          <p className="font-display text-[15px] font-semibold uppercase tracking-[0.18em] text-white">PTL AI Nexus</p>
          <p className="text-xs text-[color:var(--ptl-text-muted)]">A Creative Universe</p>
        </div>
      )}
    </div>
  );
}

export function OrbitDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`relative h-px overflow-hidden bg-[color:var(--ptl-border-subtle)] ${className}`} aria-hidden="true">
      <span className="absolute left-1/2 top-1/2 h-8 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[color:var(--ptl-border-active)] opacity-35" />
      <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[color:var(--ptl-cyan)] shadow-[var(--ptl-glow-cyan)]" />
    </div>
  );
}

export type ModuleKey = "mission" | "characters" | "canvas" | "dreamframe" | "novatone" | "codeverse" | "novakart" | "projects" | "timeline" | "assets" | "engines" | "settings" | "queue";

const moduleLabels: Record<ModuleKey, string> = {
  mission: "Mission Control",
  characters: "Character Studio",
  canvas: "NovaCanvas",
  dreamframe: "DreamFrame",
  novatone: "NovaTone",
  codeverse: "CodeVerse",
  novakart: "NovaKart",
  projects: "Projects",
  timeline: "Timeline",
  assets: "Assets",
  engines: "AI Engines",
  settings: "Settings",
  queue: "Render Queue",
};

export function ModuleGlyph({ module, className = "" }: { module: ModuleKey; className?: string }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg viewBox="0 0 24 24" role="img" aria-label={moduleLabels[module]} className={className}>
      {module === "mission" && (
        <>
          <circle cx="12" cy="12" r="7.4" {...common} />
          <path d="M12 4.6v3.2M12 16.2v3.2M4.6 12h3.2M16.2 12h3.2M9.2 12a2.8 2.8 0 1 0 5.6 0 2.8 2.8 0 0 0-5.6 0Z" {...common} />
        </>
      )}
      {module === "characters" && (
        <>
          <path d="M7.2 18.4c.9-2.5 2.5-3.7 4.8-3.7s3.9 1.2 4.8 3.7" {...common} />
          <path d="M8.4 8.8a3.6 3.6 0 1 0 7.2 0 3.6 3.6 0 0 0-7.2 0Z" {...common} />
          <path d="M5.2 5.8 4 3.8M18.8 5.8 20 3.8" {...common} />
        </>
      )}
      {module === "canvas" && (
        <>
          <rect x="4" y="5" width="16" height="14" rx="2.5" {...common} />
          <path d="m7 16 3.2-3.6 2.8 2.8 2-2.4 2.6 3.2M8.2 8.8h.1" {...common} />
        </>
      )}
      {module === "dreamframe" && (
        <>
          <rect x="4" y="6" width="16" height="12" rx="2.4" {...common} />
          <path d="m10.4 9.5 4.2 2.5-4.2 2.5v-5Z" {...common} />
          <path d="M7 4v4M17 4v4M7 16v4M17 16v4" {...common} />
        </>
      )}
      {module === "novatone" && (
        <>
          <path d="M5 13v-2M8.5 16V8M12 18V6M15.5 16V8M19 13v-2" {...common} />
          <path d="M4 19h16" {...common} />
        </>
      )}
      {module === "codeverse" && (
        <>
          <path d="m9 8-4 4 4 4M15 8l4 4-4 4M13 5l-2 14" {...common} />
        </>
      )}
      {module === "novakart" && (
        <>
          <path d="M5 7h13l-1.4 7.2H7.2L5 4H3.5" {...common} />
          <path d="M8.5 19.2h.1M16 19.2h.1" {...common} />
        </>
      )}
      {module === "projects" && (
        <>
          <path d="M4.5 7.5h6l1.7 2h7.3v8.8a1.7 1.7 0 0 1-1.7 1.7H6.2a1.7 1.7 0 0 1-1.7-1.7V7.5Z" {...common} />
          <path d="M4.5 7.5V5.7h5.2l1.6 1.8" {...common} />
        </>
      )}
      {module === "timeline" && (
        <>
          <path d="M5 7h14M5 12h14M5 17h14" {...common} />
          <circle cx="8" cy="7" r="1.7" {...common} />
          <circle cx="14" cy="12" r="1.7" {...common} />
          <circle cx="10" cy="17" r="1.7" {...common} />
        </>
      )}
      {module === "assets" && (
        <>
          <rect x="4.5" y="4.5" width="6.5" height="6.5" rx="1.5" {...common} />
          <rect x="13" y="4.5" width="6.5" height="6.5" rx="1.5" {...common} />
          <rect x="4.5" y="13" width="6.5" height="6.5" rx="1.5" {...common} />
          <rect x="13" y="13" width="6.5" height="6.5" rx="1.5" {...common} />
        </>
      )}
      {module === "engines" && (
        <>
          <path d="M12 4v3M12 17v3M4 12h3M17 12h3M6.7 6.7l2.1 2.1M15.2 15.2l2.1 2.1M17.3 6.7l-2.1 2.1M8.8 15.2l-2.1 2.1" {...common} />
          <circle cx="12" cy="12" r="3.4" {...common} />
        </>
      )}
      {module === "settings" && (
        <>
          <circle cx="12" cy="12" r="3.2" {...common} />
          <path d="M12 4.5v2M12 17.5v2M5.5 7.2l1.8 1M16.7 15.8l1.8 1M5.5 16.8l1.8-1M16.7 8.2l1.8-1" {...common} />
        </>
      )}
      {module === "queue" && (
        <>
          <path d="M6 7h12M6 12h12M6 17h7" {...common} />
          <path d="M16.5 15.4 19 17.8l-2.5 2.4" {...common} />
        </>
      )}
    </svg>
  );
}

export function NexusOrb({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return (
    <div className={`relative grid place-items-center ${className}`}>
      <span className="nexus-orbit absolute inset-0 rounded-full border border-[color:var(--ptl-border-active)] opacity-55" aria-hidden="true" />
      <span className="absolute h-[58%] w-[58%] rounded-full bg-[image:var(--ptl-gradient-primary)] shadow-[var(--ptl-glow-cyan)]" aria-hidden="true" />
      {children && <span className="relative z-10">{children}</span>}
    </div>
  );
}
