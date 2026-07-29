import type { AIProvider } from "./types";
import type { Asset, GenerationRequest, GenerationResult } from "../../types/domain";
import { createId, nowIso } from "../../utils/ids";

const imageUrls = [
  "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=900&q=80",
];

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
          : `mock://${assetType}/${createId("result")}`,
      projectId: request.projectId,
      providerId: "mock",
      createdAt: nowIso(),
      metadata: { prompt: request.prompt, settings: request.settings },
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
