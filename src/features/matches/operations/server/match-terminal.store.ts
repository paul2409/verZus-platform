// VERZUS M7.7 REFRESH-PERSISTENT TERMINAL STATE STORE

import { randomUUID } from "node:crypto";

import type { MatchOperationState } from "../model/match-operations.types";
import type {
  MatchTerminalAuditEvent,
  MatchTerminalMutationBlock,
  MatchTerminalMutationResult,
  MatchTerminalRole,
  MatchTerminalSnapshot,
  TerminalMatchState,
} from "../model/match-terminal-operations.types";
import { getMatchResultOperationsSnapshot } from "./match-result.store";

const terminalStates = new Set<MatchOperationState>(["forfeit", "cancelled", "completed"]);

type StoredTerminalMatch = {
  snapshot: MatchTerminalSnapshot;
  idempotencyResults: Map<string, MatchTerminalMutationResult>;
};

type TerminalGlobal = typeof globalThis & {
  __verzusM77TerminalStore?: Map<string, StoredTerminalMatch>;
};

const globalScope = globalThis as TerminalGlobal;
const store = globalScope.__verzusM77TerminalStore ?? new Map<string, StoredTerminalMatch>();
globalScope.__verzusM77TerminalStore = store;

function terminalClock(snapshot: MatchTerminalSnapshot, now: Date) {
  return {
    ...snapshot.clock,
    state: snapshot.state,
    matchVersion: snapshot.matchVersion,
    serverNow: now.toISOString(),
    issuedAt: now.toISOString(),
    activeDeadlineKind: null,
    activeDeadlineAt: null,
    mode: "none" as const,
  };
}

function previewReason(state: MatchOperationState): string | null {
  switch (state) {
    case "forfeit":
      return "The match ended by forfeit and is awaiting final settlement.";
    case "cancelled":
      return "The match was cancelled by an authorized operations role.";
    case "completed":
      return "The match result is final and the lifecycle is complete.";
    default:
      return null;
  }
}

function createRecord(
  matchId: string,
  seedState: MatchOperationState,
  now: Date,
): StoredTerminalMatch {
  const result = getMatchResultOperationsSnapshot(matchId, seedState, now);
  const isTerminal = terminalStates.has(result.state);
  const snapshot: MatchTerminalSnapshot = {
    matchId,
    seedState,
    state: result.state,
    matchVersion: result.matchVersion,
    terminalReason: previewReason(result.state),
    terminalAt: isTerminal ? now.toISOString() : null,
    actorRole: isTerminal ? "system" : null,
    auditEventId: isTerminal ? `audit-preview-${result.state}` : null,
    terminalEventCount: isTerminal ? 1 : 0,
    lastUpdatedAt: now.toISOString(),
    clock: result.clock,
  };
  snapshot.clock = terminalClock(snapshot, now);
  return { snapshot, idempotencyResults: new Map() };
}

function synchronizeFromResult(record: StoredTerminalMatch, now: Date): void {
  if (terminalStates.has(record.snapshot.state)) return;
  const result = getMatchResultOperationsSnapshot(
    record.snapshot.matchId,
    record.snapshot.seedState,
    now,
  );
  if (result.matchVersion <= record.snapshot.matchVersion) return;
  record.snapshot.state = result.state;
  record.snapshot.matchVersion = result.matchVersion;
  record.snapshot.clock = result.clock;
  record.snapshot.lastUpdatedAt = now.toISOString();
}

function getRecord(
  matchId: string,
  seedState: MatchOperationState,
  now: Date,
): StoredTerminalMatch {
  const existing = store.get(matchId);
  if (existing) {
    synchronizeFromResult(existing, now);
    return existing;
  }
  const created = createRecord(matchId, seedState, now);
  store.set(matchId, created);
  return created;
}

export function getMatchTerminalSnapshot(
  matchId: string,
  seedState: MatchOperationState,
  now: Date = new Date(),
): MatchTerminalSnapshot {
  const record = getRecord(matchId, seedState, now);
  record.snapshot.clock = terminalClock(record.snapshot, now);
  return structuredClone(record.snapshot);
}

export function getStoredTerminalMutation(
  matchId: string,
  seedState: MatchOperationState,
  idempotencyKey: string,
  now: Date,
): MatchTerminalMutationResult | null {
  const result = getRecord(matchId, seedState, now).idempotencyResults.get(idempotencyKey);
  return result ? structuredClone(result) : null;
}

export function persistMatchTerminalTransition(input: {
  matchId: string;
  seedState: MatchOperationState;
  idempotencyKey: string;
  nextState: TerminalMatchState;
  action: MatchTerminalAuditEvent["action"];
  actorRole: MatchTerminalRole;
  reason: string;
  now: Date;
}): MatchTerminalMutationResult {
  const record = getRecord(input.matchId, input.seedState, input.now);
  const previousState = record.snapshot.state;
  const previousVersion = record.snapshot.matchVersion;
  const auditEventId = randomUUID();
  const nextVersion = previousVersion + 1;
  const event: MatchTerminalAuditEvent = {
    auditEventId,
    action: input.action,
    actorRole: input.actorRole,
    reason: input.reason,
    previousState,
    nextState: input.nextState,
    previousVersion,
    nextVersion,
    createdAt: input.now.toISOString(),
    replayed: false,
  };

  record.snapshot = {
    ...record.snapshot,
    state: input.nextState,
    matchVersion: nextVersion,
    terminalReason: input.reason,
    terminalAt: input.now.toISOString(),
    actorRole: input.actorRole,
    auditEventId,
    terminalEventCount: record.snapshot.terminalEventCount + 1,
    lastUpdatedAt: input.now.toISOString(),
  };
  record.snapshot.clock = terminalClock(record.snapshot, input.now);

  const outcome =
    input.nextState === "forfeit"
      ? "match_forfeited"
      : input.nextState === "cancelled"
        ? "match_cancelled"
        : "match_completed";
  const result: MatchTerminalMutationResult = {
    outcome,
    snapshot: structuredClone(record.snapshot),
    event,
  };
  record.idempotencyResults.set(input.idempotencyKey, structuredClone(result));
  return result;
}

export function persistTerminalReplay(
  result: MatchTerminalMutationResult,
): MatchTerminalMutationResult {
  return { ...structuredClone(result), event: { ...result.event, replayed: true } };
}

export function getTerminalMutationBlock(
  matchId: string,
  seedState: MatchOperationState,
): MatchTerminalMutationBlock | null {
  const snapshot = getMatchTerminalSnapshot(matchId, seedState);
  if (!terminalStates.has(snapshot.state)) return null;
  return {
    code: "MATCH_TERMINAL_STATE",
    message: `The match is already ${snapshot.state}. No earlier lifecycle mutation is allowed.`,
    status: 409,
    retryable: false,
    state: snapshot.state as TerminalMatchState,
    matchVersion: snapshot.matchVersion,
  };
}
