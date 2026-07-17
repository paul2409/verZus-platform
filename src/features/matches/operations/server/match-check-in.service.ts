// VERZUS M7.4 SERVER-AUTHORITATIVE CHECK-IN SERVICE

import {
  assertMatchMutationPrecondition,
  MatchMutationPreconditionError,
} from "../model/match-lifecycle.machine";
import type { MatchCheckInCommand, MatchCheckInResult } from "../model/match-check-in.types";
import {
  getMatchCheckInSnapshot,
  getStoredMatchCheckInResult,
  persistMatchCheckInResult,
  rememberMatchCheckInNoOp,
} from "./match-check-in.store";

export class MatchCheckInServiceError extends Error {
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
    this.name = "MatchCheckInServiceError";
    this.code = input.code;
    this.status = input.status;
    this.retryable = input.retryable;
    this.fieldErrors = input.fieldErrors;
  }
}

function fromPrecondition(error: MatchMutationPreconditionError): MatchCheckInServiceError {
  return new MatchCheckInServiceError({
    code: error.code,
    message: error.message,
    status: 409,
    retryable: error.retryable,
  });
}

export function executeMatchCheckIn(
  command: MatchCheckInCommand,
  now: Date = new Date(),
): MatchCheckInResult {
  const replay = getStoredMatchCheckInResult(
    command.matchId,
    command.seedState,
    command.idempotencyKey,
    now,
  );
  if (replay) return replay;

  const snapshot = getMatchCheckInSnapshot(command.matchId, command.seedState, now);

  if (snapshot.currentUser.checkedIn) {
    return rememberMatchCheckInNoOp(
      command.matchId,
      command.seedState,
      command.idempotencyKey,
      now,
    );
  }

  if (snapshot.state !== "check-in-open") {
    throw new MatchCheckInServiceError({
      code: "MATCH_CHECK_IN_UNAVAILABLE",
      message: "Check-in is not open for this match.",
      status: 409,
      retryable: false,
    });
  }

  const opensAt = Date.parse(snapshot.clock.checkInOpensAt);
  const closesAt = Date.parse(snapshot.clock.checkInClosesAt);
  const serverNow = now.getTime();
  if (serverNow < opensAt || serverNow >= closesAt) {
    throw new MatchCheckInServiceError({
      code: "MATCH_CHECK_IN_DEADLINE_CLOSED",
      message: "The server-controlled check-in window is closed.",
      status: 409,
      retryable: false,
    });
  }

  const nextState = snapshot.opponent.checkedIn ? "both-ready" : "checked-in";
  let transition;
  try {
    transition = assertMatchMutationPrecondition(
      { state: snapshot.state, matchVersion: snapshot.matchVersion },
      {
        expectedState: command.expectedState,
        expectedVersion: command.expectedVersion,
        nextState,
      },
    );
  } catch (error) {
    if (error instanceof MatchMutationPreconditionError) throw fromPrecondition(error);
    throw error;
  }

  return persistMatchCheckInResult(command.matchId, command.seedState, {
    idempotencyKey: command.idempotencyKey,
    nextState: transition.state,
    nextVersion: transition.matchVersion,
    outcome: nextState === "both-ready" ? "both_ready" : "checked_in",
    createEvent: true,
    now,
  });
}
