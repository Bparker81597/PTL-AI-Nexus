import type { Asset, GenerationRequest, GenerationResult, GenerationType, RenderJob, RenderStatus } from "../../types/domain";

export interface LiveGenerationSubmission {
  providerJobId: string;
  status: RenderStatus;
  progress: number;
  estimatedCompletion?: string;
  metadata?: Record<string, unknown>;
}

export interface LiveGenerationStatus extends LiveGenerationSubmission {
  assets?: Asset[];
  errorMessage?: string;
}

export interface AIProvider {
  id: string;
  name: string;
  type: "image" | "video" | "audio" | "multimodal";
  mode?: "mock" | "live";
  status: "connected" | "disconnected" | "error";
  capabilities: string[];
  generate(request: GenerationRequest): Promise<GenerationResult>;
  submitGeneration?(request: GenerationRequest): Promise<LiveGenerationSubmission>;
  getGenerationStatus?(providerJobId: string): Promise<LiveGenerationStatus>;
  cancelGeneration?(providerJobId: string): Promise<void>;
  getJobStatus?(jobId: string): Promise<RenderJob>;
  cancelJob?(jobId: string): Promise<void>;
}

export interface ProviderSelectionRequest {
  generationType: GenerationType;
  capability: string;
  preferredProvider?: string;
  localFirst?: boolean;
}
