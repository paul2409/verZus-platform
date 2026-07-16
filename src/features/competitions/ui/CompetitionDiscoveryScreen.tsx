import { Badge } from "@/components/primitives/badge";
import { Button } from "@/components/primitives/button";
import { Icon } from "@/components/primitives/icon";

import { CompetitionSummary } from "../components";
import type { CompetitionViewModel } from "../model/competition.types";
import styles from "./CompetitionDiscoveryScreen.module.css";

const competitions: readonly CompetitionViewModel[] = [
  {
    id: "ea-fc-rookie-cup",
    name: "EA FC Rookie Cup",
    game: "EA FC",
    format: "1v1 Swiss",
    status: "registration-open",
    eligibility: "eligible",
    eligibilityMessage: "Rookie and Contender divisions accepted.",
    startsAtLabel: "Fri · 20:00",
    timezoneLabel: "WAT",
    rewardLabel: "25,000 VS Credits",
    participantCount: 96,
    capacity: 128,
  },
  {
    id: "league-ranked-open",
    name: "League Ranked Open",
    game: "League of Legends",
    format: "5v5 Draft",
    status: "scheduled",
    eligibility: "pending",
    eligibilityMessage: "Crew lane verification is in progress.",
    startsAtLabel: "Sat · 16:00",
    timezoneLabel: "WAT",
    rewardLabel: "40,000 VS Credits",
    participantCount: 12,
    capacity: 16,
  },
  {
    id: "clash-ladder",
    name: "Clash Ladder Sprint",
    game: "Clash Royale",
    format: "Best of 3",
    status: "check-in-open",
    eligibility: "eligible",
    eligibilityMessage: "Check-in is open for verified players.",
    startsAtLabel: "Today · 19:30",
    timezoneLabel: "WAT",
    rewardLabel: "15,000 VS Credits",
    participantCount: 32,
    capacity: 32,
  },
  {
    id: "cod-squad-battles",
    name: "COD Squad Battles",
    game: "COD Mobile",
    format: "4v4 Search & Destroy",
    status: "registration-closed",
    eligibility: "closed",
    eligibilityMessage: "Registration has reached capacity.",
    startsAtLabel: "Sun · 18:00",
    timezoneLabel: "WAT",
    rewardLabel: "50,000 VS Credits",
    participantCount: 24,
    capacity: 24,
  },
];

const categories = ["All competitions", "EA FC", "League", "Clash", "COD Mobile"] as const;

export function CompetitionDiscoveryScreen() {
  return (
    <main className={styles.page} data-stage-4-screen="compete">
      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>04.0 // COMPETITION DISCOVERY</p>
          <h1>Compete</h1>
          <p>
            Enter verified esports competitions, Crew wars and ranked ladders. Every reward pool is
            displayed separately from competitive VS Points.
          </p>
        </div>
        <div className={styles.heroMetric}>
          <span>Open entries</span>
          <strong>12</strong>
          <Badge tone="positive" variant="outline">
            Season Zero
          </Badge>
        </div>
      </header>

      <section aria-label="Competition search and filters" className={styles.controls}>
        <label className={styles.search}>
          <span className={styles.srOnly}>Search competitions</span>
          <Icon decorative name="search" size="sm" />
          <input placeholder="Search competitions" type="search" />
        </label>
        <button className={styles.controlButton} type="button">
          <Icon decorative name="target" size="sm" />
          Lagos
          <Icon decorative name="chevron-down" size="xs" />
        </button>
        <button className={styles.controlButton} type="button">
          <Icon decorative name="calendar" size="sm" />
          This week
          <Icon decorative name="chevron-down" size="xs" />
        </button>
      </section>

      <nav aria-label="Competition categories" className={styles.categories}>
        {categories.map((category, index) => (
          <button
            aria-current={index === 0 ? "page" : undefined}
            data-active={index === 0 ? "true" : undefined}
            key={category}
            type="button"
          >
            {category}
          </button>
        ))}
      </nav>

      <section aria-labelledby="featured-competitions-title" className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>04.1 // LIVE OPPORTUNITIES</p>
            <h2 id="featured-competitions-title">Featured competitions</h2>
          </div>
          <Badge tone="live" variant="outline">
            3 live windows
          </Badge>
        </div>

        <div className={styles.grid}>
          {competitions.map((competition) => (
            <CompetitionSummary
              actions={
                <Button
                  fullWidth
                  leadingIcon={competition.eligibility === "eligible" ? "play" : "eye"}
                  variant={competition.eligibility === "eligible" ? "primary" : "secondary"}
                >
                  {competition.eligibility === "eligible" ? "Enter competition" : "View details"}
                </Button>
              }
              competition={competition}
              key={competition.id}
            />
          ))}
        </div>
      </section>

      <section aria-labelledby="war-day-title" className={styles.warPanel}>
        <div>
          <p className={styles.eyebrow}>04.2 // CREW VERZUS</p>
          <h2 id="war-day-title">War Day is Saturday</h2>
          <p>
            Weekly Crew vs Crew battles combine all supported game lanes into one championship
            result.
          </p>
        </div>
        <div className={styles.warMeta}>
          <span>Next lock</span>
          <strong>02D : 14H : 22M</strong>
        </div>
        <Button leadingIcon="swords" variant="secondary">
          Open Crew War room
        </Button>
      </section>
    </main>
  );
}
