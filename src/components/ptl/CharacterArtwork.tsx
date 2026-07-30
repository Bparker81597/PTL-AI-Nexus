import { useState } from "react";
import { EmptyState } from "./primitives";

type ArtworkVariant = "poster" | "hero" | "portrait" | "thumbnail" | "avatar";
type ArtworkShape = "portrait" | "square" | "circle" | "banner";
type ArtworkFit = "contain" | "cover";

const variantClass: Record<ArtworkVariant, string> = {
  poster: "aspect-[350/1122] w-full",
  hero: "h-[clamp(220px,62vw,300px)] md:h-[clamp(320px,38vw,420px)]",
  portrait: "h-[clamp(300px,78vw,430px)] md:h-[360px] xl:h-[400px]",
  thumbnail: "h-24 w-24",
  avatar: "h-16 w-14",
};

const shapeClass: Record<ArtworkShape, string> = {
  portrait: "rounded-[22px]",
  square: "rounded-[14px]",
  circle: "rounded-full",
  banner: "rounded-[18px]",
};

export function CharacterArtwork({
  src,
  alt,
  variant = "thumbnail",
  shape = "portrait",
  fit = "contain",
  focalPoint = "center center",
  className = "",
}: {
  src?: string;
  alt: string;
  variant?: ArtworkVariant;
  shape?: ArtworkShape;
  fit?: ArtworkFit;
  focalPoint?: string;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);

  if (!src) {
    return (
      <div className={`${variantClass[variant]} ${className}`}>
        <EmptyState title="No artwork" message="Approved character artwork will appear here once linked." />
      </div>
    );
  }

  return (
    <div
      className={`relative isolate overflow-hidden border border-[color:var(--ptl-border-subtle)] bg-[radial-gradient(circle_at_50%_22%,rgba(49,217,255,0.14),transparent_36%),rgba(255,255,255,0.035)] ${variantClass[variant]} ${shapeClass[shape]} ${className}`}
    >
      <div className={`absolute inset-0 transition-opacity duration-300 motion-reduce:animate-none ${loaded ? "opacity-0" : "animate-pulse opacity-100"}`}>
        <div className="h-full w-full bg-[linear-gradient(135deg,rgba(49,217,255,0.09),rgba(139,92,255,0.08))]" />
      </div>
      <img
        src={src}
        alt={alt}
        loading={variant === "poster" || variant === "hero" ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`h-full w-full transition duration-300 ease-out motion-reduce:transition-none ${fit === "cover" ? "object-cover" : "object-contain"} ${loaded ? "opacity-100" : "opacity-0"}`}
        style={{ objectPosition: focalPoint }}
      />
    </div>
  );
}
