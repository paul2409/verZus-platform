// VERZUS M7.7 TERMINAL OPERATIONS DOMAIN CONTRACTS

import type { MatchClockSnapshot, MatchOperationState } from "./match-operations.types";

export const matchTerminalActions = ["forfeit_match", "cancel_match", "complete_match"] as const;
export type MatchTerminalAction = (typeof matchTerminalActions)[number];

export const matchTerminalRoles = ["current_user", "support", "admin", "system"] as const;
export type MatchTerminalRole = (typeof matchTerminalRoles)[number];

export const terminalMatchStates = ["forfeit", "cancelled", "completed"] as const;
export type TerminalMatchState = (typeof terminalMatchStates)[number];

export type MatchTerminalAuditEvent = {
  auditEventId: string;
  action: MatchTerminalAction;
  actorRole: MatchTerminalRole;
  reason: string;
  previousState: MatchOperationState;
  nextState: TerminalMatchState;
  previousVersion: number;
  nextVersion: number;
  createdAt: string;
  replayed: boolean;
};

export type MatchTerminalSnapshot = {
  matchId: string;
  seedState: MatchOperationState;
  state: MatchOperationState;
  matchVersion: number;
  terminalReason: string | null;
  terminalAt: string | null;
  actorRole: MatchTerminalRole | null;
  auditEventId: string | null;
  terminalEventCount: number;
  lastUpdatedAt: string;
  clock: MatchClockSnapshot;
};

export type MatchTerminalCommand = {
  matchId: string;
  seedState: MatchOperationState;
  expectedState: MatchOperationState;
  expectedVersion: number;
  idempotencyKey: string;
  action: MatchTerminalAction;
  actorRole: MatchTerminalRole;
  reason: string;
};

export type MatchTerminalMutationOutcome =
  "match_forfeited" | "match_cancelled" | "match_completed" | "already_applied";

export type MatchTerminalMutationResult = {
  outcome: MatchTerminalMutationOutcome;
  snapshot: MatchTerminalSnapshot;
  event: MatchTerminalAuditEvent;
};

export type MatchTerminalMutationBlock = {
  code: "MATCH_TERMINAL_STATE";
  message: string;
  status: 409;
  retryable: false;
  state: TerminalMatchState;
  matchVersion: number;
};

export const matchAccessStates = [
  "authorized",
  "unauthorized",
  "forbidden",
  "not_found",
  "maintenance",
] as const;
export type MatchAccessState = (typeof matchAccessStates)[number];

export const matchAvailabilityStates = ["normal", "offline", "stale"] as const;
export type MatchAvailabilityState = (typeof matchAvailabilityStates)[number];
