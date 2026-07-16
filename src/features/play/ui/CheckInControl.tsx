// VERZUS STAGE 3 CHECK IN

"use client";

import Link from "next/link";

import type { PlayCheckInAction } from "../actions/use-play-check-in";
import type { CurrentCheckIn, NextMatch } from "../model";
import type { PlayWidgetView } from "../view-model";
import { PlayWidgetStatePanel } from "./PlayWidgetState";
import styles from "./play-command-center.module.css";

function actionLabel(checkIn: CurrentCheckIn, action: PlayCheckInAction): string {
  if (action.state === "pending") {
    return "CHECKING IN...";
  }

  if (checkIn.state === "checked_in") {
    return "CHECKED IN";
  }

  if (checkIn.state === "open") {
    return "CHECK IN NOW";
  }

  return "CHECK-IN UNAVAILABLE";
}

function formatWindow(value: string | null): string {
  if (!value) {
    return "NOT SCHEDULED";
  }

  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

export function CheckInControl({
  view,
  match,
  action,
  onRetry,
}: {
  view: PlayWidgetView<CurrentCheckIn>;
  match: NextMatch | null;
  action: PlayCheckInAction;
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
  const canEnterMatch = checkIn.state === "checked_in" && match?.status === "starting_soon";
  const canSubmit = checkIn.canCheckIn && action.state !== "pending";

  return (
    <div className={styles.checkInControl} aria-live="polite">
      <div className={styles.checkInStatus} data-state={checkIn.state}>
        <span>CHECK-IN STATE</span>
        <strong>{checkIn.state.replaceAll("_", " ")}</strong>
        <small>
          {formatWindow(checkIn.opensAt)}–{formatWindow(checkIn.closesAt)}
        </small>
      </div>

      {canEnterMatch && match ? (
        <Link className={styles.checkInActionLink} href={`/matches/${match.matchId}`}>
          ENTER MATCH
        </Link>
      ) : (
        <button
          type="button"
          disabled={!canSubmit}
          aria-busy={action.state === "pending"}
          onClick={() => action.checkIn(checkIn)}
        >
          {actionLabel(checkIn, action)}
        </button>
      )}

      {action.state === "error" ? (
        <div className={styles.checkInFeedback} data-state="error" role="alert">
          <strong>CHECK-IN FAILED</strong>
          <span>
            {action.errorCode ?? "unknown_error"}
            {action.requestId ? ` · ${action.requestId}` : ""}
          </span>
          <button type="button" onClick={action.reset}>
            DISMISS
          </button>
        </div>
      ) : null}

      {action.state === "success" || checkIn.state === "checked_in" ? (
        <small className={styles.checkInSuccess}>
          Check-in confirmed by the server. Your match place is protected.
        </small>
      ) : (
        <small>Check-in is server-authoritative and protected from duplicate clicks.</small>
      )}
    </div>
  );
}
