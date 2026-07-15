// VERZUS M5 STEPS 5.5-5.8
"use client";

import { WidgetBoundary } from "@/components/layout/widget-boundary";

import type { CurrentCheckIn, NextMatch } from "../model";
import type { PlayWidgetView } from "../view-model";
import { CheckInControl } from "./CheckInControl";
import { NextMatchCard } from "./NextMatchCard";
import { WidgetFrame } from "./WidgetFrame";
import styles from "./play-command-center.module.css";

export function PrimaryActionPanel({
  nextMatch,
  currentCheckIn,
  retryNextMatch,
  retryCheckIn,
}: {
  nextMatch: PlayWidgetView<NextMatch>;
  currentCheckIn: PlayWidgetView<CurrentCheckIn>;
  retryNextMatch: () => void;
  retryCheckIn: () => void;
}) {
  return (
    <WidgetFrame
      eyebrow="01 · PRIMARY ACTION"
      title="Your next battle"
      status={nextMatch.data?.status.replaceAll("_", " ").toUpperCase() ?? "PLAY"}
      className={styles.primaryActionPanel}
    >
      <div className={styles.primaryActionGrid}>
        <WidgetBoundary name="play-next-match" resetKeys={[nextMatch.state, nextMatch.requestId]}>
          <NextMatchCard view={nextMatch} onRetry={retryNextMatch} />
        </WidgetBoundary>

        <WidgetBoundary
          name="play-check-in"
          resetKeys={[currentCheckIn.state, currentCheckIn.requestId]}
        >
          <CheckInControl view={currentCheckIn} match={nextMatch.data} onRetry={retryCheckIn} />
        </WidgetBoundary>
      </div>
    </WidgetFrame>
  );
}
