"use client";

// VERZUS M7.6 AUDITABLE DISPUTE OPERATIONS PANEL

import { useRef, useState } from "react";

import { MatchOperationsApiClientError } from "../api/match-operations-api.adapter";
import { useMatchDisputeMutation } from "../api/match-result.mutations";
import type { MatchDisputeViewModel } from "../model/match-resource.types";
import type { MatchDisputeReason } from "../model/match-result-operations.types";
import type { MatchOperationState } from "../model/match-operations.types";
import styles from "./MatchOperationsScreen.module.css";

export type DisputeOperationsPanelProps = {
  matchId: string;
  seedState: MatchOperationState;
  currentState: MatchOperationState;
  matchVersion: number;
  value: MatchDisputeViewModel;
};

export function DisputeOperationsPanel({
  matchId,
  seedState,
  currentState,
  matchVersion,
  value,
}: DisputeOperationsPanelProps) {
  const mutation = useMatchDisputeMutation();
  const clickLock = useRef(false);
  const key = useRef<string | null>(null);
  const [reason, setReason] = useState<MatchDisputeReason>("score_mismatch");
  const [summary, setSummary] = useState("");
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);

  if (!value.visible) return null;

  const error = mutation.error instanceof MatchOperationsApiClientError ? mutation.error : null;

  function createDispute() {
    if (clickLock.current || mutation.isPending || summary.trim().length < 8) return;
    clickLock.current = true;
    key.current ??= `dispute-${crypto.randomUUID()}`;
    mutation.mutate(
      {
        matchId,
        seedState,
        expectedState: currentState,
        expectedVersion: matchVersion,
        idempotencyKey: key.current,
        reason,
        summary: summary.trim(),
        claimedScore: { home: homeScore, away: awayScore },
      },
      {
        onSuccess: () => {
          key.current = null;
          setSummary("");
        },
        onError: (mutationError) => {
          if (mutationError instanceof MatchOperationsApiClientError && !mutationError.retryable) {
            key.current = null;
          }
        },
        onSettled: () => {
          clickLock.current = false;
        },
      },
    );
  }

  return (
    <section className={styles.commandPanel} data-dispute-operations="m7.6">
      <p className={styles.commandKicker}>AUDITABLE DISPUTE</p>
      <h2>{value.title}</h2>
      <p>
        {value.resultNote ??
          "Create a dispute only when the result cannot be resolved through confirmation."}
      </p>

      {value.disputeId ? (
        <div className={styles.disputeAuditCard}>
          <span>Dispute ID</span>
          <strong>{value.disputeId}</strong>
          <span>Status</span>
          <strong>{value.statusLabel}</strong>
          <span>Reason</span>
          <strong>{value.reasonCode ?? "Recorded"}</strong>
          <span>Audit events</span>
          <strong>{value.auditEventCount}</strong>
          {value.summary ? <p>{value.summary}</p> : null}
          {value.createdAt ? <time dateTime={value.createdAt}>{value.createdAt}</time> : null}
        </div>
      ) : null}

      {value.canCreate && !value.disputeId ? (
        <div className={styles.disputeForm}>
          <label>
            Dispute reason
            <select
              onChange={(event) => setReason(event.target.value as MatchDisputeReason)}
              value={reason}
            >
              <option value="score_mismatch">Score mismatch</option>
              <option value="opponent_no_show">Opponent no-show</option>
              <option value="rule_violation">Rule violation</option>
              <option value="connection_failure">Connection failure</option>
              <option value="other">Other</option>
            </select>
          </label>
          <div className={styles.scoreInputGrid}>
            <label>
              Claimed Rebels score
              <input
                max={99}
                min={0}
                onChange={(event) => setHomeScore(Number(event.target.value))}
                type="number"
                value={homeScore}
              />
            </label>
            <label>
              Claimed Apex score
              <input
                max={99}
                min={0}
                onChange={(event) => setAwayScore(Number(event.target.value))}
                type="number"
                value={awayScore}
              />
            </label>
          </div>
          <label>
            Dispute details
            <textarea
              maxLength={500}
              onChange={(event) => setSummary(event.target.value)}
              placeholder="Describe the mismatch, rule issue or connection failure"
              rows={4}
              value={summary}
            />
          </label>
          <button
            disabled={summary.trim().length < 8 || mutation.isPending}
            onClick={createDispute}
            type="button"
          >
            {mutation.isPending ? "Opening dispute..." : "Open dispute"}
          </button>
        </div>
      ) : null}

      {mutation.data ? (
        <p className={styles.resultSuccess} role="status">
          {mutation.data.outcome === "dispute_created"
            ? `Dispute created. Audit event ${mutation.data.snapshot.dispute?.auditEventId ?? "recorded"}.`
            : "This dispute was already recorded."}
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
