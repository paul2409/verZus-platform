"use client";

import { useMemo, useState } from "react";

import {
  Panel,
  PanelActions,
  PanelDescription,
  PanelEyebrow,
  PanelHeader,
  PanelHeadingGroup,
  PanelTitle,
} from "@/components/primitives/panel";
import { SegmentedControl, SegmentedControlItem } from "@/components/primitives/segmented-control";
import {
  LeaderboardResponsive,
  sortEntries,
  type LeaderboardSort,
  type LeaderboardState,
} from "@/features/leaderboards";
import {
  leaderboardEntries,
  pinnedLeaderboardEntry,
} from "@/features/leaderboards/mocks/leaderboard.mock";

import styles from "./page.module.css";

const stateOptions: readonly LeaderboardState[] = [
  "success",
  "stale",
  "partial-failure",
  "loading",
  "empty",
  "error",
  "offline",
];

export default function LeaderboardPreviewPage() {
  const [state, setState] = useState<LeaderboardState>("success");
  const [sort, setSort] = useState<LeaderboardSort>({
    key: "rank",
    direction: "ascending",
  });

  const sortedEntries = useMemo(() => sortEntries(leaderboardEntries, sort), [sort]);

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.kicker}>VERZUS Design System · M2 · Step 13</p>
        <h1 className={styles.title}>Leaderboard System</h1>
        <p className={styles.description}>
          One leaderboard display contract with a dense desktop table and a dedicated mobile ranking
          list. Both support current-player emphasis, pinned entries, sortable metrics, stale data
          and isolated failures.
        </p>
      </header>

      <Panel
        aria-labelledby="leaderboard-preview-heading"
        density="spacious"
        elevation="floating"
        tone="primary"
      >
        <PanelHeader>
          <PanelHeadingGroup>
            <PanelEyebrow>Weekly EA FC division</PanelEyebrow>
            <PanelTitle id="leaderboard-preview-heading">Global Rankings</PanelTitle>
            <PanelDescription>
              Switch states to verify loading, empty, stale, offline and partial failure behavior
              without changing the presentation contract.
            </PanelDescription>
          </PanelHeadingGroup>

          <PanelActions>
            <span className={styles.seasonLabel}>Season Zero · Week 04</span>
          </PanelActions>
        </PanelHeader>

        <div className={styles.controls}>
          <SegmentedControl
            fullWidth
            onValueChange={(value) => setState(value as LeaderboardState)}
            size="sm"
            tone="secondary"
            value={state}
          >
            {stateOptions.map((option) => (
              <SegmentedControlItem key={option} value={option}>
                {option.replace("-", " ")}
              </SegmentedControlItem>
            ))}
          </SegmentedControl>
        </div>

        <div className={styles.content}>
          <LeaderboardResponsive
            caption="Weekly EA FC global leaderboard"
            entries={state === "empty" ? [] : sortedEntries}
            onRetry={() => setState("loading")}
            onSortChange={setSort}
            pinnedEntry={pinnedLeaderboardEntry}
            sort={sort}
            state={state}
            updatedLabel="Updated 1 minute ago"
          />
        </div>
      </Panel>

      <section className={styles.notes} aria-labelledby="contract-heading">
        <h2 id="contract-heading">Responsive contract</h2>
        <div className={styles.noteGrid}>
          <article>
            <span>360–767px</span>
            <h3>Mobile ranking list</h3>
            <p>Card-like rows, primary metrics first and expandable secondary stats.</p>
          </article>
          <article>
            <span>768px+</span>
            <h3>Desktop data table</h3>
            <p>Sortable columns, sticky headings and contained horizontal overflow.</p>
          </article>
          <article>
            <span>All widths</span>
            <h3>One display model</h3>
            <p>No duplicated API contract and no compressed desktop layout on mobile.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
