// VERZUS M7.7 TERMINAL OPERATIONS SERVICE AND AUTHORIZATION POLICY

import { canTransitionMatchState } from "../model/match-lifecycle.machine";
import type {
  MatchTerminalAction,
  MatchTerminalCommand,
  MatchTerminalMutationResult,
  MatchTerminalRole,
  TerminalMatchState,
} from "../model/match-terminal-operations.types";
import {
  getMatchTerminalSnapshot,
  getStoredTerminalMutation,
  persistMatchTerminalTransition,
  persistTerminalReplay,
} from "./match-terminal.store";

export type MatchTerminalOperationErrorCode =
  | "MATCH_TERMINAL_UNAUTHORIZED"
  | "MATCH_TERMINAL_FORBIDDEN"
  | "MATCH_TERMINAL_STALE_STATE"
  | "MATCH_TERMINAL_STALE_VERSION"
  | "MATCH_TERMINAL_INVALID_TRANSITION";

export class MatchTerminalOperationError extends Error {
  readonly code: MatchTerminalOperationErrorCode;
  readonly status: number;
  readonly retryable: boolean;

  constructor(
    code: MatchTerminalOperationErrorCode,
    message: string,
    status: number,
    retryable = false,
  ) {
    super(message);
    this.name = "MatchTerminalOperationError";
    this.code = code;
    this.status = status;
    this.retryable = retryable;
  }
}

const rolePolicy: Record<MatchTerminalAction, readonly MatchTerminalRole[]> = {
  forfeit_match: ["current_user", "admin", "system"],
  cancel_match: ["support", "admin", "system"],
  complete_match: ["admin", "system"],
};

function nextState(action: MatchTerminalAction): TerminalMatchState {
  switch (action) {
    case "forfeit_match":
      return "forfeit";
    case "cancel_match":
      return "cancelled";
    case "complete_match":
      return "completed";
  }
}

export function canRoleExecuteTerminalAction(
  role: MatchTerminalRole,
  action: MatchTerminalAction,
): boolean {
  return rolePolicy[action].includes(role);
}

export function executeMatchTerminalCommand(
  command: MatchTerminalCommand,
  now: Date = new Date(),
): MatchTerminalMutationResult {
  const replay = getStoredTerminalMutation(
    command.matchId,
    command.seedState,
    command.idempotencyKey,
    now,
  );
  if (replay) return persistTerminalReplay(replay);

  if (!matchTerminalRoleIsAuthenticated(command.actorRole)) {
    throw new MatchTerminalOperationError(
      "MATCH_TERMINAL_UNAUTHORIZED",
      "Authentication is required for terminal match operations.",
      401,
    );
  }
  if (!canRoleExecuteTerminalAction(command.actorRole, command.action)) {
    throw new MatchTerminalOperationError(
      "MATCH_TERMINAL_FORBIDDEN",
      "Your role cannot perform this terminal match operation.",
      403,
    );
  }

  const snapshot = getMatchTerminalSnapshot(command.matchId, command.seedState, now);
  if (snapshot.matchVersion !== command.expectedVersion) {
    throw new MatchTerminalOperationError(
      "MATCH_TERMINAL_STALE_VERSION",
      "The match version changed. Refresh before retrying this terminal operation.",
      409,
      true,
    );
  }
  if (snapshot.state !== command.expectedState) {
    throw new MatchTerminalOperationError(
      "MATCH_TERMINAL_STALE_STATE",
      "The match state changed. Refresh before retrying this terminal operation.",
      409,
      true,
    );
  }

  const target = nextState(command.action);
  if (snapshot.state === target) {
    const event = {
      auditEventId: snapshot.auditEventId ?? "terminal-already-applied",
      action: command.action,
      actorRole: command.actorRole,
      reason: snapshot.terminalReason ?? command.reason,
      previousState: snapshot.state,
      nextState: target,
      previousVersion: snapshot.matchVersion,
      nextVersion: snapshot.matchVersion,
      createdAt: snapshot.terminalAt ?? now.toISOString(),
      replayed: true,
    } as const;
    return { outcome: "already_applied", snapshot, event };
  }

  if (!canTransitionMatchState(snapshot.state, target)) {
    throw new MatchTerminalOperationError(
      "MATCH_TERMINAL_INVALID_TRANSITION",
      `Transition from ${snapshot.state} to ${target} is not allowed.`,
      409,
    );
  }

  return persistMatchTerminalTransition({
    matchId: command.matchId,
    seedState: command.seedState,
    idempotencyKey: command.idempotencyKey,
    nextState: target,
    action: command.action,
    actorRole: command.actorRole,
    reason: command.reason,
    now,
  });
}

export function matchTerminalRoleIsAuthenticated(role: MatchTerminalRole): boolean {
  return role !== ("anonymous" as MatchTerminalRole);
}
