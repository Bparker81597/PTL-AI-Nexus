import { type ReactNode, useState } from "react";
import type { Asset, Project } from "../../types/domain";

export function ProjectHeroArtwork({
  project,
  asset,
  variant = "series-key-art",
  fit = "cover",
  showCaption = true,
  children,
  className = "",
}: {
  project: Project;
  asset?: Asset;
  variant?: "cinematic" | "series-key-art" | "production-reference" | "project-artwork";
  fit?: "cover" | "contain";
  showCaption?: boolean;
  children?: ReactNode;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <figure
      className={`group relative isolate min-h-[260px] overflow-hidden rounded-[22px] border border-[color:var(--ptl-border-subtle)] bg-[radial-gradient(circle_at_55%_20%,rgba(49,217,255,0.14),transparent_36%),rgba(255,255,255,0.035)] shadow-[0_22px_70px_rgba(0,0,0,0.28)] transition duration-200 hover:-translate-y-0.5 hover:border-[color:var(--ptl-border-active)] sm:min-h-[360px] xl:min-h-[430px] ${className}`}
      aria-label={`${project.name} ${variant.replaceAll("-", " ")}`}
    >
      <div className={`absolute inset-0 transition-opacity duration-300 motion-reduce:animate-none ${loaded ? "opacity-0" : "animate-pulse opacity-100"}`}>
        <div className="h-full w-full bg-[linear-gradient(135deg,rgba(49,217,255,0.12),rgba(139,92,255,0.1),rgba(255,200,87,0.08))]" />
      </div>
      {asset ? (
        <img
          src={asset.url}
          alt={asset.name}
          loading="eager"
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={`h-full w-full transition duration-300 motion-reduce:transition-none ${fit === "cover" ? "object-cover" : "object-contain"} ${loaded ? "opacity-100" : "opacity-0"}`}
          style={{ objectPosition: "center center" }}
        />
      ) : (
        <div className="h-full min-h-[360px] bg-[image:var(--ptl-gradient-primary)] opacity-70" />
      )}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_52%,rgba(5,11,24,0.72)_100%)]" />
      {children}
      {showCaption && (
        <figcaption className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/80">Series Key Art</p>
            <p className="mt-1 font-display text-lg font-semibold text-white">{project.name}</p>
          </div>
          <span className="rounded-full border border-white/20 bg-[#050b18]/55 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--ptl-cyan-soft)] backdrop-blur-md">
            Approved
          </span>
        </figcaption>
      )}
    </figure>
  );
}
