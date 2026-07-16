"use client";

import Link from "next/link";

import { Avatar } from "@/components/primitives/avatar";
import { Badge, MovementBadge, RankBadge } from "@/components/primitives/badge";
import { Icon } from "@/components/primitives/icon";
import { ClickableIntelEntity } from "@/components/primitives/intel-card";

import { leaderboardEntries } from "../mocks/leaderboard.mock";
import styles from "./LeaderboardScreen.module.css";
const games = [
  { id: "ea-fc", label: "EA FC", icon: "gamepad" as const, active: true },
  { id: "cod", label: "COD", icon: "target" as const, active: false },
  { id: "clash", label: "CLASH", icon: "swords" as const, active: false },
  { id: "league", label: "LEAGUE", icon: "crown" as const, active: false },
] as const;

const filters = [
  { label: "Lagos", icon: "target" as const },
  { label: "Season Zero", icon: "calendar" as const },
  { label: "Top 100", icon: "trophy" as const },
  { label: "This Week", icon: "clock" as const },
] as const;

function getTrust(rank: number): number {
  return Math.max(84, 99 - rank);
}

function getTier(rank: number): "Elite" | "Pro" {
  return rank <= 4 ? "Elite" : "Pro";
}

function RankingRow({ index }: { index: number }) {
  const entry = leaderboardEntries[index]!;
  const trust = getTrust(entry.rank);
  const tier = getTier(entry.rank);

  return (
    <li
      className={styles.row}
      data-current-player={entry.isCurrentPlayer ? "true" : undefined}
      data-rank-tier={entry.rankTier}
    >
      <div className={styles.rankCell}>
        <RankBadge rank={entry.rank} size="md" tier={entry.rankTier} />
        <MovementBadge
          movement={entry.movement}
          size="sm"
          {...(entry.movementValue !== null ? { value: entry.movementValue } : {})}
        />
      </div>

      <div className={styles.playerCell}>
        <Avatar
          initials={entry.player.initials}
          name={entry.player.name}
          presence={entry.player.presence}
          size="md"
          tone={entry.player.tone}
          verified={entry.player.verified}
        />
        <div className={styles.playerCopy}>
          <strong>
            <ClickableIntelEntity
              entityId={entry.player.id}
              entityType="player"
              label={entry.player.name}
            >
              {entry.player.name}
            </ClickableIntelEntity>
          </strong>
          <span>
            TRUST {trust} <b>•</b> {tier}
          </span>
        </div>
      </div>

      <div className={styles.recordCell}>
        <span>
          {entry.wins}W-{entry.losses}L
        </span>
      </div>

      <div className={styles.trustCell}>{trust}</div>
      <div className={styles.pointsCell}>{entry.points.toLocaleString()}</div>
    </li>
  );
}

export function LeaderboardScreen() {
  const currentPlayer = leaderboardEntries.find((entry) => entry.isCurrentPlayer)!;

  return (
    <main className={styles.page} data-stage-4-screen="leaderboards">
      <header className={styles.header}>
        <p className={styles.eyebrow}>06.3 // GAME LANE</p>
        <h1>Rankings</h1>
        <p>
          Verified competitive standings across the current Season Zero lane. VS Points are ranking
          scores, not currency.
        </p>
      </header>

      <nav aria-label="Game leaderboard" className={styles.gameTabs}>
        {games.map((game) => (
          <button
            aria-current={game.active ? "page" : undefined}
            className={styles.gameTab}
            data-active={game.active ? "true" : undefined}
            key={game.id}
            type="button"
          >
            <Icon decorative name={game.icon} size="sm" />
            <span>{game.label}</span>
          </button>
        ))}
      </nav>

      <div aria-label="Leaderboard filters" className={styles.filters}>
        {filters.map((filter) => (
          <button className={styles.filter} key={filter.label} type="button">
            <Icon decorative name={filter.icon} size="sm" />
            <span>{filter.label}</span>
            <Icon decorative name="chevron-down" size="xs" />
          </button>
        ))}
      </div>

      <section aria-labelledby="ranking-table-title" className={styles.rankingPanel}>
        <h2 className={styles.srOnly} id="ranking-table-title">
          Weekly player rankings
        </h2>

        <div aria-hidden="true" className={styles.tableHeader}>
          <span>#</span>
          <span>Player</span>
          <span>W-L</span>
          <span>Trust</span>
          <span>PTS</span>
        </div>

        <ol className={styles.rows}>
          {leaderboardEntries.map((_, index) => (
            <RankingRow index={index} key={leaderboardEntries[index]!.id} />
          ))}
        </ol>
      </section>

      <section aria-labelledby="your-position-title" className={styles.positionSection}>
        <p className={styles.positionLabel} id="your-position-title">
          Your position
        </p>
        <article className={styles.positionCard}>
          <RankBadge rank={currentPlayer.rank} size="md" tier="elite" />
          <MovementBadge movement="increased" size="sm" value={3} />
          <Avatar
            initials={currentPlayer.player.initials}
            name={currentPlayer.player.name}
            presence="online"
            size="md"
            tone="green"
            verified
          />
          <div className={styles.positionIdentity}>
            <strong>{currentPlayer.player.name}</strong>
            <span>TRUST 96 • ELITE</span>
          </div>
          <dl className={styles.positionStats}>
            <div>
              <dt>W-L</dt>
              <dd>
                {currentPlayer.wins}W-{currentPlayer.losses}L
              </dd>
            </div>
            <div>
              <dt>Trust</dt>
              <dd>96</dd>
            </div>
            <div>
              <dt>PTS</dt>
              <dd>{currentPlayer.points.toLocaleString()}</dd>
            </div>
          </dl>
          <Badge size="sm" tone="positive" variant="outline">
            You
          </Badge>
        </article>
      </section>

      <Link className={styles.cta} href="/leaderboards/weekly">
        <span>View full game rankings</span>
        <Icon decorative name="chevron-right" size="md" />
      </Link>
    </main>
  );
}
