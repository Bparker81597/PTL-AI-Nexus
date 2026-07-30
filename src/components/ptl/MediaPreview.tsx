import { EmptyState } from "./primitives";

export function MediaPreview({
  src,
  alt,
  type = "image",
  className = "",
}: {
  src?: string;
  alt: string;
  type?: "image" | "video" | "audio" | "fallback";
  className?: string;
}) {
  if (!src) {
    return <EmptyState title="No preview" message="Production media will appear here once it is linked." />;
  }

  if (type === "audio") {
    return (
      <div className={`grid min-h-40 place-items-center rounded-[18px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.04] ${className}`}>
        <div className="flex h-20 w-full max-w-sm items-end gap-1 px-6" aria-label={alt}>
          {Array.from({ length: 34 }, (_, index) => (
            <span key={index} className="flex-1 rounded-full bg-[color:var(--ptl-violet-soft)]/80" style={{ height: `${18 + ((index * 13) % 46)}px` }} />
          ))}
        </div>
      </div>
    );
  }

  if (
    src.startsWith("http") ||
    src.startsWith("/") ||
    src.startsWith("./") ||
    src.startsWith("data:image") ||
    src.startsWith("blob:")
  ) {
    return <img loading="lazy" src={src} alt={alt} className={`w-full rounded-[18px] object-cover ${className}`} />;
  }

  return (
    <div className={`grid min-h-40 place-items-center rounded-[18px] border border-[color:var(--ptl-border-subtle)] bg-white/[0.04] ${className}`}>
      <span className="text-sm font-semibold text-[color:var(--ptl-text-secondary)]">{type} preview</span>
    </div>
  );
}
