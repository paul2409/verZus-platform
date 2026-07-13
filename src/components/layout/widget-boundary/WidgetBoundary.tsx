// VERZUS M3 STEP 3.5
"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

import { WidgetErrorFallback } from "./WidgetFallbacks";

export interface WidgetBoundaryRenderProps {
  name: string;
  error: Error;
  errorId: string;
  reset: () => void;
}

export interface WidgetBoundaryProps {
  name: string;
  children: ReactNode;
  fallback?: (props: WidgetBoundaryRenderProps) => ReactNode;
  resetKeys?: readonly unknown[];
  onError?: (
    error: Error,
    context: {
      name: string;
      errorId: string;
      componentStack?: string;
    },
  ) => void;
  onReset?: (name: string) => void;
}

interface WidgetBoundaryState {
  error: Error | null;
}

function haveResetKeysChanged(
  previous: readonly unknown[] | undefined,
  current: readonly unknown[] | undefined,
): boolean {
  if (previous === current) {
    return false;
  }

  if (!previous || !current || previous.length !== current.length) {
    return true;
  }

  return previous.some((value, index) => !Object.is(value, current[index]));
}

function readErrorId(error: Error): string {
  const candidate = error as Error & { digest?: unknown };

  return typeof candidate.digest === "string"
    ? candidate.digest
    : `WIDGET-${error.name.toUpperCase().replaceAll(" ", "-")}`;
}

export class WidgetBoundary extends Component<WidgetBoundaryProps, WidgetBoundaryState> {
  public override state: WidgetBoundaryState = {
    error: null,
  };

  public static getDerivedStateFromError(error: Error): WidgetBoundaryState {
    return { error };
  }

  public override componentDidCatch(error: Error, info: ErrorInfo): void {
    const errorId = readErrorId(error);
    const componentStack = info.componentStack ?? undefined;

    this.props.onError?.(error, {
      name: this.props.name,
      errorId,
      ...(componentStack ? { componentStack } : {}),
    });

    window.dispatchEvent(
      new CustomEvent("verzus:widget-error", {
        detail: {
          name: this.props.name,
          errorId,
          message: error.message,
          ...(componentStack ? { componentStack } : {}),
        },
      }),
    );
  }

  public override componentDidUpdate(previousProps: WidgetBoundaryProps): void {
    if (this.state.error && haveResetKeysChanged(previousProps.resetKeys, this.props.resetKeys)) {
      this.setState({ error: null });
    }
  }

  public reset = (): void => {
    this.setState({ error: null });
    this.props.onReset?.(this.props.name);
  };

  public override render(): ReactNode {
    const { error } = this.state;

    if (!error) {
      return this.props.children;
    }

    const errorId = readErrorId(error);

    if (this.props.fallback) {
      return this.props.fallback({
        name: this.props.name,
        error,
        errorId,
        reset: this.reset,
      });
    }

    return <WidgetErrorFallback name={this.props.name} errorId={errorId} onRetry={this.reset} />;
  }
}
