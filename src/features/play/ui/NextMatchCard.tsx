// VERZUS STAGE 3 NEXT MATCH
"use client";

import Link from "next/link";

import type { NextMatch } from "../model";
import type { PlayWidgetView } from "../view-model";
import { PlayWidgetStatePanel } from "./PlayWidgetState";
import { StatusChip } from "./StatusChip";
import styles from "./play-command-center.module.css";

function formatStart(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

function countdownLabel(match: NextMatch): string {
  const remaining = Math.max(
    0,
    new Date(match.startsAt).getTime() - new Date(match.serverNow).getTime(),
  );
  const totalMinutes = Math.floor(remaining / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (remaining === 0) {
    return "STARTING NOW";
  }

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
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
  const statusTone =
    match.status === "in_progress" || match.status === "starting_soon"
      ? "live"
      : match.status === "checked_in"
        ? "verified"
        : "scheduled";

  return (
    <div className={styles.matchCard}>
      <div className={styles.matchTopline}>
        <div>
          <span>{match.game}</span>
          <strong>{match.competitionName}</strong>
        </div>
        <StatusChip tone={statusTone}>{match.status.replaceAll("_", " ")}</StatusChip>
      </div>

      <div className={styles.matchCountdown}>
        <span>STARTS IN</span>
        <strong data-countdown>{countdownLabel(match)}</strong>
        <small>{formatStart(match.startsAt)}</small>
      </div>

      <div className={styles.matchup}>
        <div className={styles.competitor} data-current="true">
          <span className={styles.competitorMark} aria-hidden="true">
            {match.self.handle.slice(0, 2)}
          </span>
          <strong>{match.self.handle}</strong>
          <small>#{match.self.rank ?? "—"} · YOU</small>
        </div>

        <span className={styles.versus}>VS</span>

        <div className={styles.competitor}>
          <span className={styles.competitorMark} aria-hidden="true">
            {match.opponent.handle.slice(0, 2)}
          </span>
          <strong>{match.opponent.handle}</strong>
          <small>#{match.opponent.rank ?? "—"} · RIVAL</small>
        </div>
      </div>

      <div className={styles.matchMeta}>
        <span>{match.format}</span>
        <span>{match.opponent.locationLabel}</span>
      </div>

      <Link className={styles.secondaryLink} href={`/matches/${match.matchId}`}>
        VIEW MATCH DETAILS
      </Link>
    </div>
  );
}
