// VERZUS M5 STEPS 5.5-5.8
"use client";

import type { CurrentCheckIn, NextMatch } from "../model";
import type { PlayWidgetView } from "../view-model";
import { PlayWidgetStatePanel } from "./PlayWidgetState";
import styles from "./play-command-center.module.css";

function actionLabel(checkIn: CurrentCheckIn, match: NextMatch | null): string {
  if (checkIn.state === "checked_in") {
    return match?.status === "starting_soon" ? "ENTER MATCH" : "CHECKED IN";
  }

  if (checkIn.state === "open") {
    return "CHECK IN NOW";
  }

  return "CHECK-IN UNAVAILABLE";
}

export function CheckInControl({
  view,
  match,
  onRetry,
}: {
  view: PlayWidgetView<CurrentCheckIn>;
  match: NextMatch | null;
  onRetry: () => void;
}) {
  if (!view.data) {
    return (
      <div className={styles.checkInControl}>
        <PlayWidgetStatePanel
          state={view.state}
          errorCode={view.errorCode}
          requestId={view.requestId}
          onRetry={onRetry}
          emptyTitle="NO ACTIVE CHECK-IN"
          emptyDetail="There is no check-in window attached to the current schedule."
        />
      </div>
    );
  }

  const checkIn = view.data;
  const enabled =
    checkIn.canCheckIn || (checkIn.state === "checked_in" && match?.status === "starting_soon");

  return (
    <div className={styles.checkInControl}>
      <div className={styles.checkInStatus}>
        <span>CHECK-IN STATE</span>
        <strong>{checkIn.state.replaceAll("_", " ")}</strong>
      </div>

      <button
        type="button"
        disabled={!enabled}
        title="The server-authoritative check-in mutation is introduced in M5 Step 5.10."
      >
        {actionLabel(checkIn, match)}
      </button>

      <small>Display-only action in Steps 5.5–5.8. Idempotent mutation follows in Step 5.10.</small>
    </div>
  );
}
