import { describe, expect, it } from "vitest";
import { EngineRouter } from "../providers/ai/engineRouter";
import { mockProvider } from "../providers/ai/mockProvider";
import { runPodProvider } from "../providers/ai/placeholders";

describe("EngineRouter", () => {
  it("selects the preferred connected provider when it supports the request", () => {
    const router = new EngineRouter([mockProvider, { ...runPodProvider, status: "connected" }]);

    const provider = router.selectProvider({
      generationType: "image-to-video",
      capability: "image-to-video",
      preferredProvider: "runpod",
    });

    expect(provider.id).toBe("runpod");
  });

  it("falls back to the mock provider when placeholders are disconnected", () => {
    const router = new EngineRouter([mockProvider, runPodProvider]);

    const provider = router.selectProvider({
      generationType: "image",
      capability: "image",
      preferredProvider: "runpod",
    });

    expect(provider.id).toBe("mock");
  });
});
