"use client";

// VERZUS M7.7 INDEPENDENT MATCH WIDGET ERROR BOUNDARY

import { Component, type ErrorInfo, type ReactNode } from "react";

import styles from "./MatchOperationsScreen.module.css";

export type MatchWidgetBoundaryProps = {
  name: string;
  children: ReactNode;
};

type MatchWidgetBoundaryState = { failed: boolean; resetKey: number };

export class MatchWidgetBoundary extends Component<
  MatchWidgetBoundaryProps,
  MatchWidgetBoundaryState
> {
  override state: MatchWidgetBoundaryState = { failed: false, resetKey: 0 };

  static getDerivedStateFromError(): Partial<MatchWidgetBoundaryState> {
    return { failed: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("VERZUS match widget failure", {
      widget: this.props.name,
      message: error.message,
      componentStack: info.componentStack,
    });
  }

  private reset = () => {
    this.setState((state) => ({ failed: false, resetKey: state.resetKey + 1 }));
  };

  override render() {
    if (this.state.failed) {
      return (
        <section
          className={styles.widgetFailureCard}
          data-widget-failure={this.props.name}
          role="alert"
        >
          <strong>{this.props.name} temporarily unavailable</strong>
          <p>
            This panel failed independently. Match navigation and other operations remain available.
          </p>
          <button onClick={this.reset} type="button">
            Retry panel
          </button>
        </section>
      );
    }
    return <div key={this.state.resetKey}>{this.props.children}</div>;
  }
}

export function MatchWidgetCrashProbe({ active, name }: { active: boolean; name: string }) {
  if (active) throw new Error(`Controlled M7.7 ${name} widget failure`);
  return null;
}
