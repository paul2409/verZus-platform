"use client";

// VERZUS M8.7 INDEPENDENT LEADERBOARD WIDGET BOUNDARY

import type { ReactNode } from "react";

import { WidgetBoundary } from "@/components/layout/widget-boundary";

import type { LeaderboardCrashTarget } from "../model/leaderboard-quality.types";
import styles from "../../foundation/ui/LeaderboardFoundationScreen.module.css";

function LeaderboardCrashProbe({
  activeTarget,
  children,
  target,
}: {
  activeTarget: LeaderboardCrashTarget | null;
  children: ReactNode;
  target: LeaderboardCrashTarget;
}) {
  if (activeTarget === target) {
    const error = new Error(`Controlled M8.7 ${target} widget failure`) as Error & {
      digest?: string;
    };
    error.digest = `M8-WIDGET-${target.toUpperCase().replaceAll("-", "_")}`;
    throw error;
  }

  return children;
}

export function LeaderboardWidgetBoundary({
  children,
  crashTarget,
  label,
  onRecover,
  target,
}: {
  children: ReactNode;
  crashTarget: LeaderboardCrashTarget | null;
  label: string;
  onRecover?: (() => void) | undefined;
  target: LeaderboardCrashTarget;
}) {
  return (
    <WidgetBoundary
      fallback={({ errorId, reset }) => (
        <section
          aria-label={`${label} unavailable`}
          className={styles.widgetFailure}
          data-leaderboard-widget-failure={target}
          role="alert"
        >
          <strong>{label} unavailable</strong>
          <span>
            This section failed independently. Other leaderboard controls remain available.
          </span>
          <small>Error ID: {errorId}</small>
          <button
            onClick={() => {
              onRecover?.();
              window.setTimeout(reset, 0);
            }}
            type="button"
          >
            Restore section
          </button>
        </section>
      )}
      name={`leaderboard-${target}`}
      resetKeys={[crashTarget]}
    >
      <LeaderboardCrashProbe activeTarget={crashTarget} target={target}>
        {children}
      </LeaderboardCrashProbe>
    </WidgetBoundary>
  );
}
