// VERZUS M5 STEPS 5.5-5.8
"use client";

import type { PlayWidgetState } from "../contracts";
import styles from "./play-command-center.module.css";

const copyByState: Readonly<
  Record<
    PlayWidgetState,
    {
      title: string;
      detail: string;
      retryable: boolean;
    }
  >
> = {
  loading: {
    title: "LOADING SIGNAL",
    detail: "Synchronising this Play module.",
    retryable: false,
  },
  success: {
    title: "READY",
    detail: "This module is available.",
    retryable: false,
  },
  empty: {
    title: "NOTHING SCHEDULED",
    detail: "There is no current data for this module.",
    retryable: false,
  },
  stale: {
    title: "SHOWING SAVED DATA",
    detail: "A refresh is running in the background.",
    retryable: false,
  },
  error: {
    title: "MODULE UNAVAILABLE",
    detail: "This part of Play failed independently.",
    retryable: true,
  },
  offline: {
    title: "OFFLINE",
    detail: "Reconnect to refresh this module.",
    retryable: true,
  },
  retrying: {
    title: "RETRYING",
    detail: "The module is attempting to reconnect.",
    retryable: false,
  },
  unauthorized: {
    title: "SIGN-IN REQUIRED",
    detail: "Your session cannot access this module.",
    retryable: false,
  },
  forbidden: {
    title: "ACCESS RESTRICTED",
    detail: "Complete the required account steps.",
    retryable: false,
  },
  not_found: {
    title: "RESOURCE NOT FOUND",
    detail: "The requested Play resource no longer exists.",
    retryable: false,
  },
  maintenance: {
    title: "MAINTENANCE",
    detail: "This module is temporarily paused.",
    retryable: true,
  },
  partial_failure: {
    title: "SIGNAL DEGRADED",
    detail: "This module failed while the rest of Play remains active.",
    retryable: true,
  },
};

export function PlayWidgetStatePanel({
  state,
  errorCode,
  requestId,
  onRetry,
  emptyTitle,
  emptyDetail,
}: {
  state: PlayWidgetState;
  errorCode: string | null;
  requestId: string | null;
  onRetry: () => void;
  emptyTitle?: string;
  emptyDetail?: string;
}) {
  const copy = copyByState[state];
  const title = state === "empty" && emptyTitle ? emptyTitle : copy.title;
  const detail = state === "empty" && emptyDetail ? emptyDetail : copy.detail;

  return (
    <div
      className={styles.widgetState}
      data-state={state}
      role={
        state === "error" ||
        state === "offline" ||
        state === "maintenance" ||
        state === "partial_failure"
          ? "alert"
          : "status"
      }
    >
      <span className={styles.stateGlyph}>
        {state === "loading" || state === "retrying" ? "···" : state === "offline" ? "×" : "!"}
      </span>
      <div>
        <strong>{title}</strong>
        <p>{detail}</p>
        {errorCode ? (
          <small>
            {errorCode}
            {requestId ? ` · ${requestId}` : ""}
          </small>
        ) : null}
      </div>
      {copy.retryable ? (
        <button type="button" onClick={onRetry}>
          RETRY
        </button>
      ) : null}
    </div>
  );
}
