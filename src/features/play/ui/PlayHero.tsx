import Link from "next/link";

import type { NextMatch, RecommendedCompetition } from "../model";
import type { PlayWidgetView } from "../view-model";
import styles from "./play-command-center.module.css";

function formatStart(value: string | undefined): string {
  if (!value) {
    return "SEASON LIVE";
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

function gameTone(value: string): "football" | "royale" | "arena" | "combat" | "default" {
  const game = value.toLowerCase();

  if (game.includes("fc") || game.includes("football")) {
    return "football";
  }

  if (game.includes("clash") || game.includes("royale")) {
    return "royale";
  }

  if (game.includes("league") || game.includes("arena")) {
    return "arena";
  }

  if (game.includes("cod") || game.includes("combat")) {
    return "combat";
  }

  return "default";
}

export function PlayHero({
  competitions,
  nextMatch,
  online,
}: {
  competitions: PlayWidgetView<RecommendedCompetition[]>;
  nextMatch: PlayWidgetView<NextMatch>;
  online: boolean;
}) {
  const competition =
    competitions.data?.find((item) => item.isFeatured) ?? competitions.data?.[0] ?? null;
  const match = nextMatch.data;
  const title = competition?.title ?? match?.competitionName ?? "Retro Rivalry";
  const game = competition?.game ?? match?.game ?? "VERZUS";
  const start = competition?.startsAt ?? match?.startsAt;
  const href = competition
    ? `/compete/${competition.competitionId}`
    : match
      ? `/matches/${match.matchId}`
      : "/compete";
  const status = !online
    ? "OFFLINE"
    : competition?.isFeatured
      ? "FEATURED EVENT"
      : match?.status
        ? match.status.replaceAll("_", " ").toUpperCase()
        : "SEASON LIVE";

  return (
    <section className={styles.playHero} data-game-tone={gameTone(game)}>
      <div className={styles.heroAtmosphere} aria-hidden="true">
        <span className={styles.heroSun} />
        <span className={styles.heroGrid} />
        <span className={styles.heroFighterLeft} />
        <span className={styles.heroFighterRight} />
      </div>

      <div className={styles.heroContent}>
        <div className={styles.heroEyebrow}>
          <span>SEASON 7</span>
          <b>{status}</b>
        </div>

        <p className={styles.heroGame}>{game}</p>
        <h1>{title}</h1>
        <p className={styles.heroCopy}>
          Enter the next verified competition, protect your check-in window, and move your weekly
          rank.
        </p>

        <div className={styles.heroMeta}>
          <span>{formatStart(start)}</span>
          <span>{competition?.format ?? match?.format ?? "Competitive queue"}</span>
          <span>{competition?.rewardLabel ?? "Verified competition"}</span>
        </div>

        <div className={styles.heroActions}>
          <Link href={href}>
            {competition ? "VIEW COMPETITION" : match ? "VIEW MATCH" : "FIND COMPETITION"}
          </Link>
          <Link href="/leaderboards/weekly">VIEW WEEKLY RANK</Link>
        </div>
      </div>
    </section>
  );
}
