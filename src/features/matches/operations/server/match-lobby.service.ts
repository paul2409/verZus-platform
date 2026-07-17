// VERZUS M7.5 SERVER-AUTHORITATIVE LOBBY SERVICE

import {
  assertMatchMutationPrecondition,
  MatchMutationPreconditionError,
} from "../model/match-lifecycle.machine";
import type {
  MatchLobbyCommand,
  MatchLobbyResult,
  MatchLobbyOperationsSnapshot,
} from "../model/match-lobby-operations.types";
import {
  getMatchLobbyOperationsSnapshot,
  getStoredMatchLobbyResult,
  persistMatchLobbyResult,
  rememberMatchLobbyNoOp,
} from "./match-lobby.store";

export class MatchLobbyServiceError extends Error {
  readonly code: string;
  readonly status: number;
  readonly retryable: boolean;
  readonly fieldErrors: Record<string, string[]> | undefined;

  constructor(input: {
    code: string;
    message: string;
    status: number;
    retryable: boolean;
    fieldErrors?: Record<string, string[]>;
  }) {
    super(input.message);
    this.name = "MatchLobbyServiceError";
    this.code = input.code;
    this.status = input.status;
    this.retryable = input.retryable;
    this.fieldErrors = input.fieldErrors;
  }
}

function stale(code: "MATCH_STALE_STATE" | "MATCH_STALE_VERSION", message: string) {
  return new MatchLobbyServiceError({
    code,
    message,
    status: 409,
    retryable: true,
  });
}

function assertExpected(snapshot: MatchLobbyOperationsSnapshot, command: MatchLobbyCommand): void {
  if (snapshot.matchVersion !== command.expectedVersion) {
    throw stale(
      "MATCH_STALE_VERSION",
      "The match changed before the lobby action was applied. Refresh and retry.",
    );
  }
  if (snapshot.state !== command.expectedState) {
    throw stale(
      "MATCH_STALE_STATE",
      "The match is no longer in the state required for this lobby action.",
    );
  }
}

function transition(
  snapshot: MatchLobbyOperationsSnapshot,
  command: MatchLobbyCommand,
  nextState: MatchLobbyOperationsSnapshot["state"],
) {
  try {
    return assertMatchMutationPrecondition(
      { state: snapshot.state, matchVersion: snapshot.matchVersion },
      {
        expectedState: command.expectedState,
        expectedVersion: command.expectedVersion,
        nextState,
      },
    );
  } catch (error) {
    if (error instanceof MatchMutationPreconditionError) {
      throw new MatchLobbyServiceError({
        code: error.code,
        message: error.message,
        status: 409,
        retryable: error.retryable,
      });
    }
    throw error;
  }
}

export function executeMatchLobbyOperation(
  command: MatchLobbyCommand,
  now: Date = new Date(),
): MatchLobbyResult {
  const replay = getStoredMatchLobbyResult(
    command.matchId,
    command.seedState,
    command.idempotencyKey,
    now,
  );
  if (replay) return replay;

  const snapshot = getMatchLobbyOperationsSnapshot(command.matchId, command.seedState, now);

  if (
    (command.action === "enter_lobby" &&
      (snapshot.currentUser.entered ||
        snapshot.state === "lobby-open" ||
        snapshot.state === "in-progress")) ||
    (command.action === "confirm_ready" && snapshot.currentUser.ready) ||
    (command.action === "start_match" && snapshot.state === "in-progress")
  ) {
    return rememberMatchLobbyNoOp(
      command.matchId,
      command.seedState,
      command.idempotencyKey,
      command.action,
      now,
    );
  }

  assertExpected(snapshot, command);

  if (command.action === "enter_lobby") {
    if (snapshot.state !== "both-ready") {
      throw new MatchLobbyServiceError({
        code: "MATCH_LOBBY_UNAVAILABLE",
        message: "The lobby is not available for this match state.",
        status: 409,
        retryable: false,
      });
    }
    const serverNow = now.getTime();
    if (
      serverNow < Date.parse(snapshot.clock.lobbyOpensAt) ||
      serverNow >= Date.parse(snapshot.clock.matchStartsAt)
    ) {
      throw new MatchLobbyServiceError({
        code: "MATCH_LOBBY_WINDOW_CLOSED",
        message: "The server-controlled lobby entry window is not open.",
        status: 409,
        retryable: false,
      });
    }
    const next = transition(snapshot, command, "lobby-open");
    return persistMatchLobbyResult(command.matchId, command.seedState, {
      idempotencyKey: command.idempotencyKey,
      action: command.action,
      outcome: "lobby_entered",
      nextState: next.state,
      nextVersion: next.matchVersion,
      currentEntered: true,
      now,
    });
  }

  if (command.action === "confirm_ready") {
    if (snapshot.state !== "lobby-open" || !snapshot.currentUser.entered) {
      throw new MatchLobbyServiceError({
        code: "MATCH_LOBBY_READY_UNAVAILABLE",
        message: "Enter the open lobby before confirming readiness.",
        status: 409,
        retryable: false,
      });
    }
    return persistMatchLobbyResult(command.matchId, command.seedState, {
      idempotencyKey: command.idempotencyKey,
      action: command.action,
      outcome: "ready_confirmed",
      nextState: snapshot.state,
      nextVersion: snapshot.matchVersion + 1,
      currentReady: true,
      now,
    });
  }

  if (command.action === "start_match") {
    if (snapshot.state !== "lobby-open") {
      throw new MatchLobbyServiceError({
        code: "MATCH_START_UNAVAILABLE",
        message: "The match can only start from an open lobby.",
        status: 409,
        retryable: false,
      });
    }
    if (
      !snapshot.currentUser.entered ||
      !snapshot.currentUser.ready ||
      !snapshot.opponent.entered ||
      !snapshot.opponent.ready
    ) {
      throw new MatchLobbyServiceError({
        code: "MATCH_PARTICIPANTS_NOT_READY",
        message: "Both participants must be in the lobby and ready before match start.",
        status: 409,
        retryable: true,
      });
    }
    if (now.getTime() < Date.parse(snapshot.clock.matchStartsAt)) {
      throw new MatchLobbyServiceError({
        code: "MATCH_START_TOO_EARLY",
        message: "Server time has not reached the scheduled match start.",
        status: 409,
        retryable: true,
      });
    }
    const next = transition(snapshot, command, "in-progress");
    return persistMatchLobbyResult(command.matchId, command.seedState, {
      idempotencyKey: command.idempotencyKey,
      action: command.action,
      outcome: "match_started",
      nextState: next.state,
      nextVersion: next.matchVersion,
      now,
    });
  }

  if (snapshot.state !== "lobby-open" && snapshot.state !== "in-progress") {
    throw new MatchLobbyServiceError({
      code: "MATCH_ISSUE_REPORT_UNAVAILABLE",
      message: "Operational issues can only be reported while the lobby or match is active.",
      status: 409,
      retryable: false,
    });
  }
  if (!command.issue) {
    throw new MatchLobbyServiceError({
      code: "VALIDATION_ERROR",
      message: "Issue category and summary are required.",
      status: 400,
      retryable: false,
      fieldErrors: { issue: ["Provide issue details."] },
    });
  }

  return persistMatchLobbyResult(command.matchId, command.seedState, {
    idempotencyKey: command.idempotencyKey,
    action: command.action,
    outcome: "issue_reported",
    nextState: snapshot.state,
    nextVersion: snapshot.matchVersion,
    issue: command.issue,
    now,
  });
}
