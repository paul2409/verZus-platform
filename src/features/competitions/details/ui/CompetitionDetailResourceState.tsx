import { Icon } from "@/components/primitives/icon";

import type { CompetitionDetailResourceState } from "../model/competition-detail.types";
import styles from "./CompetitionDetail.module.css";

const copy: Record<CompetitionDetailResourceState, { title: string; body: string }> = {
  loading: { title: "LOADING INTEL", body: "Synchronising this competition resource." },
  success: { title: "READY", body: "Competition resource loaded." },
  empty: { title: "NO DATA", body: "This competition resource has no published data." },
  stale: { title: "STALE INTEL", body: "Showing cached data while VERZUS refreshes." },
  error: { title: "RESOURCE ERROR", body: "This section could not load." },
  offline: { title: "OFFLINE", body: "Reconnect to refresh this section." },
  retrying: { title: "UPDATING", body: "Refreshing this competition resource." },
  unauthorized: { title: "SIGN IN REQUIRED", body: "Authentication is required." },
  forbidden: { title: "ACCESS RESTRICTED", body: "Your account cannot inspect this section." },
  not_found: { title: "NOT FOUND", body: "This competition could not be found." },
  maintenance: { title: "MAINTENANCE", body: "This section is temporarily unavailable." },
  partial_failure: { title: "PARTIAL FAILURE", body: "This section failed independently." },
};

export function CompetitionDetailStateCard({
  state,
  requestId,
  onRetry,
}: {
  state: CompetitionDetailResourceState;
  requestId: string | null;
  onRetry: () => void;
}) {
  const message = copy[state];
  return (
    <div className={styles.resourceState} data-state={state}>
      <Icon
        decorative
        name={state === "loading" || state === "retrying" ? "refresh-cw" : "alert-triangle"}
        size="md"
      />
      <div>
        <h3>{message.title}</h3>
        <p>{message.body}</p>
        {requestId ? <small>REF {requestId}</small> : null}
      </div>
      {state !== "loading" ? (
        <button onClick={onRetry} type="button">
          RETRY
        </button>
      ) : null}
    </div>
  );
}
