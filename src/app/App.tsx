import { useEffect } from "react";
import { AppRoutes } from "./routes";
import { useClusterStore } from "./useClusterStore";
import { PtlAppShell } from "../components/ptl";
import { ErrorBoundary } from "./ErrorBoundary";

export function App() {
  const load = useClusterStore((state) => state.load);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <PtlAppShell>
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
    </PtlAppShell>
  );
}
