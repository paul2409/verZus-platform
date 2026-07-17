"use client";

// VERZUS M7.4 IDEMPOTENT CHECK-IN CONTROL

import { useRef } from "react";

import { MatchOperationsApiClientError } from "../api/match-operations-api.adapter";
import { useMatchCheckInMutation } from "../api/match-check-in.mutation";
import type { MatchCheckInViewModel } from "../model/match-resource.types";
import type { MatchClockSnapshot, MatchOperationState } from "../model/match-operations.types";
import styles from "./MatchOperationsScreen.module.css";
import { ServerCountdown } from "./ServerCountdown";

export type CheckInMutationPanelProps = {
  matchId: string;
  seedState: MatchOperationState;
  currentState: MatchOperationState;
  matchVersion: number;
  currentUserCheckedIn: boolean;
  opponentCheckedIn: boolean;
  value: MatchCheckInViewModel;
  clock: MatchClockSnapshot;
};

export function CheckInMutationPanel({
  matchId,
  seedState,
  currentState,
  matchVersion,
  currentUserCheckedIn,
  opponentCheckedIn,
  value,
  clock,
}: CheckInMutationPanelProps) {
  const mutation = useMatchCheckInMutation();
  const clickLock = useRef(false);
  const idempotencyKey = useRef<string | null>(null);

  if (!value.visible) return null;

  const canCheckIn =
    currentState === "check-in-open" &&
    !currentUserCheckedIn &&
    !mutation.isPending &&
    value.primaryAction?.disabled !== true;

  const error = mutation.error instanceof MatchOperationsApiClientError ? mutation.error : null;

  function submit() {
    if (!canCheckIn || clickLock.current) return;
    clickLock.current = true;
    idempotencyKey.current ??= crypto.randomUUID();

    mutation.mutate(
      {
        matchId,
        seedState,
        expectedState: currentState,
        expectedVersion: matchVersion,
        idempotencyKey: idempotencyKey.current,
      },
      {
        onSuccess: () => {
          idempotencyKey.current = null;
        },
        onError: (mutationError) => {
          if (mutationError instanceof MatchOperationsApiClientError && !mutationError.retryable) {
            idempotencyKey.current = null;
          }
        },
        onSettled: () => {
          clickLock.current = false;
        },
      },
    );
  }

  const readinessMessage = currentUserCheckedIn
    ? opponentCheckedIn
      ? "Both players are checked in. The server has moved this match to ready."
      : "Your check-in is persisted. Waiting for the opponent."
    : opponentCheckedIn
      ? "Opponent is already checked in. Your check-in will move both players to ready."
      : "Neither side is ready yet. Check in before the server deadline.";

  return (
    <section className={styles.commandPanel} data-check-in-mutation="m7.4">
      <p className={styles.commandKicker}>SERVER-AUTHORITATIVE CHECK-IN</p>
      <h2>{value.title}</h2>
      <p>{value.description}</p>
      <ServerCountdown
        caption={value.timerCaption}
        clock={clock}
        fallbackLabel={value.timerLabel}
      />

      <p className={styles.checkInReadiness} aria-live="polite">
        {readinessMessage}
      </p>

      {mutation.data ? (
        <p className={styles.checkInSuccess} role="status">
          {mutation.data.outcome === "both_ready"
            ? "Check-in confirmed. Both players are ready."
            : mutation.data.outcome === "already_checked_in"
              ? "Check-in was already confirmed. No duplicate event was created."
              : "Check-in confirmed and saved."}
        </p>
      ) : null}

      {error ? (
        <p className={styles.checkInError} role="alert">
          {error.message} · Error ID {error.requestId}
        </p>
      ) : null}

      <div className={styles.actions}>
        <button disabled={!canCheckIn} onClick={submit} type="button">
          {mutation.isPending ? "Checking in..." : "Check in"}
        </button>
        {value.secondaryAction ? (
          <button disabled={value.secondaryAction.disabled} type="button">
            {value.secondaryAction.label}
          </button>
        ) : null}
      </div>
    </section>
  );
}
