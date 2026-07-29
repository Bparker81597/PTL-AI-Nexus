import { Component, type ErrorInfo, type ReactNode } from "react";
import { GlassPanel, PtlButton } from "../components/ptl";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  message?: string;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("PTL AI Cluster route failed", error, info.componentStack);
  }

  reset = () => {
    this.setState({ hasError: false, message: undefined });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <GlassPanel className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--ptl-danger)]">System notice</p>
        <h1 className="mt-3 font-display text-2xl font-semibold">This workspace panel could not load.</h1>
        <p className="mt-3 text-sm leading-6 text-[color:var(--ptl-text-secondary)]">
          The local mock data is still preserved. Reset the panel and continue from Mission Control.
        </p>
        {this.state.message && <p className="mt-3 rounded-[12px] bg-white/[0.04] p-3 text-xs text-[color:var(--ptl-text-muted)]">{this.state.message}</p>}
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <PtlButton type="button" onClick={this.reset}>Reset panel</PtlButton>
          <PtlButton type="button" variant="secondary" onClick={() => window.location.assign("/")}>Mission Control</PtlButton>
        </div>
      </GlassPanel>
    );
  }
}
