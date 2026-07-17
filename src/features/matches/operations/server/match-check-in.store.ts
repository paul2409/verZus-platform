// VERZUS M7.4 REFRESH-PERSISTENT CHECK-IN STORE

import { randomUUID } from "node:crypto";

import { createMatchClockSnapshot } from "../model/match-clock.policy";
import type { MatchCheckInResult, MatchCheckInSnapshot } from "../model/match-check-in.types";
import type {
  MatchClockMode,
  MatchClockSnapshot,
  MatchDeadlineKind,
  MatchOperationState,
} from "../model/match-operations.types";

const currentUserParticipantId = "rebels-united";
const opponentParticipantId = "apex-predators";

const checkedInStates = new Set<MatchOperationState>([
  "checked-in",
  "opponent-not-checked-in",
  "both-ready",
  "lobby-open",
  "in-progress",
  "submit-result",
  "awaiting-opponent-confirmation",
  "result-confirmed",
  "disputed",
  "forfeit",
  "completed",
]);

const bothReadyStates = new Set<MatchOperationState>([
  "both-ready",
  "lobby-open",
  "in-progress",
  "submit-result",
  "awaiting-opponent-confirmation",
  "result-confirmed",
  "disputed",
  "forfeit",
  "completed",
]);

type StoredMatchCheckIn = {
  snapshot: MatchCheckInSnapshot;
  baseClock: MatchClockSnapshot;
  idempotencyResults: Map<string, MatchCheckInResult>;
};

type CheckInGlobal = typeof globalThis & {
  __verzusM74CheckInStore?: Map<string, StoredMatchCheckIn>;
};

const globalScope = globalThis as CheckInGlobal;
const store = globalScope.__verzusM74CheckInStore ?? new Map<string, StoredMatchCheckIn>();
globalScope.__verzusM74CheckInStore = store;

function recordKey(matchId: string, seedState: MatchOperationState): string {
  return `${matchId}::${seedState}`;
}

function activeClockPolicy(state: MatchOperationState): {
  kind: MatchDeadlineKind;
  mode: MatchClockMode;
} {
  switch (state) {
    case "scheduled":
      return { kind: "match_starts", mode: "countdown" };
    case "check-in-unavailable":
      return { kind: "check_in_opens", mode: "countdown" };
    case "check-in-open":
    case "checked-in":
    case "opponent-not-checked-in":
      return { kind: "check_in_closes", mode: "countdown" };
    case "both-ready":
      return { kind: "lobby_opens", mode: "countdown" };
    case "lobby-open":
      return { kind: "match_starts", mode: "countdown" };
    case "in-progress":
      return { kind: "match_starts", mode: "elapsed" };
    default:
      return { kind: null, mode: "none" };
  }
}

function activeDeadlineAt(kind: MatchDeadlineKind, clock: MatchClockSnapshot): string | null {
  switch (kind) {
    case "check_in_opens":
      return clock.checkInOpensAt;
    case "check_in_closes":
      return clock.checkInClosesAt;
    case "lobby_opens":
      return clock.lobbyOpensAt;
    case "match_starts":
      return clock.matchStartsAt;
    case "result_due":
      return clock.resultDueAt;
    case null:
      return null;
  }
}

function clockFor(record: StoredMatchCheckIn, now: Date): MatchClockSnapshot {
  const policy = activeClockPolicy(record.snapshot.state);
  return {
    ...record.baseClock,
    state: record.snapshot.state,
    matchVersion: record.snapshot.matchVersion,
    serverNow: now.toISOString(),
    issuedAt: now.toISOString(),
    activeDeadlineKind: policy.kind,
    activeDeadlineAt: activeDeadlineAt(policy.kind, record.baseClock),
    mode: policy.mode,
  };
}

function createRecord(
  matchId: string,
  seedState: MatchOperationState,
  now: Date,
): StoredMatchCheckIn {
  const baseClock = createMatchClockSnapshot(matchId, seedState, now, 12);
  const opponentSeededReady = matchId.includes("opponent-ready");
  const currentCheckedIn = checkedInStates.has(seedState);
  const opponentCheckedIn = bothReadyStates.has(seedState) || opponentSeededReady;
  const ready = bothReadyStates.has(seedState);

  const snapshot: MatchCheckInSnapshot = {
    matchId,
    seedState,
    state: seedState,
    matchVersion: 12,
    currentUser: {
      participantId: currentUserParticipantId,
      checkedIn: currentCheckedIn,
      ready,
    },
    opponent: {
      participantId: opponentParticipantId,
      checkedIn: opponentCheckedIn,
      ready: ready || opponentSeededReady,
    },
    checkInEventCount: 0,
    lastEventId: null,
    lastUpdatedAt: now.toISOString(),
    clock: baseClock,
  };

  const record: StoredMatchCheckIn = {
    snapshot,
    baseClock,
    idempotencyResults: new Map(),
  };
  record.snapshot.clock = clockFor(record, now);
  return record;
}

function getRecord(matchId: string, seedState: MatchOperationState, now: Date): StoredMatchCheckIn {
  const key = recordKey(matchId, seedState);
  const existing = store.get(key);
  if (existing) return existing;
  const created = createRecord(matchId, seedState, now);
  store.set(key, created);
  return created;
}

function cloneSnapshot(snapshot: MatchCheckInSnapshot): MatchCheckInSnapshot {
  return structuredClone(snapshot);
}

export function getMatchCheckInSnapshot(
  matchId: string,
  seedState: MatchOperationState,
  now: Date = new Date(),
): MatchCheckInSnapshot {
  const record = getRecord(matchId, seedState, now);
  record.snapshot.clock = clockFor(record, now);
  return cloneSnapshot(record.snapshot);
}

export function getStoredMatchCheckInResult(
  matchId: string,
  seedState: MatchOperationState,
  idempotencyKey: string,
  now: Date,
): MatchCheckInResult | null {
  const record = getRecord(matchId, seedState, now);
  const stored = record.idempotencyResults.get(idempotencyKey);
  if (!stored) return null;
  return {
    ...structuredClone(stored),
    snapshot: getMatchCheckInSnapshot(matchId, seedState, now),
    event: { ...stored.event, replayed: true },
  };
}

export function persistMatchCheckInResult(
  matchId: string,
  seedState: MatchOperationState,
  input: {
    idempotencyKey: string;
    nextState: MatchOperationState;
    nextVersion: number;
    outcome: MatchCheckInResult["outcome"];
    createEvent: boolean;
    now: Date;
  },
): MatchCheckInResult {
  const record = getRecord(matchId, seedState, input.now);
  const eventId = input.createEvent ? randomUUID() : record.snapshot.lastEventId;

  record.snapshot.state = input.nextState;
  record.snapshot.matchVersion = input.nextVersion;
  record.snapshot.currentUser.checkedIn = true;
  record.snapshot.currentUser.ready = input.nextState === "both-ready";
  if (input.nextState === "both-ready") {
    record.snapshot.opponent.checkedIn = true;
    record.snapshot.opponent.ready = true;
  }
  if (input.createEvent) record.snapshot.checkInEventCount += 1;
  record.snapshot.lastEventId = eventId;
  record.snapshot.lastUpdatedAt = input.now.toISOString();
  record.snapshot.clock = clockFor(record, input.now);

  const result: MatchCheckInResult = {
    outcome: input.outcome,
    snapshot: cloneSnapshot(record.snapshot),
    event: {
      eventId,
      createdAt: input.now.toISOString(),
      replayed: false,
    },
  };
  record.idempotencyResults.set(input.idempotencyKey, structuredClone(result));
  return result;
}

export function rememberMatchCheckInNoOp(
  matchId: string,
  seedState: MatchOperationState,
  idempotencyKey: string,
  now: Date,
): MatchCheckInResult {
  const snapshot = getMatchCheckInSnapshot(matchId, seedState, now);
  const result: MatchCheckInResult = {
    outcome: "already_checked_in",
    snapshot,
    event: {
      eventId: snapshot.lastEventId,
      createdAt: now.toISOString(),
      replayed: false,
    },
  };
  getRecord(matchId, seedState, now).idempotencyResults.set(
    idempotencyKey,
    structuredClone(result),
  );
  return result;
}

export function resetMatchCheckInStore(): void {
  store.clear();
}
