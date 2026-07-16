// VERZUS STAGE 3 PLAYER STATUS
"use client";

import type { PlayerStatus } from "../model";
import type { PlayWidgetView } from "../view-model";
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
      <section className={styles.statusStrip} aria-label="Player status">
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
        <span className={styles.playerAvatar} aria-hidden="true">
          {player.handle.slice(0, 2)}
        </span>
        <div>
          <span>WELCOME BACK</span>
          <strong>{player.handle}</strong>
          <small>
            {player.primaryGame} · {player.gameLane} · {player.locationLabel}
          </small>
        </div>
      </div>

      <dl className={styles.playerFacts}>
        <div>
          <dt>WEEK</dt>
          <dd>{player.weekLabel}</dd>
        </div>
        <div>
          <dt>TRUST</dt>
          <dd>{player.trustScore}</dd>
        </div>
        <div>
          <dt>TIER</dt>
          <dd>{player.trustTier}</dd>
        </div>
        <div>
          <dt>ALERTS</dt>
          <dd>{player.unreadNotifications}</dd>
        </div>
      </dl>

      {view.stale ? <span className={styles.stalePill}>REFRESHING</span> : null}
    </section>
  );
}
