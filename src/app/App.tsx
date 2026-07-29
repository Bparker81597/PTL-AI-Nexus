import { useEffect } from "react";
import { AppRoutes } from "./routes";
import { useClusterStore } from "./useClusterStore";
import { Shell } from "../components/Shell";

export function App() {
  const load = useClusterStore((state) => state.load);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Shell>
      <AppRoutes />
    </Shell>
  );
}
