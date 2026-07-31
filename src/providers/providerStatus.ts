export interface ProviderStatusItem {
  id: string;
  name: string;
  category: "ai" | "storage" | "database";
  status: "connected" | "disconnected" | "not configured" | "error";
  capabilities: string[];
}

const liveGatewayConfigured = Boolean((import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim());

export const providerStatusItems: ProviderStatusItem[] = [
  {
    id: "mock",
    name: "Mock Provider",
    category: "ai",
    status: "connected",
    capabilities: ["image", "image-to-video", "text-to-video", "voice", "music", "sound-effect"],
  },
  {
    id: "live-video-gateway",
    name: "Live Video Gateway",
    category: "ai",
    status: liveGatewayConfigured ? "connected" : "not configured",
    capabilities: ["image-to-video", "text-to-video", "secure-backend"],
  },
  {
    id: "comfyui",
    name: "ComfyUI",
    category: "ai",
    status: "not configured",
    capabilities: ["image", "reference-image", "character-consistency"],
  },
  {
    id: "runpod",
    name: "RunPod",
    category: "ai",
    status: "not configured",
    capabilities: ["image", "image-to-video", "text-to-video"],
  },
  {
    id: "hugging-face",
    name: "Hugging Face",
    category: "ai",
    status: "not configured",
    capabilities: ["image", "voice", "music"],
  },
  {
    id: "local-ai-server",
    name: "Local AI Server",
    category: "ai",
    status: "not configured",
    capabilities: ["image", "voice", "local-processing"],
  },
  {
    id: "cloudflare-r2",
    name: "Cloudflare R2",
    category: "storage",
    status: "not configured",
    capabilities: ["asset-storage", "public-urls"],
  },
  {
    id: "supabase",
    name: "Supabase",
    category: "database",
    status: "not configured",
    capabilities: ["auth", "database", "storage-placeholder"],
  },
];
