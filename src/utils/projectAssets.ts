import type { Asset, Project } from "../types/domain";

export function selectProjectHeroArtwork(project: Project, assets: Asset[], assetRole = "mission-control-project-hero"): Asset | undefined {
  const projectAssets = assets.filter((asset) => asset.projectId === project.id);
  return (
    projectAssets.find((asset) => asset.metadata?.assetRole === assetRole) ??
    projectAssets.find((asset) => asset.category === "Project Hero") ??
    projectAssets.find((asset) => asset.metadata?.usage === "Mission Control Active Project hero")
  );
}
