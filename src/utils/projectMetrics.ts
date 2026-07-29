import type { Scene } from "../types/domain";

export function projectProgress(scenes: Scene[]): number {
  if (scenes.length === 0) return 0;
  const completed = scenes.filter((scene) => scene.status === "completed").length;
  const imageReady = scenes.filter((scene) => scene.status === "image-ready").length * 0.5;
  return Math.round(((completed + imageReady) / scenes.length) * 100);
}
