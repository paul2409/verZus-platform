// VERZUS M5 STEPS 5.5-5.8

import Link from "next/link";
import type { CSSProperties } from "react";

import type { PlayScenario } from "../model";
import { getMockPlaySnapshot, type MockPlaySnapshot } from "../server/mock-play.data";
import { playReferenceViewports, responsiveReferencesEnabled } from "./reference-config";
import styles from "./play-reference-board.module.css";

const scenarioDefinitions: readonly {
  id: PlayScenario;
  title: string;
  intent: string;
}[] = [
  {
    id: "normal",
    title: "Normal",
    intent: "Balanced weekly overview with the next match visible and no urgent action.",
  },
  {
    id: "check_in_open",
    title: "Check-in open",
    intent: "The opening viewport prioritises the active check-in action.",
  },
  {
    id: "checked_in",
    title: "Checked in",
    intent: "Confirmation is dominant while the player waits for the match window.",
  },
  {
    id: "match_starting_soon",
    title: "Match starting soon",
    intent: "Urgent timing and the match-entry path are visually unmistakable.",
  },
  {
    id: "no_match_scheduled",
    title: "No match scheduled",
    intent: "The empty match state redirects the player to a safe next action.",
  },
  {
    id: "crew_activity_present",
    title: "Crew activity present",
    intent: "Live Crew movement is visible without overtaking the primary match action.",
  },
  {
    id: "no_crew",
    title: "No Crew",
    intent: "Crew recruitment is available without breaking the rest of Play.",
  },
  {
    id: "opportunities_available",
    title: "Opportunities available",
    intent: "Recommended competitions receive stronger emphasis after essential actions.",
  },
  {
    id: "partial_api_failure",
    title: "Partial API failure",
    intent: "Crew and activity fail independently while match, check-in, and rank survive.",
  },
  {
    id: "offline",
    title: "Offline",
    intent: "Cached/static navigation survives while network-dependent actions are controlled.",
  },
];

type ReferenceViewport = (typeof playReferenceViewports)[number]["id"];

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-GB").format(value);
}

function formatTime(value: string | null): string {
  if (!value) {
    return "TBC";
  }

  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(new Date(value));
}

function statusLabel(scenario: PlayScenario): string {
  switch (scenario) {
    case "check_in_open":
      return "CHECK-IN OPEN";
    case "checked_in":
      return "CHECKED IN";
    case "match_starting_soon":
      return "STARTING SOON";
    case "no_match_scheduled":
      return "NO MATCH";
    case "crew_activity_present":
      return "CREW LIVE";
    case "no_crew":
      return "FREE AGENT";
    case "opportunities_available":
      return "ENTRY OPEN";
    case "partial_api_failure":
      return "DEGRADED";
    case "offline":
      return "OFFLINE";
    case "normal":
      return "WEEK 14 LIVE";
  }
}

function ReferenceStateCard({
  title,
  detail,
  tone = "neutral",
}: {
  title: string;
  detail: string;
  tone?: "neutral" | "danger" | "warning";
}) {
  return (
    <div className={styles.referenceState} data-tone={tone}>
      <strong>{title}</strong>
      <span>{detail}</span>
    </div>
  );
}

function ReferencePlayerStatus({
  snapshot,
  offline,
}: {
  snapshot: MockPlaySnapshot;
  offline: boolean;
}) {
  return (
    <header className={styles.playerStatus}>
      <div className={styles.identity}>
        <span className={styles.avatar}>JF</span>
        <div>
          <span>PLAYER COMMAND</span>
          <strong>{snapshot.playerStatus.handle}</strong>
          <small>
            {snapshot.playerStatus.game_lane} · {snapshot.playerStatus.location_label}
          </small>
        </div>
      </div>

      <div className={styles.statusFacts}>
        <div>
          <span>TRUST</span>
          <strong>{snapshot.playerStatus.trust_score}</strong>
        </div>
        <div>
          <span>WEEK</span>
          <strong>{snapshot.playerStatus.week_label}</strong>
        </div>
        <div>
          <span>NETWORK</span>
          <strong>{offline ? "OFFLINE" : "ONLINE"}</strong>
        </div>
      </div>
    </header>
  );
}

function ReferencePrimaryAction({
  scenario,
  snapshot,
}: {
  scenario: PlayScenario;
  snapshot: MockPlaySnapshot;
}) {
  if (scenario === "offline") {
    return (
      <section className={styles.primaryAction}>
        <ReferenceStateCard
          title="PLAY IS OFFLINE"
          detail="Reconnect to refresh your next match and check-in status. Cached navigation remains available."
          tone="warning"
        />
        <div className={styles.offlineActions}>
          <button type="button">RETRY CONNECTION</button>
          <button type="button">VIEW CACHED ACTIVITY</button>
        </div>
      </section>
    );
  }

  const match = snapshot.nextMatch;

  if (!match) {
    return (
      <section className={styles.primaryAction}>
        <div className={styles.primaryHeader}>
          <span>01 · PRIMARY ACTION</span>
          <b>NO MATCH SCHEDULED</b>
        </div>
        <div className={styles.noMatch}>
          <strong>YOUR NEXT BATTLE IS NOT SET.</strong>
          <p>
            Enter a ranked queue or choose an eligible competition while the match calendar is
            clear.
          </p>
          <button type="button">FIND RANKED MATCH</button>
        </div>
      </section>
    );
  }

  const action =
    scenario === "checked_in"
      ? "VIEW MATCH ROOM"
      : scenario === "match_starting_soon"
        ? "ENTER MATCH"
        : scenario === "check_in_open"
          ? "CHECK IN NOW"
          : "VIEW MATCH";

  return (
    <section className={styles.primaryAction}>
      <div className={styles.primaryHeader}>
        <span>01 · NEXT MATCH</span>
        <b>{statusLabel(scenario)}</b>
      </div>

      <div className={styles.matchMeta}>
        <span>{match.game}</span>
        <span>{match.format}</span>
        <span>{formatTime(match.starts_at)} WAT</span>
      </div>

      <div className={styles.matchup}>
        <div>
          <span className={styles.playerMark}>JF</span>
          <strong>{match.self.handle}</strong>
          <small>#{match.self.rank ?? "—"} · YOU</small>
        </div>
        <b>VS</b>
        <div>
          <span className={styles.playerMarkAlt}>R3</span>
          <strong>{match.opponent.handle}</strong>
          <small>#{match.opponent.rank ?? "—"} · OPPONENT</small>
        </div>
      </div>

      <div className={styles.countdown}>
        <span>
          {scenario === "match_starting_soon"
            ? "MATCH STARTS IN"
            : scenario === "checked_in"
              ? "READY WINDOW"
              : "CHECK-IN CLOSES"}
        </span>
        <strong>{scenario === "match_starting_soon" ? "00 : 08 : 00" : "00 : 55 : 00"}</strong>
      </div>

      <div className={styles.primaryButtons}>
        <button type="button">{action}</button>
        <button type="button">MATCH DETAILS</button>
      </div>
    </section>
  );
}

function ReferencePosition({ snapshot }: { snapshot: MockPlaySnapshot }) {
  const position = snapshot.currentPosition;

  return (
    <section className={styles.widget}>
      <header>
        <span>02 · WEEKLY STATUS</span>
        <b>UPDATED</b>
      </header>

      <div className={styles.metricGrid}>
        <div>
          <span>VS POINTS</span>
          <strong>{formatNumber(position.points)}</strong>
        </div>
        <div>
          <span>RANK</span>
          <strong>#{position.rank}</strong>
        </div>
        <div>
          <span>WIN RATE</span>
          <strong>{position.win_rate}%</strong>
        </div>
        <div>
          <span>STREAK</span>
          <strong>{position.streak}</strong>
        </div>
      </div>

      <div className={styles.progressLine}>
        <span
          style={
            {
              "--progress": `${Math.min(100, (position.points / position.target_points) * 100)}%`,
            } as CSSProperties
          }
        />
      </div>
      <small>
        {formatNumber(position.target_points - position.points)} points to next target ·{" "}
        {position.tier}
      </small>
    </section>
  );
}

function ReferenceCrew({
  scenario,
  snapshot,
}: {
  scenario: PlayScenario;
  snapshot: MockPlaySnapshot;
}) {
  if (scenario === "partial_api_failure") {
    return (
      <section className={styles.widget}>
        <header>
          <span>03 · CREW PULSE</span>
          <b>UNAVAILABLE</b>
        </header>
        <ReferenceStateCard
          title="CREW SIGNAL LOST"
          detail="Crew activity failed independently. Your match and check-in remain active."
          tone="danger"
        />
      </section>
    );
  }

  if (!snapshot.crewSummary) {
    return (
      <section className={styles.widget}>
        <header>
          <span>03 · CREW PULSE</span>
          <b>FREE AGENT</b>
        </header>
        <div className={styles.emptyCrew}>
          <strong>REPRESENT SOMETHING BIGGER.</strong>
          <span>Discover a Crew that matches your game, region, and availability.</span>
          <button type="button">EXPLORE CREWS</button>
        </div>
      </section>
    );
  }

  const crew = snapshot.crewSummary;

  return (
    <section className={styles.widget}>
      <header>
        <span>03 · CREW PULSE</span>
        <b>{crew.live_activity_count > 0 ? `${crew.live_activity_count} LIVE` : "READY"}</b>
      </header>

      <div className={styles.crewIdentity}>
        <span>MT</span>
        <div>
          <strong>{crew.name}</strong>
          <small>
            Rank #{crew.rank} · {formatNumber(crew.points)} points
          </small>
        </div>
      </div>

      <div className={styles.crewFacts}>
        <div>
          <span>ONLINE</span>
          <strong>
            {crew.online_members}/{crew.total_members}
          </strong>
        </div>
        <div>
          <span>NEXT WAR</span>
          <strong>{formatTime(crew.next_fixture_at)}</strong>
        </div>
      </div>
      <small>{crew.next_fixture_label}</small>
    </section>
  );
}

function ReferenceOpportunities({
  scenario,
  snapshot,
}: {
  scenario: PlayScenario;
  snapshot: MockPlaySnapshot;
}) {
  const opportunities = snapshot.recommendedCompetitions;

  return (
    <section className={styles.widget} data-featured={scenario === "opportunities_available"}>
      <header>
        <span>04 · OPPORTUNITIES</span>
        <b>{opportunities.length} OPEN</b>
      </header>

      <div className={styles.opportunityList}>
        {opportunities.slice(0, 2).map((competition) => (
          <article key={competition.competition_id}>
            <div>
              <span>{competition.game}</span>
              <strong>{competition.title}</strong>
              <small>
                {competition.entry_label} · {competition.eligibility_label}
              </small>
            </div>
            <b>{competition.reward_label}</b>
          </article>
        ))}
      </div>
    </section>
  );
}

function ReferenceActivity({
  scenario,
  snapshot,
}: {
  scenario: PlayScenario;
  snapshot: MockPlaySnapshot;
}) {
  if (scenario === "partial_api_failure") {
    return (
      <section className={styles.widget}>
        <header>
          <span>05 · RECENT ACTIVITY</span>
          <b>RETRY</b>
        </header>
        <ReferenceStateCard
          title="ACTIVITY TEMPORARILY UNAVAILABLE"
          detail="This widget failed without affecting the rest of Play."
          tone="danger"
        />
      </section>
    );
  }

  return (
    <section className={styles.widget}>
      <header>
        <span>05 · RECENT ACTIVITY</span>
        <b>LIVE FEED</b>
      </header>

      <div className={styles.activityList}>
        {snapshot.recentActivity.slice(0, 3).map((item) => (
          <div key={item.activity_id}>
            <span aria-hidden="true">›</span>
            <div>
              <strong>{item.title}</strong>
              <small>{item.detail}</small>
            </div>
            <b>
              {item.points_delta === null
                ? "—"
                : `${item.points_delta > 0 ? "+" : ""}${item.points_delta}`}
            </b>
          </div>
        ))}
      </div>
    </section>
  );
}

function ReferenceQuickActions() {
  return (
    <section className={styles.widget}>
      <header>
        <span>06 · QUICK ACTIONS</span>
        <b>ALWAYS AVAILABLE</b>
      </header>
      <div className={styles.quickActions}>
        <button type="button">FIND MATCH</button>
        <button type="button">COMPETE</button>
        <button type="button">RANKINGS</button>
        <button type="button">CREW HQ</button>
      </div>
    </section>
  );
}

function ReferenceScreen({
  scenario,
  viewport,
}: {
  scenario: PlayScenario;
  viewport: ReferenceViewport;
}) {
  const snapshot = getMockPlaySnapshot(scenario);
  const offline = scenario === "offline";

  return (
    <div className={styles.screen} data-viewport={viewport} data-scenario={scenario}>
      <div className={styles.scanlines} />
      <ReferencePlayerStatus snapshot={snapshot} offline={offline} />

      {scenario === "partial_api_failure" ? (
        <div className={styles.degradedBanner}>
          <strong>PARTIAL SERVICE DEGRADATION</strong>
          <span>
            Crew and activity are unavailable. Essential match actions remain operational.
          </span>
        </div>
      ) : null}

      {offline ? (
        <div className={styles.offlineBanner}>OFFLINE MODE · LAST SYNC 2 MINUTES AGO</div>
      ) : null}

      <main className={styles.screenGrid}>
        <div className={styles.primaryColumn}>
          <ReferencePrimaryAction scenario={scenario} snapshot={snapshot} />
          <ReferencePosition snapshot={snapshot} />
          <ReferenceOpportunities scenario={scenario} snapshot={snapshot} />
        </div>

        <div className={styles.secondaryColumn}>
          <ReferenceCrew scenario={scenario} snapshot={snapshot} />
          <ReferenceActivity scenario={scenario} snapshot={snapshot} />
          <ReferenceQuickActions />
        </div>
      </main>
    </div>
  );
}

function ViewportBoard({ viewport }: { viewport: (typeof playReferenceViewports)[number] }) {
  const locked = viewport.id !== "mobile-390" && !responsiveReferencesEnabled;

  return (
    <section className={styles.viewportSection}>
      <header className={styles.viewportHeader}>
        <div>
          <span>REFERENCE SET</span>
          <h2>{viewport.label}</h2>
          <p>
            {viewport.id === "mobile-390"
              ? "Mobile opening view prioritises the next action, opponent, and check-in."
              : "Responsive reference generation is unlocked only after explicit mobile approval."}
          </p>
        </div>
        <strong>{locked ? "LOCKED PENDING MOBILE APPROVAL" : "GENERATED · UNAPPROVED"}</strong>
      </header>

      {locked ? (
        <div className={styles.lockedPanel}>
          <strong>{viewport.label.toUpperCase()} REFERENCES LOCKED</strong>
          <p>Approve the 390px reference set, then run the script in responsive mode.</p>
        </div>
      ) : (
        <div className={styles.referenceGrid}>
          {scenarioDefinitions.map((scenario) => (
            <article className={styles.referenceCard} key={`${viewport.id}-${scenario.id}`}>
              <header>
                <div>
                  <span>{scenario.id.replaceAll("_", " ")}</span>
                  <h3>{scenario.title}</h3>
                  <p>{scenario.intent}</p>
                </div>
                <b>APPROVAL REQUIRED</b>
              </header>

              <div className={styles.frameStage} data-viewport={viewport.id}>
                <ReferenceScreen scenario={scenario.id} viewport={viewport.id} />
              </div>

              <footer>
                <span>
                  {viewport.width} × {viewport.height}
                </span>
                <Link href={`/play?scenario=${scenario.id}`}>Production route after approval</Link>
              </footer>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export function PlayReferenceBoard() {
  return (
    <main className={styles.page}>
      <section className={styles.intro}>
        <div>
          <span>M5 · PLAY COMMAND CENTRE</span>
          <h1>State-complete Play references</h1>
          <p>
            The board contains every required Play scenario. It is an approval surface, not
            production screen code.
          </p>
        </div>
        <div className={styles.introStatus}>
          <strong>10</strong>
          <span>REQUIRED STATES</span>
        </div>
      </section>

      <section className={styles.rules}>
        <div>
          <strong>OPENING-VIEW RULE</strong>
          <span>
            What to do now, next opponent, and check-in must be visible before secondary marketing
            or explanation.
          </span>
        </div>
        <div>
          <strong>FAILURE-ISOLATION RULE</strong>
          <span>
            Match and check-in remain usable when Crew, rank, opportunity, or activity data fails.
          </span>
        </div>
      </section>

      {playReferenceViewports.map((viewport) => (
        <ViewportBoard key={viewport.id} viewport={viewport} />
      ))}
    </main>
  );
}
