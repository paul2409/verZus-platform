// VERZUS STAGE 3 HERO

import Link from "next/link";

import type { CurrentPosition, NextMatch, PlayerStatus, RecommendedCompetition } from "../model";
import type { PlayWidgetView } from "../view-model";
import { StatusChip } from "./StatusChip";
import styles from "./play-command-center.module.css";

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-GB").format(value);
}

function formatStart(value: string | undefined): string {
  if (!value) {
    return "SCHEDULE PENDING";
  }

  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

export function PlayHero({
  competitions,
  currentPosition,
  nextMatch,
  online,
  playerStatus,
}: {
  competitions: PlayWidgetView<RecommendedCompetition[]>;
  currentPosition: PlayWidgetView<CurrentPosition>;
  nextMatch: PlayWidgetView<NextMatch>;
  online: boolean;
  playerStatus: PlayWidgetView<PlayerStatus>;
}) {
  const competition =
    competitions.data?.find((item) => item.isFeatured) ?? competitions.data?.[0] ?? null;
  const match = nextMatch.data;
  const player = playerStatus.data;
  const position = currentPosition.data;
  const primaryHref = match ? `/matches/${match.matchId}` : "/compete";
  const primaryLabel = match ? "OPEN MATCH ROOM" : "QUEUE RANKED";
  const eventLabel = competition?.title ?? match?.competitionName ?? "WEEKLY CREW VERZUS";

  return (
    <section className={styles.playHero} aria-labelledby="play-hero-title">
      <div className={styles.heroGrid} aria-hidden="true" />
      <div className={styles.heroSignal} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <div className={styles.heroCopy}>
        <div className={styles.heroTopline}>
          <span>{"06 /" + "/ HOME HUD"}</span>
          <StatusChip tone={online ? "live" : "locked"}>
            {online ? (player?.weekLabel ?? "WEEK LIVE") : "OFFLINE"}
          </StatusChip>
        </div>

        <h2 id="play-hero-title">
          EVERY GAME
          <span>IS A VERZUS</span>
        </h2>

        <p>
          Welcome back, <strong>{player?.handle ?? "PLAYER"}</strong>. Your next verified action,
          weekly rank, Crew signal, and eligible competitions are ready below.
        </p>

        <div className={styles.heroActions}>
          <Link data-action="primary" href={primaryHref}>
            {primaryLabel}
          </Link>
          <Link data-action="secondary" href="/profile">
            VIEW PLAYER CARD
          </Link>
        </div>
      </div>

      <aside className={styles.heroScore} aria-label="Current weekly competitive score">
        <span>VS POINTS</span>
        <strong data-numeric>{position ? formatNumber(position.points) : "—"}</strong>
        <small>
          {position
            ? `RANK #${position.rank} · ${position.wins}W-${position.losses}L · ${position.streak}`
            : "WEEKLY POSITION UNAVAILABLE"}
        </small>
        <div>
          <span>{eventLabel}</span>
          <b>{formatStart(competition?.startsAt ?? match?.startsAt)}</b>
        </div>
      </aside>
    </section>
  );
}
