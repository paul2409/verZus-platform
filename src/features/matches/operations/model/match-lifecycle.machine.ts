// VERZUS M7.2 MATCH LIFECYCLE STATE MACHINE

import type { MatchOperationState } from "./match-operations.types";

export const matchLifecycleTransitions: Readonly<
  Record<MatchOperationState, readonly MatchOperationState[]>
> = {
  scheduled: ["check-in-unavailable", "cancelled"],
  "check-in-unavailable": ["check-in-open", "cancelled"],
  "check-in-open": ["checked-in", "opponent-not-checked-in", "both-ready", "forfeit", "cancelled"],
  "checked-in": ["opponent-not-checked-in", "both-ready", "forfeit", "cancelled"],
  "opponent-not-checked-in": ["both-ready", "forfeit", "cancelled"],
  "both-ready": ["lobby-open", "forfeit", "cancelled"],
  "lobby-open": ["in-progress", "forfeit", "cancelled"],
  "in-progress": ["submit-result", "forfeit", "cancelled"],
  "submit-result": ["awaiting-opponent-confirmation", "disputed", "forfeit", "cancelled"],
  "awaiting-opponent-confirmation": ["result-confirmed", "disputed", "cancelled"],
  "result-confirmed": ["completed", "disputed"],
  disputed: ["result-confirmed", "forfeit", "cancelled", "completed"],
  forfeit: ["completed"],
  cancelled: [],
  completed: [],
};

export const terminalMatchOperationStates = [
  "cancelled",
  "completed",
] as const satisfies readonly MatchOperationState[];

export type MatchMutationSnapshot = {
  state: MatchOperationState;
  matchVersion: number;
};

export type MatchMutationPrecondition = {
  expectedState: MatchOperationState;
  expectedVersion: number;
  nextState: MatchOperationState;
};

export type MatchMutationPreconditionErrorCode =
  "MATCH_STALE_STATE" | "MATCH_STALE_VERSION" | "MATCH_INVALID_TRANSITION";

export class MatchMutationPreconditionError extends Error {
  readonly code: MatchMutationPreconditionErrorCode;
  readonly currentState: MatchOperationState;
  readonly currentVersion: number;
  readonly retryable: boolean;

  constructor(
    code: MatchMutationPreconditionErrorCode,
    message: string,
    snapshot: MatchMutationSnapshot,
    retryable: boolean,
  ) {
    super(message);
    this.name = "MatchMutationPreconditionError";
    this.code = code;
    this.currentState = snapshot.state;
    this.currentVersion = snapshot.matchVersion;
    this.retryable = retryable;
  }
}

export function getAllowedMatchTransitions(
  state: MatchOperationState,
): readonly MatchOperationState[] {
  return matchLifecycleTransitions[state];
}

export function canTransitionMatchState(
  currentState: MatchOperationState,
  nextState: MatchOperationState,
): boolean {
  return matchLifecycleTransitions[currentState].includes(nextState);
}

export function assertMatchMutationPrecondition(
  snapshot: MatchMutationSnapshot,
  precondition: MatchMutationPrecondition,
): MatchMutationSnapshot {
  if (snapshot.matchVersion !== precondition.expectedVersion) {
    throw new MatchMutationPreconditionError(
      "MATCH_STALE_VERSION",
      "The match changed before this action was applied. Refresh the match and retry.",
      snapshot,
      true,
    );
  }

  if (snapshot.state !== precondition.expectedState) {
    throw new MatchMutationPreconditionError(
      "MATCH_STALE_STATE",
      "The match is no longer in the state required for this action.",
      snapshot,
      true,
    );
  }

  if (!canTransitionMatchState(snapshot.state, precondition.nextState)) {
    throw new MatchMutationPreconditionError(
      "MATCH_INVALID_TRANSITION",
      `Transition from ${snapshot.state} to ${precondition.nextState} is not allowed.`,
      snapshot,
      false,
    );
  }

  return {
    state: precondition.nextState,
    matchVersion: snapshot.matchVersion + 1,
  };
}
