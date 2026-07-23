"use client";

import type { CurrentPosition, PlayerStatus } from "../model";
import type { PlayWidgetView } from "../view-model";
import { PlayWidgetStatePanel } from "./PlayWidgetState";
import styles from "./play-command-center.module.css";

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-GB").format(value);
}

function OverviewMetric({
  label,
  value,
  unlock,
}: {
  label: string;
  value: string;
  unlock?: string;
}) {
  return (
    <div>
      <dt>{label}</dt>
      <dd
        className={styles.overviewMetricValue}
        data-locked={unlock ? "true" : undefined}
        title={unlock}
      >
        <span>{value}</span>
        {unlock ? <small>{unlock}</small> : null}
      </dd>
    </div>
  );
}

export function PlayOverviewStrip({
  playerStatus,
  currentPosition,
  onRetryPlayer,
  onRetryPosition,
}: {
  playerStatus: PlayWidgetView<PlayerStatus>;
  currentPosition: PlayWidgetView<CurrentPosition>;
  onRetryPlayer: () => void;
  onRetryPosition: () => void;
}) {
  if (!playerStatus.data) {
    return (
      <section className={styles.overviewStrip} aria-label="Player competitive overview">
        <PlayWidgetStatePanel
          state={playerStatus.state}
          errorCode={playerStatus.errorCode}
          requestId={playerStatus.requestId}
          onRetry={onRetryPlayer}
        />
      </section>
    );
  }

  const player = playerStatus.data;
  const position = currentPosition.data;

  return (
    <section className={styles.overviewStrip} aria-label="Player competitive overview">
      <div className={styles.overviewTrust}>
        <span className={styles.shieldMark} aria-hidden="true">
          V
        </span>
        <div>
          <small>TRUST SCORE</small>
          <strong>{player.trustScore}</strong>
          <b>{player.trustTier.replaceAll("_", " ")}</b>
        </div>
      </div>

      <dl className={styles.overviewFacts}>
        <OverviewMetric
          label="WINS"
          value={position ? formatNumber(position.wins) : "—"}
          unlock={position ? undefined : "Play 1 match to reveal"}
        />
        <OverviewMetric
          label="WIN RATE"
          value={position ? `${position.winRate}%` : "—"}
          unlock={position ? undefined : "Play 1 match to calculate"}
        />
        <OverviewMetric
          label="CURRENT STREAK"
          value={position?.streak ?? "—"}
          unlock={position ? undefined : "Win 1 match to start"}
        />
      </dl>

      {playerStatus.stale || currentPosition.stale ? (
        <button
          className={styles.overviewRefresh}
          type="button"
          onClick={currentPosition.stale ? onRetryPosition : onRetryPlayer}
        >
          REFRESH
        </button>
      ) : null}
    </section>
  );
}
