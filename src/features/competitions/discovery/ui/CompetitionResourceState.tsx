import { Icon } from "@/components/primitives/icon";

import type { CompetitionResourceState } from "../model/competition-discovery.types";
import styles from "./CompetitionDiscovery.module.css";

const copy: Record<
  Exclude<CompetitionResourceState, "success" | "stale" | "retrying">,
  { title: string; body: string }
> = {
  loading: { title: "LOADING COMPETITIONS", body: "Syncing the latest competition data." },
  empty: { title: "NOTHING TO SHOW", body: "No competition data is available for this section." },
  error: {
    title: "DATA UNAVAILABLE",
    body: "This section failed without affecting the rest of Compete.",
  },
  offline: { title: "OFFLINE", body: "Reconnect to refresh competition data." },
  unauthorized: {
    title: "SIGN IN REQUIRED",
    body: "Sign in before accessing competition discovery.",
  },
  forbidden: {
    title: "ACCESS RESTRICTED",
    body: "Your account cannot access this competition resource.",
  },
  not_found: { title: "NOT FOUND", body: "The requested competition resource no longer exists." },
  maintenance: {
    title: "MAINTENANCE",
    body: "This competition resource is temporarily unavailable.",
  },
  partial_failure: {
    title: "SECTION UNAVAILABLE",
    body: "Other competition sections remain operational.",
  },
};

export type CompetitionResourceStateProps = {
  state: CompetitionResourceState;
  requestId?: string | null;
  onRetry?: () => void;
  compact?: boolean;
};

export function CompetitionResourceState({
  state,
  requestId,
  onRetry,
  compact = false,
}: CompetitionResourceStateProps) {
  if (state === "success" || state === "stale" || state === "retrying") return null;

  const content = copy[state];
  return (
    <section
      aria-busy={state === "loading"}
      className={styles.resourceState}
      data-compact={compact ? "true" : undefined}
      data-state={state}
    >
      <Icon decorative name={state === "loading" ? "refresh-cw" : "alert-triangle"} size="md" />
      <div>
        <h3>{content.title}</h3>
        <p>{content.body}</p>
        {requestId ? <small>REFERENCE {requestId}</small> : null}
      </div>
      {onRetry && state !== "loading" ? (
        <button onClick={onRetry} type="button">
          RETRY
        </button>
      ) : null}
    </section>
  );
}
