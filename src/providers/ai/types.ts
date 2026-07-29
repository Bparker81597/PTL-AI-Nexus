import type { GenerationRequest, GenerationResult, GenerationType, RenderJob } from "../../types/domain";

export interface AIProvider {
  id: string;
  name: string;
  type: "image" | "video" | "audio" | "multimodal";
  status: "connected" | "disconnected" | "error";
  capabilities: string[];
  generate(request: GenerationRequest): Promise<GenerationResult>;
  getJobStatus?(jobId: string): Promise<RenderJob>;
  cancelJob?(jobId: string): Promise<void>;
}

export interface ProviderSelectionRequest {
  generationType: GenerationType;
  capability: string;
  preferredProvider?: string;
  localFirst?: boolean;
}
