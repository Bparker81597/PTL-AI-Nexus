import { engineRouter } from "../providers/ai/engineRouter";
import { repositories } from "../repositories/local/localStorageRepository";
import { RenderService } from "./renderService";

export const renderService = new RenderService(
  repositories.renderJobs,
  repositories.assets,
  repositories.projects,
  repositories.scenes,
  engineRouter,
);
