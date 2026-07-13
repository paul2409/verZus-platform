"use client";

import type {
  LeaderboardEntryViewModel,
  LeaderboardSort,
  LeaderboardState,
} from "../model/leaderboard.types";
import styles from "./Leaderboard.module.css";
import { LeaderboardMobileList } from "./LeaderboardMobileList";
import { LeaderboardTable } from "./LeaderboardTable";
import { joinClassNames } from "./utils";

export type LeaderboardResponsiveProps = {
  entries: readonly LeaderboardEntryViewModel[];
  state?: LeaderboardState;
  caption?: string;
  updatedLabel?: string;
  stateMessage?: string;
  sort?: LeaderboardSort;
  onSortChange?: (sort: LeaderboardSort) => void;
  pinnedEntry?: LeaderboardEntryViewModel;
  onRetry?: () => void;
};

const defaultStateMessages: Record<Exclude<LeaderboardState, "success">, string> = {
  loading: "Loading the latest rankings.",
  empty: "No ranked players are available for this view yet.",
  stale: "Rankings may be slightly out of date while synchronization continues.",
  error: "The leaderboard could not be loaded.",
  offline: "You are offline. Cached rankings are unavailable.",
  "partial-failure": "Some ranking details could not be refreshed.",
};

function LeaderboardSkeleton() {
  return (
    <div
      aria-label="Loading leaderboard"
      className={styles.skeletonList ?? ""}
      data-leaderboard-loading="true"
      role="status"
    >
      {Array.from({ length: 5 }, (_, index) => (
        <div className={styles.skeletonRow ?? ""} key={index}>
          <span className={styles.skeletonRank ?? ""} />
          <span className={styles.skeletonIdentity ?? ""} />
          <span className={styles.skeletonMetric ?? ""} />
        </div>
      ))}
    </div>
  );
}

function BlockingState({
  state,
  message,
  onRetry,
}: {
  state: "empty" | "error" | "offline";
  message: string;
  onRetry: (() => void) | undefined;
}) {
  const role = state === "error" || state === "offline" ? "alert" : "status";

  return (
    <div
      className={joinClassNames(styles.stateCard, styles[`state${state}`])}
      data-leaderboard-state={state}
      role={role}
    >
      <p className={styles.stateEyebrow ?? ""}>{state.replace("-", " ")}</p>
      <h3 className={styles.stateTitle ?? ""}>
        {state === "empty"
          ? "No rankings yet"
          : state === "offline"
            ? "Leaderboard offline"
            : "Leaderboard unavailable"}
      </h3>
      <p className={styles.stateMessage ?? ""}>{message}</p>

      {onRetry && state !== "empty" ? (
        <button className={styles.retryButton ?? ""} onClick={onRetry} type="button">
          Retry leaderboard
        </button>
      ) : null}
    </div>
  );
}

export function LeaderboardResponsive({
  entries,
  state = "success",
  caption = "Leaderboard rankings",
  updatedLabel = "Updated just now",
  stateMessage,
  sort,
  onSortChange,
  pinnedEntry,
  onRetry,
}: LeaderboardResponsiveProps) {
  const busy = state === "loading";
  const message = state === "success" ? "" : (stateMessage ?? defaultStateMessages[state]);

  if (state === "loading") {
    return <LeaderboardSkeleton />;
  }

  if (state === "empty" || state === "error" || state === "offline") {
    return <BlockingState message={message} onRetry={onRetry} state={state} />;
  }

  const showAdvisory = state === "stale" || state === "partial-failure";

  return (
    <section
      aria-busy={busy || undefined}
      aria-label={caption}
      className={styles.responsiveRoot ?? ""}
      data-leaderboard-state={state}
    >
      <div className={styles.metaBar ?? ""}>
        <span>{updatedLabel}</span>
        <span>{entries.length} ranked players</span>
      </div>

      {showAdvisory ? (
        <div
          className={joinClassNames(
            styles.advisory,
            state === "stale" ? styles.advisoryStale : styles.advisoryPartial,
          )}
          role="status"
        >
          {message}
        </div>
      ) : null}

      <div className={styles.desktopPresentation ?? ""}>
        <LeaderboardTable
          caption={caption}
          entries={entries}
          {...(sort ? { sort } : {})}
          {...(onSortChange ? { onSortChange } : {})}
          {...(pinnedEntry ? { pinnedEntry } : {})}
        />
      </div>

      <div className={styles.mobilePresentation ?? ""}>
        <LeaderboardMobileList
          entries={entries}
          label={caption}
          {...(pinnedEntry ? { pinnedEntry } : {})}
        />
      </div>
    </section>
  );
}
