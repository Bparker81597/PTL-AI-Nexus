import { Navigate, Route, Routes } from "react-router-dom";
import { AssetLibraryPage } from "../features/assets/AssetLibraryPage";
import { NovaCanvasPage } from "../features/canvas/NovaCanvasPage";
import { CharacterDetailPage } from "../features/characters/CharacterDetailPage";
import { CharacterStudioPage } from "../features/characters/CharacterStudioPage";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { DreamFramePage } from "../features/dreamframe/DreamFramePage";
import { AiEnginesPage } from "../features/engines/AiEnginesPage";
import { NovaTonePage } from "../features/novatone/NovaTonePage";
import { ProjectsPage } from "../features/projects/ProjectsPage";
import { ProjectDetailPage } from "../features/projects/ProjectDetailPage";
import { RenderQueuePage } from "../features/render-queue/RenderQueuePage";
import { SettingsPage } from "../features/settings/SettingsPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/characters" element={<CharacterStudioPage />} />
      <Route path="/characters/:characterId" element={<CharacterDetailPage />} />
      <Route path="/canvas" element={<NovaCanvasPage />} />
      <Route path="/dreamframe" element={<DreamFramePage />} />
      <Route path="/novatone" element={<NovaTonePage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
      <Route path="/render-queue" element={<RenderQueuePage />} />
      <Route path="/assets" element={<AssetLibraryPage />} />
      <Route path="/engines" element={<AiEnginesPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
