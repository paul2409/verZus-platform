// VERZUS M5 STEPS 5.5-5.8
"use client";

import Link from "next/link";

import type { NextMatch } from "../model";
import type { PlayWidgetView } from "../view-model";
import { PlayWidgetStatePanel } from "./PlayWidgetState";
import styles from "./play-command-center.module.css";

function formatStart(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function matchStatusLabel(status: NextMatch["status"]): string {
  return status.replaceAll("_", " ").toUpperCase();
}

export function NextMatchCard({
  view,
  onRetry,
}: {
  view: PlayWidgetView<NextMatch>;
  onRetry: () => void;
}) {
  if (!view.data) {
    return (
      <div className={styles.matchCard}>
        <PlayWidgetStatePanel
          state={view.state}
          errorCode={view.errorCode}
          requestId={view.requestId}
          onRetry={onRetry}
          emptyTitle="NO MATCH SCHEDULED"
          emptyDetail="Enter ranked matchmaking or choose an eligible competition."
        />
        {view.state === "empty" ? (
          <Link className={styles.primaryLink} href="/compete">
            FIND AN OPPORTUNITY
          </Link>
        ) : null}
      </div>
    );
  }

  const match = view.data;

  return (
    <div className={styles.matchCard}>
      <div className={styles.matchTopline}>
        <div>
          <span>{match.game}</span>
          <strong>{match.competitionName}</strong>
        </div>
        <b>{matchStatusLabel(match.status)}</b>
      </div>

      <div className={styles.matchMeta}>
        <span>{match.format}</span>
        <span>{formatStart(match.startsAt)}</span>
      </div>

      <div className={styles.matchup}>
        <div className={styles.competitor}>
          <span className={styles.competitorMark}>{match.self.handle.slice(0, 2)}</span>
          <strong>{match.self.handle}</strong>
          <small>#{match.self.rank ?? "—"} · YOU</small>
        </div>

        <span className={styles.versus}>VS</span>

        <div className={styles.competitor}>
          <span className={`${styles.competitorMark} ${styles.competitorMarkOpponent}`}>
            {match.opponent.handle.slice(0, 2)}
          </span>
          <strong>{match.opponent.handle}</strong>
          <small>#{match.opponent.rank ?? "—"} · OPPONENT</small>
        </div>
      </div>

      <Link className={styles.secondaryLink} href={`/matches/${match.matchId}`}>
        VIEW MATCH DETAILS
      </Link>
    </div>
  );
}
