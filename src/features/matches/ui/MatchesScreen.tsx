import { Badge } from "@/components/primitives/badge";
import { Button } from "@/components/primitives/button";
import { Icon } from "@/components/primitives/icon";

import { MatchIdentity, MatchTimelineStep } from "../components";
import { matchPreviewMock } from "../mocks/match.mock";
import type { MatchViewModel } from "../model/match.types";
import styles from "./MatchesScreen.module.css";

const scheduledMatches: readonly MatchViewModel[] = [
  matchPreviewMock,
  {
    ...matchPreviewMock,
    id: "crew-war-week-14",
    competitionName: "Crew Verzus War · Week 14",
    roundLabel: "Mainland Titans vs Lagos Lynx",
    status: "scheduled",
    timerLabel: "02:45:20",
    away: {
      ...matchPreviewMock.away,
      id: "player-femiskillz",
      name: "FEMISKILLZ",
      handle: "@femiskillz",
      initials: "FS",
      tone: "red",
    },
  },
  {
    ...matchPreviewMock,
    id: "ranked-ladder-02",
    competitionName: "EA FC Ranked Ladder",
    roundLabel: "Promotion Match",
    status: "both-ready",
    timerLabel: "00:03:14",
    away: {
      ...matchPreviewMock.away,
      id: "player-prodigy",
      name: "PRODIGY",
      handle: "@prodigy",
      initials: "PR",
      tone: "cyan",
    },
  },
];

const recentResults = [
  { game: "EA FC", opponent: "KAIRO", score: "3 - 2", result: "WIN", tone: "positive" },
  { game: "Clash", opponent: "R3DSTORM", score: "1 - 0", result: "WIN", tone: "positive" },
  { game: "League", opponent: "ADEACE", score: "18 - 9", result: "WIN", tone: "positive" },
  { game: "COD", opponent: "SHADOW OPS", score: "1 - 3", result: "LOSS", tone: "negative" },
] as const;

export function MatchesScreen() {
  return (
    <main className={styles.page} data-stage-4-screen="matches">
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>05.0 // MATCH CONTROL</p>
          <h1>Matches</h1>
          <p>
            Check in, enter verified lobbies and submit results without losing access to the rest of
            the platform.
          </p>
        </div>
        <Badge tone="live" variant="outline">
          2 actions pending
        </Badge>
      </header>

      <nav aria-label="Match views" className={styles.tabs}>
        <button aria-current="page" className={styles.tab} data-active="true" type="button">
          Upcoming
        </button>
        <button className={styles.tab} type="button">
          Live
        </button>
        <button className={styles.tab} type="button">
          Results
        </button>
        <button className={styles.tab} type="button">
          Disputes
        </button>
      </nav>

      <section aria-labelledby="next-match-title" className={styles.featuredSection}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>05.1 // NEXT ACTION</p>
            <h2 id="next-match-title">Next scheduled match</h2>
          </div>
          <Badge tone="warning" variant="outline">
            Check-in closes soon
          </Badge>
        </div>

        <div className={styles.featuredGrid}>
          <MatchIdentity
            actions={
              <div className={styles.actionRow}>
                <Button leadingIcon="check" variant="primary">
                  Check in now
                </Button>
                <Button leadingIcon="eye" variant="secondary">
                  View match
                </Button>
              </div>
            }
            match={scheduledMatches[0]!}
          />

          <aside aria-label="Match readiness timeline" className={styles.timelinePanel}>
            <header>
              <p className={styles.eyebrow}>Readiness</p>
              <h3>Match protocol</h3>
            </header>
            <ol className={styles.timeline}>
              <MatchTimelineStep
                detail="Identity and platform eligibility confirmed"
                label="Verified"
                state="complete"
              />
              <MatchTimelineStep
                detail="Check-in window is currently open"
                label="Check in"
                state="current"
              />
              <MatchTimelineStep
                detail="Lobby code unlocks when both players are ready"
                label="Open lobby"
                state="future"
              />
              <MatchTimelineStep
                detail="Submit result evidence after the match"
                label="Report result"
                state="future"
              />
            </ol>
          </aside>
        </div>
      </section>

      <section aria-labelledby="schedule-title" className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>05.2 // SCHEDULE</p>
            <h2 id="schedule-title">Upcoming queue</h2>
          </div>
          <Button size="sm" variant="secondary">
            Calendar view
          </Button>
        </div>

        <div className={styles.matchGrid}>
          {scheduledMatches.slice(1).map((match) => (
            <MatchIdentity
              actions={
                <Button fullWidth leadingIcon="chevron-right" variant="secondary">
                  Open match room
                </Button>
              }
              key={match.id}
              match={match}
            />
          ))}
        </div>
      </section>

      <section aria-labelledby="recent-title" className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>05.3 // VERIFIED RESULTS</p>
            <h2 id="recent-title">Recent matches</h2>
          </div>
        </div>

        <ul className={styles.results}>
          {recentResults.map((result) => (
            <li key={`${result.game}-${result.opponent}`}>
              <span className={styles.gameIcon}>
                <Icon decorative name="gamepad" size="sm" />
              </span>
              <div>
                <strong>{result.game}</strong>
                <span>vs {result.opponent}</span>
              </div>
              <strong className={styles.score}>{result.score}</strong>
              <Badge tone={result.tone} variant="outline">
                {result.result}
              </Badge>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
