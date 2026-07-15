// VERZUS M5 STEPS 5.5-5.8
"use client";

import type { PlayWidgetView } from "../view-model";
import type { PlayerStatus } from "../model";
import { PlayWidgetStatePanel } from "./PlayWidgetState";
import styles from "./play-command-center.module.css";

export function PlayerStatusStrip({
  view,
  onRetry,
}: {
  view: PlayWidgetView<PlayerStatus>;
  onRetry: () => void;
}) {
  if (!view.data) {
    return (
      <section className={styles.statusStrip}>
        <PlayWidgetStatePanel
          state={view.state}
          errorCode={view.errorCode}
          requestId={view.requestId}
          onRetry={onRetry}
        />
      </section>
    );
  }

  const player = view.data;

  return (
    <section className={styles.statusStrip} aria-label="Player status">
      <div className={styles.playerIdentity}>
        <span className={styles.playerAvatar}>{player.handle.slice(0, 2)}</span>
        <div>
          <span>PLAYER COMMAND</span>
          <strong>{player.handle}</strong>
          <small>
            {player.gameLane} · {player.locationLabel}
          </small>
        </div>
      </div>

      <div className={styles.playerFacts}>
        <div>
          <span>WEEK</span>
          <strong>{player.weekLabel}</strong>
        </div>
        <div>
          <span>TRUST</span>
          <strong>{player.trustScore}</strong>
        </div>
        <div>
          <span>STATUS</span>
          <strong>{player.trustTier}</strong>
        </div>
        <div>
          <span>ALERTS</span>
          <strong>{player.unreadNotifications}</strong>
        </div>
      </div>

      {view.stale ? <span className={styles.stalePill}>REFRESHING</span> : null}
    </section>
  );
}
