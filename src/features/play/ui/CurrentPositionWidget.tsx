// VERZUS M5 STEPS 5.5-5.8
"use client";

import Link from "next/link";

import type { CurrentPosition } from "../model";
import type { PlayWidgetView } from "../view-model";
import { PlayWidgetStatePanel } from "./PlayWidgetState";
import { WidgetFrame } from "./WidgetFrame";
import styles from "./play-command-center.module.css";

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-GB").format(value);
}

export function CurrentPositionWidget({
  view,
  onRetry,
}: {
  view: PlayWidgetView<CurrentPosition>;
  onRetry: () => void;
}) {
  return (
    <WidgetFrame
      eyebrow="02 · CURRENT POSITION"
      title="Weekly status"
      status={view.stale ? "STALE" : "LIVE"}
    >
      {!view.data ? (
        <PlayWidgetStatePanel
          state={view.state}
          errorCode={view.errorCode}
          requestId={view.requestId}
          onRetry={onRetry}
        />
      ) : (
        <>
          <div className={styles.positionGrid}>
            <div>
              <span>VS POINTS</span>
              <strong>{formatNumber(view.data.points)}</strong>
            </div>
            <div>
              <span>RANK</span>
              <strong>#{view.data.rank}</strong>
            </div>
            <div>
              <span>WIN RATE</span>
              <strong>{view.data.winRate}%</strong>
            </div>
            <div>
              <span>STREAK</span>
              <strong>{view.data.streak}</strong>
            </div>
          </div>

          <div className={styles.progressTrack}>
            <span
              style={{
                width: `${Math.min(100, (view.data.points / view.data.targetPoints) * 100)}%`,
              }}
            />
          </div>

          <div className={styles.positionFooter}>
            <span>
              {formatNumber(Math.max(0, view.data.targetPoints - view.data.points))} points to
              target
            </span>
            <Link href="/leaderboards/weekly">VIEW STANDINGS</Link>
          </div>
        </>
      )}
    </WidgetFrame>
  );
}
