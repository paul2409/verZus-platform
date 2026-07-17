// VERZUS M8.6 LEADERBOARD RELIABILITY UI

import type {
  LeaderboardReliabilityResourceName,
  LeaderboardReliabilityView,
  LeaderboardResourceHealth,
} from "../model/leaderboard-reliability.types";
import styles from "../../foundation/ui/LeaderboardFoundationScreen.module.css";

const resourceLabels: Record<LeaderboardReliabilityResourceName, string> = {
  composition: "mode composition",
  summary: "leaderboard summary",
  entries: "ranking entries",
  "current-position": "current position",
  rewards: "placement rewards",
  status: "freshness status",
};

const overallCopy: Record<
  Exclude<LeaderboardReliabilityView["overall"], "ready" | "empty">,
  { title: string; body: string }
> = {
  loading: {
    title: "Loading verified rankings",
    body: "Independent leaderboard resources are resolving without collapsing the page shell.",
  },
  stale: {
    title: "Showing a validated cached snapshot",
    body: "A refresh is delayed or failed. Existing rankings remain visible with stale status.",
  },
  degraded: {
    title: "Leaderboard loaded with isolated data",
    body: "Malformed rows were omitted while valid ranking entries remained available.",
  },
  "partial-failure": {
    title: "Some leaderboard resources are unavailable",
    body: "Available sections remain usable. Failed resources can be retried independently.",
  },
  error: {
    title: "Leaderboard temporarily unavailable",
    body: "The ranking service returned a controlled error. Navigation and other platform features remain available.",
  },
  offline: {
    title: "You are offline",
    body: "Cached rankings remain visible where available. Live revisions resume after reconnection.",
  },
  unauthorized: {
    title: "Leaderboard access requires authentication",
    body: "No protected ranking data is shown until the server authorizes this request.",
  },
};

export function LeaderboardReliabilityBanner({
  onRetry,
  view,
}: {
  onRetry?: (() => void) | undefined;
  view?: LeaderboardReliabilityView | undefined;
}) {
  if (!view || view.overall === "ready" || view.overall === "empty") return null;
  const copy = overallCopy[view.overall];
  const isAlert = ["error", "offline", "unauthorized", "partial-failure"].includes(view.overall);

  return (
    <section
      className={styles.reliabilityBanner}
      data-reliability-state={view.overall}
      role={isAlert ? "alert" : "status"}
    >
      <div>
        <strong>{copy.title}</strong>
        <span>{copy.body}</span>
        {view.isolatedRowCount > 0 ? (
          <small>
            {view.isolatedRowCount} malformed row{view.isolatedRowCount === 1 ? "" : "s"} isolated
            {view.isolatedRowIds.length > 0 ? ` · ${view.isolatedRowIds.join(", ")}` : ""}
          </small>
        ) : null}
      </div>
      {view.retryable && onRetry ? (
        <button onClick={onRetry} type="button">
          Retry unavailable resources
        </button>
      ) : null}
    </section>
  );
}

function stateTitle(health: LeaderboardResourceHealth): string {
  switch (health.state) {
    case "loading":
      return `Loading ${resourceLabels[health.resource]}`;
    case "offline":
      return `${resourceLabels[health.resource]} unavailable offline`;
    case "unauthorized":
      return `Not authorized to view ${resourceLabels[health.resource]}`;
    case "error":
      return `${resourceLabels[health.resource]} unavailable`;
    case "empty":
      return `No ${resourceLabels[health.resource]} available`;
    case "stale":
      return `Cached ${resourceLabels[health.resource]}`;
    case "degraded":
      return `${resourceLabels[health.resource]} partially validated`;
    case "ready":
      return resourceLabels[health.resource];
  }
}

export function LeaderboardResourceStateCard({
  compact = false,
  health,
  onRetry,
}: {
  compact?: boolean;
  health: LeaderboardResourceHealth;
  onRetry?: (() => void) | undefined;
}) {
  const isLoading = health.state === "loading";
  const role = ["error", "offline", "unauthorized"].includes(health.state) ? "alert" : "status";

  return (
    <section
      className={compact ? styles.resourceStateCompact : styles.resourceStateCard}
      data-resource={health.resource}
      data-resource-state={health.state}
      role={role}
    >
      {isLoading ? (
        <div aria-label={stateTitle(health)} className={styles.resourceSkeleton}>
          <span />
          <span />
          <span />
        </div>
      ) : (
        <>
          <strong>{stateTitle(health)}</strong>
          <span>
            {health.message ??
              "This independently loaded section has no data for the selected leaderboard view."}
          </span>
          {health.requestId ? <small>Error ID: {health.requestId}</small> : null}
          {health.retryable && onRetry ? (
            <button onClick={onRetry} type="button">
              Retry section
            </button>
          ) : null}
        </>
      )}
    </section>
  );
}
