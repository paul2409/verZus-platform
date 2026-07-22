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
  const unresolved = !view.data && view.state !== "empty" && view.state !== "success";

  return (
    <WidgetFrame title="YOUR STATS" status="THIS SEASON" className={styles.statsWidget}>
      {unresolved ? (
        <PlayWidgetStatePanel
          state={view.state}
          errorCode={view.errorCode}
          requestId={view.requestId}
          onRetry={onRetry}
        />
      ) : !view.data ? (
        <>
          <div className={styles.emptyStatsDashboard}>
            <div className={styles.emptyStatsRing}>
              <span>RANK</span>
              <strong>—</strong>
              <small>UNRANKED</small>
            </div>
            <div className={styles.emptyStatsCopy}>
              <small>FIRST RESULT PENDING</small>
              <h3>SET YOUR BASELINE</h3>
              <p>Your first confirmed result unlocks rank, win rate, form, and VS Points.</p>
              <dl>
                <div><dt>MATCHES</dt><dd>0</dd></div>
                <div><dt>WINS</dt><dd>0</dd></div>
                <div><dt>WIN RATE</dt><dd>—</dd></div>
              </dl>
            </div>
          </div>
          <Link className={styles.fullWidthLink} href="/compete">
            FIND YOUR FIRST COMPETITION
          </Link>
        </>
      ) : (
        <>
          <div className={styles.statsDashboard}>
            <div className={styles.statsRing} style={progressStyle}>
              <span>RANK</span>
              <strong>#{view.data.rank}</strong>
              <small>{view.data.tier}</small>
            </div>

            <dl className={styles.statsList}>
              <div><dt>MATCHES PLAYED</dt><dd>{view.data.wins + view.data.losses}</dd></div>
              <div><dt>WINS</dt><dd>{view.data.wins}</dd></div>
              <div><dt>WIN RATE</dt><dd>{view.data.winRate}%</dd></div>
              <div><dt>VS POINTS</dt><dd>{formatNumber(view.data.points)}</dd></div>
            </dl>
          </div>
          <Link className={styles.fullWidthLink} href="/leaderboards/weekly">
            VIEW FULL STATS
          </Link>
        </>
      )}
    </WidgetFrame>
  );
}
