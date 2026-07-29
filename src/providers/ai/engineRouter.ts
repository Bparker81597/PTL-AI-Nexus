import { mockProvider } from "./mockProvider";
import {
  comfyUiProvider,
  huggingFaceProvider,
  localAiServerProvider,
  runPodProvider,
} from "./placeholders";
import type { AIProvider, ProviderSelectionRequest } from "./types";

const supports = (provider: AIProvider, request: ProviderSelectionRequest): boolean =>
  provider.capabilities.includes(request.generationType) || provider.capabilities.includes(request.capability);

export class EngineRouter {
  constructor(private readonly providers: AIProvider[]) {}

  listProviders(): AIProvider[] {
    return this.providers;
  }

  selectProvider(request: ProviderSelectionRequest): AIProvider {
    const available = this.providers.filter(
      (provider) => provider.status === "connected" && supports(provider, request),
    );

    const preferred = available.find((provider) => provider.id === request.preferredProvider);
    if (preferred) return preferred;

    if (request.localFirst) {
      const local = available.find((provider) => provider.id.includes("local") || provider.id === "comfyui");
      if (local) return local;
    }

    const fallback = available[0];
    if (!fallback) {
      throw new Error(`No connected provider supports ${request.generationType}.`);
    }

    return fallback;
  }
}

export const engineRouter = new EngineRouter([
  mockProvider,
  comfyUiProvider,
  runPodProvider,
  huggingFaceProvider,
  localAiServerProvider,
]);
