// VERZUS STAGE 3 CURRENT POSITION
"use client";

import Link from "next/link";
import type { CSSProperties } from "react";

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
  const progress = view.data ? Math.min(100, (view.data.points / view.data.targetPoints) * 100) : 0;
  const progressStyle = { "--play-progress": `${progress}%` } as CSSProperties;

  return (
    <WidgetFrame
      eyebrow="02 · WEEKLY POSITION"
      title="Your competitive status"
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
          <div className={styles.positionLead}>
            <div>
              <span>YOUR RANK</span>
              <strong data-rank>#{view.data.rank}</strong>
              <small>{view.data.movement.toUpperCase()} THIS WEEK</small>
            </div>
            <div>
              <span>VS POINTS</span>
              <strong data-numeric>{formatNumber(view.data.points)}</strong>
              <small>{view.data.tier.toUpperCase()}</small>
            </div>
          </div>

          <dl className={styles.positionGrid}>
            <div>
              <dt>RECORD</dt>
              <dd>
                {view.data.wins}W–{view.data.losses}L
              </dd>
            </div>
            <div>
              <dt>WIN RATE</dt>
              <dd>{view.data.winRate}%</dd>
            </div>
            <div>
              <dt>STREAK</dt>
              <dd>{view.data.streak}</dd>
            </div>
          </dl>

          <div className={styles.progressTrack} style={progressStyle}>
            <span />
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
