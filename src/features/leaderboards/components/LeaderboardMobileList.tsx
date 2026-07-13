import { CrewIdentity, PlayerIdentity } from "@/components/primitives/avatar";
import { Badge, MovementBadge, RankBadge } from "@/components/primitives/badge";

import type { LeaderboardEntryViewModel } from "../model/leaderboard.types";
import styles from "./Leaderboard.module.css";
import { formatRecord, joinClassNames } from "./utils";

export type LeaderboardMobileListProps = {
  entries: readonly LeaderboardEntryViewModel[];
  label?: string;
  pinnedEntry?: LeaderboardEntryViewModel;
};

function MobileEntry({
  entry,
  pinned = false,
}: {
  entry: LeaderboardEntryViewModel;
  pinned?: boolean;
}) {
  return (
    <li className={styles.mobileListItem ?? ""}>
      <article
        aria-label={`Rank ${entry.rank}: ${entry.player.name}`}
        className={joinClassNames(
          styles.mobileCard,
          entry.isCurrentPlayer && styles.mobileCurrentCard,
          pinned && styles.mobilePinnedCard,
        )}
        data-current-player={entry.isCurrentPlayer ? "true" : undefined}
        data-leaderboard-entry={entry.id}
        data-pinned-entry={pinned ? "true" : undefined}
      >
        <div className={styles.mobilePrimaryRow ?? ""}>
          <RankBadge rank={entry.rank} size="md" tier={entry.rankTier} />

          <PlayerIdentity
            avatarInitials={entry.player.initials}
            avatarTone={entry.player.tone}
            compact
            name={entry.player.name}
            presence={entry.player.presence}
            size="sm"
            verified={entry.player.verified}
            {...(entry.player.handle ? { handle: entry.player.handle } : {})}
            {...(entry.player.avatarSrc ? { avatarSrc: entry.player.avatarSrc } : {})}
          />

          <MovementBadge
            movement={entry.movement}
            size="sm"
            {...(entry.movementValue !== null ? { value: entry.movementValue } : {})}
          />
        </div>

        <div className={styles.mobileMetricRow ?? ""}>
          <div>
            <span className={styles.mobileMetricLabel ?? ""}>Points</span>
            <strong className={styles.mobilePoints ?? ""}>{entry.points.toLocaleString()}</strong>
          </div>

          <div>
            <span className={styles.mobileMetricLabel ?? ""}>Record</span>
            <strong className={styles.mobileRecord ?? ""}>{formatRecord(entry)}</strong>
          </div>

          {entry.isCurrentPlayer ? (
            <Badge size="sm" tone="positive" variant="outline">
              You
            </Badge>
          ) : null}
        </div>

        <details className={styles.mobileDetails ?? ""}>
          <summary className={styles.mobileSummary ?? ""}>View full stats</summary>

          <dl className={styles.mobileStats ?? ""}>
            <div>
              <dt>Played</dt>
              <dd>{entry.played}</dd>
            </div>
            <div>
              <dt>Wins</dt>
              <dd>{entry.wins}</dd>
            </div>
            <div>
              <dt>Draws</dt>
              <dd>{entry.draws}</dd>
            </div>
            <div>
              <dt>Losses</dt>
              <dd>{entry.losses}</dd>
            </div>
            <div>
              <dt>Win rate</dt>
              <dd>{entry.winRate.toFixed(1)}%</dd>
            </div>
            <div>
              <dt>Streak</dt>
              <dd>{entry.streak}</dd>
            </div>
          </dl>

          <div className={styles.mobileCrew ?? ""}>
            {entry.crew ? (
              <CrewIdentity
                compact
                emblemInitials={entry.crew.initials}
                emblemTone={entry.crew.tone}
                name={entry.crew.name}
                size="sm"
                tag={entry.crew.tag}
                verified={entry.crew.verified}
                {...(entry.crew.emblemSrc ? { emblemSrc: entry.crew.emblemSrc } : {})}
              />
            ) : (
              <span className={styles.mutedValue ?? ""}>Independent player</span>
            )}
          </div>
        </details>
      </article>
    </li>
  );
}

export function LeaderboardMobileList({
  entries,
  label = "Mobile leaderboard rankings",
  pinnedEntry,
}: LeaderboardMobileListProps) {
  return (
    <ol
      aria-label={label}
      className={styles.mobileList ?? ""}
      data-leaderboard-presentation="mobile-list"
    >
      {pinnedEntry ? <MobileEntry entry={pinnedEntry} pinned /> : null}

      {entries.map((entry) => (
        <MobileEntry entry={entry} key={entry.id} />
      ))}
    </ol>
  );
}
