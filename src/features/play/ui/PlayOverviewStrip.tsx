"use client";

import type { CurrentPosition, PlayerStatus } from "../model";
import type { PlayWidgetView } from "../view-model";
import { PlayWidgetStatePanel } from "./PlayWidgetState";
import styles from "./play-command-center.module.css";

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-GB").format(value);
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
        <div>
          <dt>WINS</dt>
          <dd>{position ? formatNumber(position.wins) : "—"}</dd>
        </div>
        <div>
          <dt>WIN RATE</dt>
          <dd>{position ? `${position.winRate}%` : "—"}</dd>
        </div>
        <div>
          <dt>CURRENT STREAK</dt>
          <dd>{position?.streak ?? "—"}</dd>
        </div>
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
