"use client";

// VERZUS M10.7 INDEPENDENT REWARD WIDGET ERROR BOUNDARY

import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";

import { recordRewardTelemetry } from "../../telemetry/reward-telemetry.client";
import type { RewardWidgetName } from "../model/reward-reliability.types";
import styles from "./RewardWidgetFallback.module.css";

type Props = {
  children: ReactNode;
  widget: RewardWidgetName;
};

type State = {
  error: Error | null;
  errorId: string | null;
};

export class RewardWidgetBoundary extends Component<Props, State> {
  override state: State = { error: null, errorId: null };

  static getDerivedStateFromError(error: Error): State {
    return {
      error,
      errorId: `reward-widget-${Date.now().toString(36)}`,
    };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    recordRewardTelemetry({
      eventName: "reward_widget_failed",
      surface: "widget",
      resource: null,
      widget: this.props.widget,
      rewardId: null,
      state: "error",
      errorCode: error.name || "REWARD_WIDGET_ERROR",
      requestId: this.state.errorId,
    });

    console.error("[verzus:reward-widget-failed]", {
      widget: this.props.widget,
      errorId: this.state.errorId,
      message: error.message,
      componentStack: info.componentStack,
    });
  }

  private retry = (): void => {
    recordRewardTelemetry({
      eventName: "reward_widget_retry_requested",
      surface: "widget",
      resource: null,
      widget: this.props.widget,
      rewardId: null,
      state: "retrying",
      errorCode: null,
      requestId: this.state.errorId,
    });
    this.setState({ error: null, errorId: null });
  };

  private clearPreviewFault = (): void => {
    const url = new URL(window.location.href);
    url.searchParams.delete("widget");
    url.searchParams.delete("widgetScenario");
    window.location.assign(`${url.pathname}${url.search}${url.hash}`);
  };

  override render() {
    if (!this.state.error) return this.props.children;

    return (
      <section
        aria-labelledby={`reward-${this.props.widget}-fallback-title`}
        className={styles.fallback}
        data-reward-widget-fallback={this.props.widget}
        role="alert"
      >
        <small>WIDGET ISOLATED · {this.state.errorId}</small>
        <h2 id={`reward-${this.props.widget}-fallback-title`}>This reward panel stopped</h2>
        <p>
          The rest of Rewards remains available. Retry only this panel or clear the preview fault.
        </p>
        <div className={styles.actions}>
          <button onClick={this.retry} type="button">
            Retry panel
          </button>
          <button onClick={this.clearPreviewFault} type="button">
            Clear preview fault
          </button>
        </div>
      </section>
    );
  }
}
