// VERZUS M7.5 REFRESH-PERSISTENT LOBBY OPERATIONS STORE

import { randomUUID } from "node:crypto";

import type {
  MatchClockMode,
  MatchClockSnapshot,
  MatchDeadlineKind,
  MatchOperationState,
} from "../model/match-operations.types";
import type {
  MatchLobbyAction,
  MatchLobbyIssue,
  MatchLobbyResult,
  MatchLobbyOperationsSnapshot,
} from "../model/match-lobby-operations.types";
import { getMatchCheckInSnapshot } from "./match-check-in.store";

const currentUserParticipantId = "rebels-united";
const opponentParticipantId = "apex-predators";

const postCheckInStates = new Set<MatchOperationState>([
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

const lobbyEnteredStates = new Set<MatchOperationState>([
  "lobby-open",
  "in-progress",
  "submit-result",
  "awaiting-opponent-confirmation",
  "result-confirmed",
  "disputed",
  "forfeit",
  "completed",
]);

const inProgressOrLaterStates = new Set<MatchOperationState>([
  "in-progress",
  "submit-result",
  "awaiting-opponent-confirmation",
  "result-confirmed",
  "disputed",
  "forfeit",
  "completed",
]);

type StoredMatchLobby = {
  snapshot: MatchLobbyOperationsSnapshot;
  baseClock: MatchClockSnapshot;
  idempotencyResults: Map<string, MatchLobbyResult>;
};

type LobbyGlobal = typeof globalThis & {
  __verzusM75LobbyStore?: Map<string, StoredMatchLobby>;
};

const globalScope = globalThis as LobbyGlobal;
const store = globalScope.__verzusM75LobbyStore ?? new Map<string, StoredMatchLobby>();
globalScope.__verzusM75LobbyStore = store;

function recordKey(matchId: string, seedState: MatchOperationState): string {
  return `${matchId}::${seedState}`;
}

function activeClockPolicy(state: MatchOperationState): {
  kind: MatchDeadlineKind;
  mode: MatchClockMode;
} {
  switch (state) {
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
    case "lobby_opens":
      return clock.lobbyOpensAt;
    case "match_starts":
      return clock.matchStartsAt;
    case "check_in_opens":
      return clock.checkInOpensAt;
    case "check_in_closes":
      return clock.checkInClosesAt;
    case "result_due":
      return clock.resultDueAt;
    case null:
      return null;
  }
}

function previewClock(matchId: string, clock: MatchClockSnapshot, now: Date): MatchClockSnapshot {
  if (!matchId.includes("lobby-now") && !matchId.includes("start-ready")) return clock;

  const nowMs = now.getTime();
  if (matchId.includes("start-ready")) {
    const startMs = nowMs - 5_000;
    return {
      ...clock,
      lobbyOpensAt: new Date(startMs - 10 * 60_000).toISOString(),
      matchStartsAt: new Date(startMs).toISOString(),
      scheduledAt: new Date(startMs).toISOString(),
      resultDueAt: new Date(startMs + 60 * 60_000).toISOString(),
    };
  }

  return {
    ...clock,
    lobbyOpensAt: new Date(nowMs - 1_000).toISOString(),
    matchStartsAt: new Date(nowMs + 10 * 60_000).toISOString(),
    scheduledAt: new Date(nowMs + 10 * 60_000).toISOString(),
    resultDueAt: new Date(nowMs + 70 * 60_000).toISOString(),
  };
}

function clockFor(record: StoredMatchLobby, now: Date): MatchClockSnapshot {
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
): StoredMatchLobby {
  const checkIn = getMatchCheckInSnapshot(matchId, seedState, now);
  const baseClock = previewClock(matchId, checkIn.clock, now);
  const currentEntered = lobbyEnteredStates.has(checkIn.state);
  const seededStartReady = matchId.includes("start-ready");
  const opponentReadyPreview = matchId.includes("opponent-lobby-ready") || seededStartReady;
  const progressed = inProgressOrLaterStates.has(checkIn.state);

  const snapshot: MatchLobbyOperationsSnapshot = {
    matchId,
    seedState,
    state: checkIn.state,
    matchVersion: checkIn.matchVersion,
    currentUser: {
      participantId: currentUserParticipantId,
      checkedIn: checkIn.currentUser.checkedIn || postCheckInStates.has(checkIn.state),
      entered: currentEntered || seededStartReady,
      ready: progressed || seededStartReady,
    },
    opponent: {
      participantId: opponentParticipantId,
      checkedIn: checkIn.opponent.checkedIn || postCheckInStates.has(checkIn.state),
      entered: progressed || opponentReadyPreview,
      ready: progressed || opponentReadyPreview,
    },
    connection: {
      lobbyCode: "VZ-775-2049",
      platform: "EA SPORTS FC 26",
      serverRegion: "West Africa",
      joinMethod: "Private match code",
    },
    actionEventCount: 0,
    issueCount: 0,
    lastIssue: null,
    lastEventId: null,
    lastUpdatedAt: now.toISOString(),
    clock: baseClock,
  };

  const record: StoredMatchLobby = {
    snapshot,
    baseClock,
    idempotencyResults: new Map(),
  };
  record.snapshot.clock = clockFor(record, now);
  return record;
}

function synchronizeFromCheckIn(record: StoredMatchLobby, now: Date): void {
  const checkIn = getMatchCheckInSnapshot(record.snapshot.matchId, record.snapshot.seedState, now);

  if (checkIn.matchVersion <= record.snapshot.matchVersion) return;
  if (lobbyEnteredStates.has(record.snapshot.state)) return;

  record.snapshot.state = checkIn.state;
  record.snapshot.matchVersion = checkIn.matchVersion;
  record.snapshot.currentUser.checkedIn = checkIn.currentUser.checkedIn;
  record.snapshot.currentUser.ready = checkIn.currentUser.ready;
  record.snapshot.opponent.checkedIn = checkIn.opponent.checkedIn;
  record.snapshot.opponent.ready = checkIn.opponent.ready;
  record.baseClock = previewClock(record.snapshot.matchId, checkIn.clock, now);
  record.snapshot.lastUpdatedAt = now.toISOString();
}

function getRecord(matchId: string, seedState: MatchOperationState, now: Date): StoredMatchLobby {
  const key = recordKey(matchId, seedState);
  const existing = store.get(key);
  if (existing) {
    synchronizeFromCheckIn(existing, now);
    return existing;
  }
  const created = createRecord(matchId, seedState, now);
  store.set(key, created);
  return created;
}

function cloneSnapshot(snapshot: MatchLobbyOperationsSnapshot): MatchLobbyOperationsSnapshot {
  return structuredClone(snapshot);
}

export function getMatchLobbyOperationsSnapshot(
  matchId: string,
  seedState: MatchOperationState,
  now: Date = new Date(),
): MatchLobbyOperationsSnapshot {
  const record = getRecord(matchId, seedState, now);
  record.snapshot.clock = clockFor(record, now);
  return cloneSnapshot(record.snapshot);
}

export function getStoredMatchLobbyResult(
  matchId: string,
  seedState: MatchOperationState,
  idempotencyKey: string,
  now: Date,
): MatchLobbyResult | null {
  const record = getRecord(matchId, seedState, now);
  const stored = record.idempotencyResults.get(idempotencyKey);
  if (!stored) return null;
  return {
    ...structuredClone(stored),
    snapshot: getMatchLobbyOperationsSnapshot(matchId, seedState, now),
    event: { ...stored.event, replayed: true },
  };
}

export function persistMatchLobbyResult(
  matchId: string,
  seedState: MatchOperationState,
  input: {
    idempotencyKey: string;
    action: MatchLobbyAction;
    outcome: MatchLobbyResult["outcome"];
    nextState: MatchOperationState;
    nextVersion: number;
    currentEntered?: boolean;
    currentReady?: boolean;
    issue?: Omit<MatchLobbyIssue, "issueId" | "createdAt" | "status">;
    now: Date;
  },
): MatchLobbyResult {
  const record = getRecord(matchId, seedState, input.now);
  const eventId = randomUUID();

  record.snapshot.state = input.nextState;
  record.snapshot.matchVersion = input.nextVersion;
  if (input.currentEntered !== undefined) {
    record.snapshot.currentUser.entered = input.currentEntered;
  }
  if (input.currentReady !== undefined) {
    record.snapshot.currentUser.ready = input.currentReady;
  }
  if (input.nextState === "in-progress") {
    record.snapshot.currentUser.entered = true;
    record.snapshot.currentUser.ready = true;
    record.snapshot.opponent.entered = true;
    record.snapshot.opponent.ready = true;
  }
  if (input.issue) {
    record.snapshot.issueCount += 1;
    record.snapshot.lastIssue = {
      issueId: randomUUID(),
      category: input.issue.category,
      summary: input.issue.summary,
      status: "open",
      createdAt: input.now.toISOString(),
    };
  }
  record.snapshot.actionEventCount += 1;
  record.snapshot.lastEventId = eventId;
  record.snapshot.lastUpdatedAt = input.now.toISOString();
  record.snapshot.clock = clockFor(record, input.now);

  const result: MatchLobbyResult = {
    outcome: input.outcome,
    snapshot: cloneSnapshot(record.snapshot),
    event: {
      eventId,
      action: input.action,
      createdAt: input.now.toISOString(),
      replayed: false,
    },
  };
  record.idempotencyResults.set(input.idempotencyKey, structuredClone(result));
  return result;
}

export function rememberMatchLobbyNoOp(
  matchId: string,
  seedState: MatchOperationState,
  idempotencyKey: string,
  action: MatchLobbyAction,
  now: Date,
): MatchLobbyResult {
  const snapshot = getMatchLobbyOperationsSnapshot(matchId, seedState, now);
  const result: MatchLobbyResult = {
    outcome: "already_applied",
    snapshot,
    event: {
      eventId: snapshot.lastEventId,
      action,
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

export function resetMatchLobbyStore(): void {
  store.clear();
}
