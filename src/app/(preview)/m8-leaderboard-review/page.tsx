// VERZUS M8.10 LEADERBOARD REVIEW HUB

import Link from "next/link";

import { getLeaderboardReleaseConfig } from "@/features/leaderboards/release";

import styles from "./review.module.css";

const reviewCases = [
  {
    label: "Weekly rankings",
    description: "Responsive mobile list and desktop semantic table.",
    href: "/leaderboards/weekly",
  },
  {
    label: "Player intel",
    description: "Player rank, form, trust, recent matches and achievements.",
    href: "/leaderboards/weekly?intel=player&entityId=player-prismo",
  },
  {
    label: "Crew intel",
    description: "Crew leadership, roster, form and championship position.",
    href: "/leaderboards/weekly?intel=crew&entityId=crew-xenon",
  },
  {
    label: "Match intel",
    description: "Match participants, score, integrity and operations route.",
    href: "/leaderboards/weekly?intel=match&entityId=match-player-prismo",
  },
  {
    label: "Isolated card failure",
    description: "The failed card remains recoverable while rankings stay usable.",
    href: "/leaderboards/weekly?intel=player&entityId=player-prismo&intelScenario=error",
  },
] as const;

export default function M8LeaderboardReviewPage() {
  const config = getLeaderboardReleaseConfig();

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <span>M8.10 VISUAL AND RELEASE REVIEW</span>
        <h1>Leaderboard interaction approval</h1>
        <p>
          Review ranking color, explicit entity targets, keyboard operation, responsive drawer and
          bottom-sheet behavior, failure isolation and full-route fallbacks.
        </p>
      </header>

      <section className={styles.meta} aria-label="Release metadata">
        <p>Environment: {config.appEnvironment}</p>
        <p>Release: {config.releaseSha}</p>
        <p>Leaderboards: {config.leaderboardsEnabled ? "enabled" : "disabled"}</p>
        <p>Entity intel: {config.entityIntelEnabled ? "enabled" : "disabled"}</p>
      </section>

      <section className={styles.grid} aria-label="M8 review cases">
        {reviewCases.map((item) => (
          <article className={styles.card} key={item.href}>
            <h2>{item.label}</h2>
            <p>{item.description}</p>
            <Link href={item.href}>Open review case</Link>
          </article>
        ))}
      </section>

      <section className={styles.checklist}>
        <h2>Approval checklist</h2>
        <ul>
          <li>Player, Crew and match names are explicit targets, not whole-row links.</li>
          <li>Enter and Space open the same intel card.</li>
          <li>Escape and browser Back close the card and preserve leaderboard state.</li>
          <li>Focus returns to the original entity trigger.</li>
          <li>390px uses a bottom sheet; 1440px preserves the ranking table beside the drawer.</li>
          <li>One failed card never removes filters, rankings, current position or rewards.</li>
        </ul>
      </section>
    </main>
  );
}
