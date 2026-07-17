"use client";

// VERZUS M7.5 LOBBY AND IN-PROGRESS OPERATIONS PANEL

import { useRef, useState } from "react";

import { MatchOperationsApiClientError } from "../api/match-operations-api.adapter";
import { useMatchLobbyMutation } from "../api/match-lobby.mutation";
import type {
  MatchLobbyAction,
  MatchLobbyIssueCategory,
} from "../model/match-lobby-operations.types";
import type { MatchLobbyViewModel } from "../model/match-resource.types";
import type { MatchClockSnapshot, MatchOperationState } from "../model/match-operations.types";
import styles from "./MatchOperationsScreen.module.css";
import { ServerCountdown } from "./ServerCountdown";

export type LobbyOperationsPanelProps = {
  matchId: string;
  seedState: MatchOperationState;
  currentState: MatchOperationState;
  matchVersion: number;
  value: MatchLobbyViewModel;
  clock: MatchClockSnapshot;
};

function createIdempotencyKey(action: MatchLobbyAction): string {
  return `${action}-${crypto.randomUUID()}`;
}

export function LobbyOperationsPanel({
  matchId,
  seedState,
  currentState,
  matchVersion,
  value,
  clock,
}: LobbyOperationsPanelProps) {
  const mutation = useMatchLobbyMutation();
  const clickLock = useRef(false);
  const idempotencyKeys = useRef<Partial<Record<MatchLobbyAction, string>>>({});
  const [issueOpen, setIssueOpen] = useState(false);
  const [issueCategory, setIssueCategory] = useState<MatchLobbyIssueCategory>("connection");
  const [issueSummary, setIssueSummary] = useState("");

  if (!value.visible) return null;

  const error = mutation.error instanceof MatchOperationsApiClientError ? mutation.error : null;

  function submit(action: MatchLobbyAction) {
    if (clickLock.current || mutation.isPending) return;
    if (action === "report_issue" && issueSummary.trim().length < 3) return;

    clickLock.current = true;
    idempotencyKeys.current[action] ??= createIdempotencyKey(action);

    mutation.mutate(
      {
        matchId,
        seedState,
        expectedState: currentState,
        expectedVersion: matchVersion,
        idempotencyKey: idempotencyKeys.current[action] ?? createIdempotencyKey(action),
        action,
        ...(action === "report_issue"
          ? { issue: { category: issueCategory, summary: issueSummary.trim() } }
          : {}),
      },
      {
        onSuccess: () => {
          delete idempotencyKeys.current[action];
          if (action === "report_issue") {
            setIssueSummary("");
            setIssueOpen(false);
          }
        },
        onError: (mutationError) => {
          if (mutationError instanceof MatchOperationsApiClientError && !mutationError.retryable) {
            delete idempotencyKeys.current[action];
          }
        },
        onSettled: () => {
          clickLock.current = false;
        },
      },
    );
  }

  const readiness = value.currentUserReady
    ? value.opponentReady
      ? "Both players are lobby-ready. Match start remains controlled by server time."
      : "You are ready. Waiting for the opponent to confirm lobby readiness."
    : value.currentUserEntered
      ? "You are in the lobby. Confirm readiness after verifying the connection details."
      : value.connectionStatus === "available"
        ? "The lobby is open. Enter using the server-issued connection details."
        : "Lobby access is waiting for the server-controlled opening time.";

  return (
    <section className={styles.commandPanel} data-lobby-operations="m7.5">
      <p className={styles.commandKicker}>
        {currentState === "in-progress" ? "LIVE MATCH OPERATIONS" : "LOBBY OPERATIONS"}
      </p>
      <h2>{value.title}</h2>
      <p>{value.description}</p>

      <div className={styles.lobbyConnectionGrid}>
        <div>
          <span>Lobby code</span>
          <strong>{value.lobbyCode}</strong>
        </div>
        <div>
          <span>Platform</span>
          <strong>{value.platform}</strong>
        </div>
        <div>
          <span>Region</span>
          <strong>{value.serverRegion}</strong>
        </div>
        <div>
          <span>Join method</span>
          <strong>{value.joinInstructions}</strong>
        </div>
      </div>

      <ServerCountdown
        caption={value.timerCaption}
        clock={clock}
        fallbackLabel={value.timerLabel}
      />

      <div className={styles.lobbyReadiness} aria-live="polite">
        <p>{readiness}</p>
        <div>
          <span data-ready={value.currentUserReady}>You</span>
          <span data-ready={value.opponentReady}>Opponent</span>
        </div>
      </div>

      {mutation.data ? (
        <p className={styles.lobbySuccess} role="status">
          {mutation.data.outcome === "lobby_entered"
            ? "Lobby entry persisted."
            : mutation.data.outcome === "ready_confirmed"
              ? "Lobby readiness persisted."
              : mutation.data.outcome === "match_started"
                ? "Match started. Live operations are active."
                : mutation.data.outcome === "issue_reported"
                  ? `Issue recorded for support. Reference ${mutation.data.snapshot.lastIssue?.issueId ?? "pending"}.`
                  : "This operation was already applied. No duplicate event was created."}
        </p>
      ) : null}

      {error ? (
        <p className={styles.lobbyError} role="alert">
          {error.message} · Error ID {error.requestId}
        </p>
      ) : null}

      <div className={styles.actions}>
        {currentState === "both-ready" ? (
          <button
            disabled={!value.canEnter || mutation.isPending}
            onClick={() => submit("enter_lobby")}
            type="button"
          >
            {mutation.isPending ? "Entering..." : "Enter lobby"}
          </button>
        ) : null}

        {currentState === "lobby-open" && !value.currentUserReady ? (
          <button
            disabled={!value.canConfirmReady || mutation.isPending}
            onClick={() => submit("confirm_ready")}
            type="button"
          >
            {mutation.isPending ? "Saving..." : "Confirm ready"}
          </button>
        ) : null}

        {currentState === "lobby-open" && value.currentUserReady ? (
          <button
            disabled={!value.canStartMatch || mutation.isPending}
            onClick={() => submit("start_match")}
            type="button"
          >
            {mutation.isPending ? "Starting..." : "Start match"}
          </button>
        ) : null}

        {value.canReportIssue ? (
          <button
            disabled={mutation.isPending}
            onClick={() => setIssueOpen((open) => !open)}
            type="button"
          >
            {issueOpen ? "Close issue form" : "Report issue"}
          </button>
        ) : null}
      </div>

      {issueOpen ? (
        <div className={styles.lobbyIssueForm}>
          <label>
            Issue category
            <select
              onChange={(event) => setIssueCategory(event.target.value as MatchLobbyIssueCategory)}
              value={issueCategory}
            >
              <option value="connection">Connection</option>
              <option value="opponent">Opponent</option>
              <option value="rules">Rules</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label>
            Summary
            <textarea
              maxLength={240}
              onChange={(event) => setIssueSummary(event.target.value)}
              placeholder="Describe the operational issue"
              rows={3}
              value={issueSummary}
            />
          </label>
          <button
            disabled={issueSummary.trim().length < 3 || mutation.isPending}
            onClick={() => submit("report_issue")}
            type="button"
          >
            Submit issue
          </button>
        </div>
      ) : null}

      <p className={styles.lobbyAuditNote}>
        {value.issueCount} issue{value.issueCount === 1 ? "" : "s"} recorded. Chat and support load
        independently.
      </p>
    </section>
  );
}
