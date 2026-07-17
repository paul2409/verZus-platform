// VERZUS M7.7 OFFLINE AND STALE CACHED-SNAPSHOT STATES

import Link from "next/link";

import type { MatchAvailabilityState } from "../model/match-terminal-operations.types";
import type { MatchOperationsViewModel } from "../model/match-operations.types";
import { MatchOperationsScreen } from "./MatchOperationsScreen";
import styles from "./MatchOperationsScreen.module.css";

export function MatchAvailabilityStateScreen({
  availability,
  initialMatch,
}: {
  availability: Exclude<MatchAvailabilityState, "normal">;
  initialMatch: MatchOperationsViewModel;
}) {
  const offline = availability === "offline";
  return (
    <div className={styles.availabilityShell} data-availability={availability} data-m7-stage="7.7">
      <section className={styles.availabilityBanner} role="status">
        <strong>{offline ? "You are offline" : "Showing cached match data"}</strong>
        <p>
          {offline
            ? "The last confirmed snapshot remains visible. Mutations are disabled until connectivity returns."
            : "This snapshot may be behind the server. Refresh before any state-changing action."}
        </p>
        <Link href={`/matches/${encodeURIComponent(initialMatch.id)}?state=${initialMatch.state}`}>
          Retry live state
        </Link>
      </section>
      <div aria-disabled="true" className={styles.cachedSnapshot}>
        <MatchOperationsScreen
          clock={initialMatch.clock}
          matchId={initialMatch.id}
          state={initialMatch.state}
        />
      </div>
    </div>
  );
}
