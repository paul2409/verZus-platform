"use client";

// VERZUS M7.6 VERSION-CHECKED RESULT OPERATIONS PANEL

import { useEffect, useRef, useState } from "react";

import {
  clearWorkflowResume,
  readWorkflowResume,
  saveWorkflowResume,
} from "@/shared/composition/workflow-resume";

import { MatchOperationsApiClientError } from "../api/match-operations-api.adapter";
import { useMatchResultMutation } from "../api/match-result.mutations";
import type { MatchResultViewModel } from "../model/match-resource.types";
import type { MatchResultAction } from "../model/match-result-operations.types";
import type { MatchOperationState } from "../model/match-operations.types";
import { matchResultResumePayloadSchema } from "../resume";
import styles from "./MatchOperationsScreen.module.css";

export type ResultOperationsPanelProps = {
  matchId: string;
  seedState: MatchOperationState;
  currentState: MatchOperationState;
  matchVersion: number;
  value: MatchResultViewModel;
};

function idempotencyKey(action: MatchResultAction) {
  return `${action}-${crypto.randomUUID()}`;
}

export function ResultOperationsPanel({
  matchId,
  seedState,
  currentState,
  matchVersion,
  value,
}: ResultOperationsPanelProps) {
  const mutation = useMatchResultMutation();
  const clickLock = useRef(false);
  const keys = useRef<Partial<Record<MatchResultAction, string>>>({});
  const [homeScore, setHomeScore] = useState(value.score?.home ?? 0);
  const [awayScore, setAwayScore] = useState(value.score?.away ?? 0);
  const [note, setNote] = useState("");
  const [confirmationHome, setConfirmationHome] = useState(value.score?.home ?? 0);
  const [confirmationAway, setConfirmationAway] = useState(value.score?.away ?? 0);
  const [resumeReady, setResumeReady] = useState(false);
  const [draftEdited, setDraftEdited] = useState(false);

  useEffect(() => {
    let active = true;
    if (currentState !== "submit-result" || !value.canSubmit) {
      setResumeReady(true);
      void clearWorkflowResume("match_result", matchId).catch(() => undefined);
      return () => {
        active = false;
      };
    }

    void readWorkflowResume("match_result", matchId, matchResultResumePayloadSchema)
      .then((checkpoint) => {
        if (!active || !checkpoint) return;
        setHomeScore(checkpoint.payload.homeScore);
        setAwayScore(checkpoint.payload.awayScore);
        setNote(checkpoint.payload.note);
        setDraftEdited(true);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setResumeReady(true);
      });

    return () => {
      active = false;
    };
  }, [currentState, matchId, value.canSubmit]);

  useEffect(() => {
    if (!resumeReady || !draftEdited || currentState !== "submit-result" || !value.canSubmit)
      return;
    const timeout = window.setTimeout(() => {
      void saveWorkflowResume(
        "match_result",
        matchId,
        { currentStep: "score", payload: { homeScore, awayScore, note } },
        matchResultResumePayloadSchema,
      ).catch(() => undefined);
    }, 450);
    return () => window.clearTimeout(timeout);
  }, [
    awayScore,
    currentState,
    draftEdited,
    homeScore,
    matchId,
    note,
    resumeReady,
    value.canSubmit,
  ]);

  useEffect(() => {
    if (!mutation.data) return;
    if (
      mutation.data.outcome === "result_submitted" ||
      mutation.data.outcome === "already_applied"
    ) {
      setDraftEdited(false);
      void clearWorkflowResume("match_result", matchId).catch(() => undefined);
    }
  }, [matchId, mutation.data]);

  if (!value.visible) return null;

  const error = mutation.error instanceof MatchOperationsApiClientError ? mutation.error : null;

  function submit(action: MatchResultAction) {
    if (clickLock.current || mutation.isPending) return;
    clickLock.current = true;
    keys.current[action] ??= idempotencyKey(action);
    mutation.mutate(
      {
        matchId,
        seedState,
        expectedState: currentState,
        expectedVersion: matchVersion,
        idempotencyKey: keys.current[action] ?? idempotencyKey(action),
        action,
        score:
          action === "submit_result"
            ? { home: homeScore, away: awayScore }
            : { home: confirmationHome, away: confirmationAway },
        ...(action === "submit_result" && note.trim() ? { note: note.trim() } : {}),
      },
      {
        onSuccess: () => {
          delete keys.current[action];
        },
        onError: (mutationError) => {
          if (mutationError instanceof MatchOperationsApiClientError && !mutationError.retryable) {
            delete keys.current[action];
          }
        },
        onSettled: () => {
          clickLock.current = false;
        },
      },
    );
  }

  return (
    <section className={styles.commandPanel} data-result-operations="m7.6" id="result-control">
      <p className={styles.commandKicker}>RESULT CONTROL</p>
      <h2>{value.title}</h2>
      <p>{value.description}</p>

      {value.score ? (
        <div className={styles.resultScoreSummary} aria-label="Submitted score">
          <strong>{value.score.home}</strong>
          <span>-</span>
          <strong>{value.score.away}</strong>
        </div>
      ) : null}

      {value.confirmationStatus === "conflict" ? (
        <p className={styles.resultConflict} role="alert">
          Score conflict detected. The submitted score remains unchanged. Open an auditable dispute
          below.
        </p>
      ) : null}

      {currentState === "submit-result" && value.canSubmit ? (
        <div className={styles.resultForm}>
          <div className={styles.scoreInputGrid}>
            <label>
              Rebels United score
              <input
                max={99}
                min={0}
                onChange={(event) => {
                  setHomeScore(Number(event.target.value));
                  setDraftEdited(true);
                }}
                type="number"
                value={homeScore}
              />
            </label>
            <label>
              Apex Predators score
              <input
                max={99}
                min={0}
                onChange={(event) => {
                  setAwayScore(Number(event.target.value));
                  setDraftEdited(true);
                }}
                type="number"
                value={awayScore}
              />
            </label>
          </div>
          <label>
            Result note
            <textarea
              maxLength={500}
              onChange={(event) => {
                setNote(event.target.value);
                setDraftEdited(true);
              }}
              placeholder="Optional context for the opponent and operations team"
              rows={3}
              value={note}
            />
          </label>
          {draftEdited ? (
            <p className={styles.resultStatus} role="status">
              Result draft saves automatically and can be resumed from Play.
            </p>
          ) : null}
          <button
            disabled={mutation.isPending}
            onClick={() => submit("submit_result")}
            type="button"
          >
            {mutation.isPending ? "Submitting..." : "Submit result"}
          </button>
        </div>
      ) : null}

      {currentState === "awaiting-opponent-confirmation" && value.canConfirm ? (
        <div className={styles.resultForm}>
          <p>Opponent confirmation must match the submitted score exactly.</p>
          <div className={styles.scoreInputGrid}>
            <label>
              Confirm Rebels score
              <input
                max={99}
                min={0}
                onChange={(event) => setConfirmationHome(Number(event.target.value))}
                type="number"
                value={confirmationHome}
              />
            </label>
            <label>
              Confirm Apex score
              <input
                max={99}
                min={0}
                onChange={(event) => setConfirmationAway(Number(event.target.value))}
                type="number"
                value={confirmationAway}
              />
            </label>
          </div>
          <button
            disabled={mutation.isPending}
            onClick={() => submit("confirm_result")}
            type="button"
          >
            {mutation.isPending ? "Confirming..." : "Confirm result"}
          </button>
        </div>
      ) : null}

      {value.confirmationStatus === "awaiting_opponent" ? (
        <p className={styles.resultStatus} role="status">
          Submission {value.submissionId ?? "pending"} is waiting for opponent confirmation.
        </p>
      ) : null}
      {value.confirmationStatus === "confirmed" ? (
        <p className={styles.resultSuccess} role="status">
          Result confirmed and persisted{value.confirmedAt ? ` at ${value.confirmedAt}` : ""}.
        </p>
      ) : null}
      {value.resultNote ? <p className={styles.resultNote}>{value.resultNote}</p> : null}
      {value.xpEarned ? <strong className={styles.xpEarned}>+{value.xpEarned} XP</strong> : null}

      {mutation.data ? (
        <p className={styles.resultSuccess} role="status">
          {mutation.data.outcome === "result_submitted"
            ? "Result submitted. Refresh persistence is active."
            : mutation.data.outcome === "result_confirmed"
              ? "Result confirmed."
              : mutation.data.outcome === "result_conflict_detected"
                ? "Conflict recorded without overwriting the submitted score."
                : "This result operation was already applied."}
        </p>
      ) : null}
      {error ? (
        <p className={styles.resultError} role="alert">
          {error.message} · Error ID {error.requestId}
        </p>
      ) : null}
    </section>
  );
}
