import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";

beforeEach(() => {
  window.localStorage.clear();
  window.localStorage.setItem("ptl.nexus.onboarding.seen", "true");
});

afterEach(() => {
  vi.useRealTimers();
});
