"use client";

// VERZUS M7.7 TERMINAL OPERATIONS PANEL

import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";

import { MatchOperationsApiClientError } from "../api/match-operations-api.adapter";
import {
  matchTerminalQueryOptions,
  useMatchTerminalMutation,
} from "../api/match-terminal.mutation";
import { canTransitionMatchState } from "../model/match-lifecycle.machine";
import type { MatchOperationState } from "../model/match-operations.types";
import type {
  MatchTerminalAction,
  MatchTerminalRole,
  TerminalMatchState,
} from "../model/match-terminal-operations.types";
import styles from "./MatchOperationsScreen.module.css";

export type TerminalOperationsPanelProps = {
  matchId: string;
  seedState: MatchOperationState;
  currentState: MatchOperationState;
  matchVersion: number;
  viewerRole: MatchTerminalRole;
};

const targetState: Record<MatchTerminalAction, TerminalMatchState> = {
  forfeit_match: "forfeit",
  cancel_match: "cancelled",
  complete_match: "completed",
};

function label(action: MatchTerminalAction): string {
  switch (action) {
    case "forfeit_match":
      return "Forfeit match";
    case "cancel_match":
      return "Cancel match";
    case "complete_match":
      return "Complete match";
  }
}

export function TerminalOperationsPanel({
  matchId,
  seedState,
  currentState,
  matchVersion,
  viewerRole,
}: TerminalOperationsPanelProps) {
  const query = useQuery(matchTerminalQueryOptions(matchId, seedState, viewerRole));
  const mutation = useMatchTerminalMutation();
  const clickLock = useRef(false);
  const key = useRef<string | null>(null);
  const [pendingAction, setPendingAction] = useState<MatchTerminalAction | null>(null);
  const [reason, setReason] = useState("");
  const snapshot = query.data;
  const state = snapshot?.state ?? currentState;
  const version = snapshot?.matchVersion ?? matchVersion;
  const terminal = state === "forfeit" || state === "cancelled" || state === "completed";

  const actions: MatchTerminalAction[] = [];
  if (viewerRole === "current_user" && canTransitionMatchState(state, "forfeit")) {
    actions.push("forfeit_match");
  }
  if (
    ["support", "admin", "system"].includes(viewerRole) &&
    canTransitionMatchState(state, "cancelled")
  ) {
    actions.push("cancel_match");
  }
  if (["admin", "system"].includes(viewerRole) && canTransitionMatchState(state, "completed")) {
    actions.push("complete_match");
  }

  function confirm() {
    if (!pendingAction || reason.trim().length < 8 || clickLock.current || mutation.isPending)
      return;
    clickLock.current = true;
    key.current ??= `${pendingAction}-${crypto.randomUUID()}`;
    mutation.mutate(
      {
        matchId,
        seedState,
        expectedState: state,
        expectedVersion: version,
        idempotencyKey: key.current,
        action: pendingAction,
        role: viewerRole,
        reason: reason.trim(),
      },
      {
        onSuccess: () => {
          key.current = null;
          setPendingAction(null);
          setReason("");
        },
        onError: (error) => {
          if (error instanceof MatchOperationsApiClientError && !error.retryable)
            key.current = null;
        },
        onSettled: () => {
          clickLock.current = false;
        },
      },
    );
  }

  const error = mutation.error instanceof MatchOperationsApiClientError ? mutation.error : null;

  return (
    <section className={styles.terminalPanel} data-terminal-operations="m7.7">
      <p className={styles.commandKicker}>TERMINAL CONTROL</p>
      <h2>{terminal ? `Match ${state}` : "End-of-match controls"}</h2>
      {terminal ? (
        <div className={styles.terminalSummary} data-terminal-state={state}>
          <strong>{state.replaceAll("-", " ")}</strong>
          <p>{snapshot?.terminalReason ?? "The server has finalized this terminal state."}</p>
          <span>
            Version {version}
            {snapshot?.auditEventId ? ` · Audit ${snapshot.auditEventId}` : ""}
          </span>
        </div>
      ) : (
        <>
          <p>
            Destructive transitions require explicit confirmation, current server state and role
            authorization.
          </p>
          <div className={styles.terminalActionRow}>
            {actions.map((action) => (
              <button key={action} onClick={() => setPendingAction(action)} type="button">
                {label(action)}
              </button>
            ))}
            {actions.length === 0 ? (
              <span>No terminal action is available for this role and state.</span>
            ) : null}
          </div>
        </>
      )}

      {pendingAction ? (
        <div
          className={styles.terminalConfirmation}
          role="group"
          aria-label={`${label(pendingAction)} confirmation`}
        >
          <strong>Confirm {label(pendingAction).toLowerCase()}</strong>
          <p>This transition targets the server state: {targetState[pendingAction]}.</p>
          <label>
            Required reason
            <textarea
              maxLength={500}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Provide an auditable reason"
              rows={3}
              value={reason}
            />
          </label>
          <div>
            <button
              disabled={reason.trim().length < 8 || mutation.isPending}
              onClick={confirm}
              type="button"
            >
              {mutation.isPending ? "Applying..." : `Confirm ${label(pendingAction).toLowerCase()}`}
            </button>
            <button onClick={() => setPendingAction(null)} type="button">
              Keep match active
            </button>
          </div>
        </div>
      ) : null}

      {query.isError ? (
        <p className={styles.resultError}>Terminal state is temporarily unavailable.</p>
      ) : null}
      {mutation.data ? (
        <p className={styles.resultSuccess} role="status">
          {mutation.data.outcome.replaceAll("_", " ")} · Audit {mutation.data.event.auditEventId}
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
