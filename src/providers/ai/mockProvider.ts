import type { AIProvider } from "./types";
import type { Asset, GenerationRequest, GenerationResult } from "../../types/domain";
import { createId, nowIso } from "../../utils/ids";

const imageUrls = [
  "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=900&q=80",
];

const mockClipPreview =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1280 720'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1' y1='0' y2='1'%3E%3Cstop stop-color='%2355D6FF'/%3E%3Cstop offset='.55' stop-color='%23A98CFF'/%3E%3Cstop offset='1' stop-color='%2341E6C3'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1280' height='720' fill='%2307111f'/%3E%3Crect x='80' y='70' width='1120' height='580' rx='42' fill='url(%23g)' opacity='.32'/%3E%3Ccircle cx='640' cy='360' r='86' fill='%23ffffff' opacity='.9'/%3E%3Cpath d='M622 312v96l82-48z' fill='%2307111f'/%3E%3Ctext x='640' y='548' text-anchor='middle' font-family='Arial' font-size='42' font-weight='700' fill='%23ffffff'%3ESimulated DreamFrame Clip%3C/text%3E%3C/svg%3E";

const typeToAsset = (generationType: GenerationRequest["generationType"]): Asset["type"] => {
  if (generationType.includes("video")) return "video";
  if (generationType === "voice" || generationType === "music" || generationType === "sound-effect") {
    return "audio";
  }
  return "generated-image";
};

export const mockProvider: AIProvider = {
  id: "mock",
  name: "Mock Provider",
  type: "multimodal",
  status: "connected",
  capabilities: ["image", "image-to-video", "text-to-video", "voice", "music", "sound-effect"],
  async generate(request: GenerationRequest): Promise<GenerationResult> {
    const assetType = typeToAsset(request.generationType);
    const asset: Asset = {
      id: createId("asset"),
      name: `${request.generationType} result`,
      type: assetType,
      url:
        assetType === "generated-image"
          ? imageUrls[Math.floor(Math.random() * imageUrls.length)]
          : assetType === "video"
            ? mockClipPreview
            : `mock://${assetType}/${createId("result")}`,
      projectId: request.projectId,
      characterIds: request.characterIds,
      providerId: "mock",
      createdAt: nowIso(),
      dimensions: assetType === "audio" ? undefined : assetType === "video" ? "1920x1080" : "1792x1024",
      duration: assetType === "video" || assetType === "audio" ? Number(request.settings.duration ?? 5) : undefined,
      isMock: true,
      metadata: { prompt: request.prompt, settings: request.settings, simulated: true },
    };

    return {
      requestId: request.id,
      jobId: createId("job"),
      status: "completed",
      assets: [asset],
      providerId: "mock",
      metadata: { mocked: true },
    };
  },
};
