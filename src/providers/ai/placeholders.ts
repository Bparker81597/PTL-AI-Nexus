import type { GenerationResult } from "../../types/domain";
import type { AIProvider } from "./types";

interface ProviderConfig {
  endpointEnv: string;
  apiKeyEnv?: string;
  local?: boolean;
}

const unavailableGenerate = (name: string) => async (): Promise<GenerationResult> => {
  throw new Error(`${name} is a typed placeholder. Connect it through a secure backend before use.`);
};

export const createPlaceholderProvider = (
  id: string,
  name: string,
  type: AIProvider["type"],
  capabilities: string[],
  config: ProviderConfig,
): AIProvider & { config: ProviderConfig; testConnection: () => Promise<boolean> } => ({
  id,
  name,
  type,
  status: "disconnected",
  capabilities,
  config,
  generate: unavailableGenerate(name),
  async testConnection() {
    return false;
  },
});

export const comfyUiProvider = createPlaceholderProvider(
  "comfyui",
  "ComfyUI",
  "image",
  ["image", "reference-image", "character-consistency"],
  { endpointEnv: "VITE_COMFYUI_ENDPOINT", local: true },
);

export const runPodProvider = createPlaceholderProvider(
  "runpod",
  "RunPod",
  "multimodal",
  ["image", "image-to-video", "text-to-video"],
  { endpointEnv: "VITE_API_BASE_URL", apiKeyEnv: "RUNPOD_API_KEY" },
);

export const huggingFaceProvider = createPlaceholderProvider(
  "hugging-face",
  "Hugging Face",
  "multimodal",
  ["image", "voice", "music"],
  { endpointEnv: "VITE_API_BASE_URL", apiKeyEnv: "HUGGING_FACE_TOKEN" },
);

export const localAiServerProvider = createPlaceholderProvider(
  "local-ai-server",
  "Local AI Server",
  "multimodal",
  ["image", "voice", "local-processing"],
  { endpointEnv: "VITE_LOCAL_AI_SERVER_URL", local: true },
);
