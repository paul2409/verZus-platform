// VERZUS M7.6 REFRESH-PERSISTENT RESULT OPERATIONS STORE

import { createHash, randomUUID } from "node:crypto";

import type {
  MatchDisputeMutationResult,
  MatchDisputeRecord,
  MatchEvidenceAttachment,
  MatchEvidenceUploadResult,
  MatchResultMutationResult,
  MatchResultOperationsSnapshot,
  MatchScore,
} from "../model/match-result-operations.types";
import type {
  MatchClockMode,
  MatchClockSnapshot,
  MatchDeadlineKind,
  MatchOperationState,
} from "../model/match-operations.types";
import { getMatchLobbyOperationsSnapshot } from "./match-lobby.store";

const resultOwnedStates = new Set<MatchOperationState>([
  "submit-result",
  "awaiting-opponent-confirmation",
  "result-confirmed",
  "disputed",
  "forfeit",
  "completed",
]);

const seededSubmissionStates = new Set<MatchOperationState>([
  "awaiting-opponent-confirmation",
  "result-confirmed",
  "disputed",
  "completed",
]);

const seededConfirmationStates = new Set<MatchOperationState>(["result-confirmed", "completed"]);

type StoredResultOperations = {
  snapshot: MatchResultOperationsSnapshot;
  baseClock: MatchClockSnapshot;
  resultIdempotency: Map<string, MatchResultMutationResult>;
  evidenceIdempotency: Map<string, MatchEvidenceUploadResult>;
  disputeIdempotency: Map<string, MatchDisputeMutationResult>;
};

type ResultGlobal = typeof globalThis & {
  __verzusM76ResultStore?: Map<string, StoredResultOperations>;
};

const globalScope = globalThis as ResultGlobal;
const store = globalScope.__verzusM76ResultStore ?? new Map<string, StoredResultOperations>();
globalScope.__verzusM76ResultStore = store;

function recordKey(matchId: string, seedState: MatchOperationState): string {
  return `${matchId}::${seedState}`;
}

function clockPolicy(state: MatchOperationState): {
  kind: MatchDeadlineKind;
  mode: MatchClockMode;
} {
  switch (state) {
    case "submit-result":
      return { kind: "result_due", mode: "countdown" };
    case "in-progress":
      return { kind: "match_starts", mode: "elapsed" };
    default:
      return { kind: null, mode: "none" };
  }
}

function deadline(kind: MatchDeadlineKind, clock: MatchClockSnapshot): string | null {
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

function clockFor(record: StoredResultOperations, now: Date): MatchClockSnapshot {
  const policy = clockPolicy(record.snapshot.state);
  return {
    ...record.baseClock,
    state: record.snapshot.state,
    matchVersion: record.snapshot.matchVersion,
    serverNow: now.toISOString(),
    issuedAt: now.toISOString(),
    activeDeadlineKind: policy.kind,
    activeDeadlineAt: deadline(policy.kind, record.baseClock),
    mode: policy.mode,
  };
}

function seededSubmission(now: Date) {
  return {
    submissionId: "submission-preview-1",
    score: { home: 3, away: 2 },
    note: "Result submitted for review.",
    submittedBy: "current_user" as const,
    submittedAt: now.toISOString(),
  };
}

function seededDispute(now: Date): MatchDisputeRecord {
  return {
    disputeId: "DSP-25-00081",
    reason: "score_mismatch",
    summary: "The submitted score does not match the opponent confirmation.",
    claimedScore: { home: 3, away: 2 },
    status: "open",
    createdBy: "current_user",
    createdAt: now.toISOString(),
    auditEventId: "audit-preview-dispute-1",
  };
}

function seededEvidence(now: Date): MatchEvidenceAttachment[] {
  return [
    {
      evidenceId: "evidence-preview-1",
      fileName: "final-score.png",
      mimeType: "image/png",
      sizeBytes: 148_320,
      sha256: "a".repeat(64),
      uploadedAt: now.toISOString(),
    },
    {
      evidenceId: "evidence-preview-2",
      fileName: "match-summary.jpg",
      mimeType: "image/jpeg",
      sizeBytes: 202_441,
      sha256: "b".repeat(64),
      uploadedAt: now.toISOString(),
    },
  ];
}

function createRecord(
  matchId: string,
  seedState: MatchOperationState,
  now: Date,
): StoredResultOperations {
  const lobby = getMatchLobbyOperationsSnapshot(matchId, seedState, now);
  const state = lobby.state;
  const submission = seededSubmissionStates.has(state) ? seededSubmission(now) : null;
  const confirmation = seededConfirmationStates.has(state)
    ? {
        confirmationId: "confirmation-preview-1",
        score: { home: 3, away: 2 },
        confirmedBy: "opponent" as const,
        confirmedAt: now.toISOString(),
      }
    : null;
  const conflict =
    state === "disputed"
      ? {
          conflictId: "conflict-preview-1",
          submittedScore: { home: 3, away: 2 },
          confirmationScore: { home: 2, away: 3 },
          detectedAt: now.toISOString(),
        }
      : null;
  const dispute = state === "disputed" ? seededDispute(now) : null;
  const evidenceAttachments = state === "disputed" ? seededEvidence(now) : [];

  const snapshot: MatchResultOperationsSnapshot = {
    matchId,
    seedState,
    state,
    matchVersion: lobby.matchVersion,
    submission,
    confirmation,
    conflict,
    evidenceAttachments,
    dispute,
    resultEventCount: submission ? 1 + (confirmation ? 1 : 0) + (conflict ? 1 : 0) : 0,
    evidenceEventCount: evidenceAttachments.length,
    disputeEventCount: dispute ? 1 : 0,
    lastEventId:
      dispute?.auditEventId ?? confirmation?.confirmationId ?? submission?.submissionId ?? null,
    lastUpdatedAt: now.toISOString(),
    clock: lobby.clock,
  };

  const record: StoredResultOperations = {
    snapshot,
    baseClock: lobby.clock,
    resultIdempotency: new Map(),
    evidenceIdempotency: new Map(),
    disputeIdempotency: new Map(),
  };
  record.snapshot.clock = clockFor(record, now);
  return record;
}

function synchronizeFromLobby(record: StoredResultOperations, now: Date): void {
  if (resultOwnedStates.has(record.snapshot.state)) return;
  const lobby = getMatchLobbyOperationsSnapshot(
    record.snapshot.matchId,
    record.snapshot.seedState,
    now,
  );
  if (lobby.matchVersion <= record.snapshot.matchVersion) return;
  record.snapshot.state = lobby.state;
  record.snapshot.matchVersion = lobby.matchVersion;
  record.baseClock = lobby.clock;
  record.snapshot.lastUpdatedAt = now.toISOString();
}

function getRecord(
  matchId: string,
  seedState: MatchOperationState,
  now: Date,
): StoredResultOperations {
  const key = recordKey(matchId, seedState);
  const existing = store.get(key);
  if (existing) {
    synchronizeFromLobby(existing, now);
    return existing;
  }
  const created = createRecord(matchId, seedState, now);
  store.set(key, created);
  return created;
}

function cloneSnapshot(snapshot: MatchResultOperationsSnapshot): MatchResultOperationsSnapshot {
  return structuredClone(snapshot);
}

export function getMatchResultOperationsSnapshot(
  matchId: string,
  seedState: MatchOperationState,
  now: Date = new Date(),
): MatchResultOperationsSnapshot {
  const record = getRecord(matchId, seedState, now);
  record.snapshot.clock = clockFor(record, now);
  return cloneSnapshot(record.snapshot);
}

export function getStoredResultMutation(
  matchId: string,
  seedState: MatchOperationState,
  idempotencyKey: string,
  now: Date,
): MatchResultMutationResult | null {
  const record = getRecord(matchId, seedState, now);
  const stored = record.resultIdempotency.get(idempotencyKey);
  if (!stored) return null;
  return {
    ...structuredClone(stored),
    snapshot: getMatchResultOperationsSnapshot(matchId, seedState, now),
    event: { ...stored.event, replayed: true },
  };
}

export function persistResultSubmission(
  matchId: string,
  seedState: MatchOperationState,
  input: {
    idempotencyKey: string;
    score: MatchScore;
    note: string | null;
    nextVersion: number;
    now: Date;
  },
): MatchResultMutationResult {
  const record = getRecord(matchId, seedState, input.now);
  const eventId = randomUUID();
  record.snapshot.state = "awaiting-opponent-confirmation";
  record.snapshot.matchVersion = input.nextVersion;
  record.snapshot.submission = {
    submissionId: randomUUID(),
    score: input.score,
    note: input.note,
    submittedBy: "current_user",
    submittedAt: input.now.toISOString(),
  };
  record.snapshot.confirmation = null;
  record.snapshot.conflict = null;
  record.snapshot.resultEventCount += 1;
  record.snapshot.lastEventId = eventId;
  record.snapshot.lastUpdatedAt = input.now.toISOString();
  record.snapshot.clock = clockFor(record, input.now);

  const result: MatchResultMutationResult = {
    outcome: "result_submitted",
    snapshot: cloneSnapshot(record.snapshot),
    event: {
      eventId,
      action: "submit_result",
      createdAt: input.now.toISOString(),
      replayed: false,
    },
  };
  record.resultIdempotency.set(input.idempotencyKey, structuredClone(result));
  return result;
}

export function persistResultConfirmation(
  matchId: string,
  seedState: MatchOperationState,
  input: {
    idempotencyKey: string;
    score: MatchScore;
    nextVersion: number;
    now: Date;
  },
): MatchResultMutationResult {
  const record = getRecord(matchId, seedState, input.now);
  const eventId = randomUUID();
  record.snapshot.state = "result-confirmed";
  record.snapshot.matchVersion = input.nextVersion;
  record.snapshot.confirmation = {
    confirmationId: randomUUID(),
    score: input.score,
    confirmedBy: "opponent",
    confirmedAt: input.now.toISOString(),
  };
  record.snapshot.conflict = null;
  record.snapshot.resultEventCount += 1;
  record.snapshot.lastEventId = eventId;
  record.snapshot.lastUpdatedAt = input.now.toISOString();
  record.snapshot.clock = clockFor(record, input.now);

  const result: MatchResultMutationResult = {
    outcome: "result_confirmed",
    snapshot: cloneSnapshot(record.snapshot),
    event: {
      eventId,
      action: "confirm_result",
      createdAt: input.now.toISOString(),
      replayed: false,
    },
  };
  record.resultIdempotency.set(input.idempotencyKey, structuredClone(result));
  return result;
}

export function persistResultConflict(
  matchId: string,
  seedState: MatchOperationState,
  input: {
    idempotencyKey: string;
    confirmationScore: MatchScore;
    nextVersion: number;
    now: Date;
  },
): MatchResultMutationResult {
  const record = getRecord(matchId, seedState, input.now);
  const eventId = randomUUID();
  const submittedScore = record.snapshot.submission?.score ?? { home: 0, away: 0 };
  record.snapshot.matchVersion = input.nextVersion;
  record.snapshot.conflict = {
    conflictId: randomUUID(),
    submittedScore,
    confirmationScore: input.confirmationScore,
    detectedAt: input.now.toISOString(),
  };
  record.snapshot.resultEventCount += 1;
  record.snapshot.lastEventId = eventId;
  record.snapshot.lastUpdatedAt = input.now.toISOString();
  record.snapshot.clock = clockFor(record, input.now);

  const result: MatchResultMutationResult = {
    outcome: "result_conflict_detected",
    snapshot: cloneSnapshot(record.snapshot),
    event: {
      eventId,
      action: "confirm_result",
      createdAt: input.now.toISOString(),
      replayed: false,
    },
  };
  record.resultIdempotency.set(input.idempotencyKey, structuredClone(result));
  return result;
}

export function rememberResultNoOp(
  matchId: string,
  seedState: MatchOperationState,
  idempotencyKey: string,
  action: "submit_result" | "confirm_result",
  now: Date,
): MatchResultMutationResult {
  const snapshot = getMatchResultOperationsSnapshot(matchId, seedState, now);
  const result: MatchResultMutationResult = {
    outcome: "already_applied",
    snapshot,
    event: {
      eventId: snapshot.lastEventId,
      action,
      createdAt: now.toISOString(),
      replayed: false,
    },
  };
  getRecord(matchId, seedState, now).resultIdempotency.set(idempotencyKey, structuredClone(result));
  return result;
}

export function getStoredEvidenceMutation(
  matchId: string,
  seedState: MatchOperationState,
  idempotencyKey: string,
  now: Date,
): MatchEvidenceUploadResult | null {
  const record = getRecord(matchId, seedState, now);
  const stored = record.evidenceIdempotency.get(idempotencyKey);
  if (!stored) return null;
  return {
    ...structuredClone(stored),
    snapshot: getMatchResultOperationsSnapshot(matchId, seedState, now),
    event: { ...stored.event, replayed: true },
  };
}

export async function persistEvidenceUpload(
  matchId: string,
  seedState: MatchOperationState,
  input: {
    idempotencyKey: string;
    fileName: string;
    mimeType: MatchEvidenceAttachment["mimeType"];
    bytes: Uint8Array;
    now: Date;
  },
): Promise<MatchEvidenceUploadResult> {
  const record = getRecord(matchId, seedState, input.now);
  const sha256 = createHash("sha256").update(input.bytes).digest("hex");
  const duplicate = record.snapshot.evidenceAttachments.find(
    (attachment) => attachment.sha256 === sha256,
  );
  if (duplicate) {
    const result: MatchEvidenceUploadResult = {
      outcome: "already_applied",
      attachment: structuredClone(duplicate),
      snapshot: cloneSnapshot(record.snapshot),
      event: {
        eventId: record.snapshot.lastEventId,
        createdAt: input.now.toISOString(),
        replayed: false,
      },
    };
    record.evidenceIdempotency.set(input.idempotencyKey, structuredClone(result));
    return result;
  }

  const eventId = randomUUID();
  const attachment: MatchEvidenceAttachment = {
    evidenceId: randomUUID(),
    fileName: input.fileName,
    mimeType: input.mimeType,
    sizeBytes: input.bytes.byteLength,
    sha256,
    uploadedAt: input.now.toISOString(),
  };
  record.snapshot.evidenceAttachments.push(attachment);
  record.snapshot.evidenceEventCount += 1;
  record.snapshot.lastEventId = eventId;
  record.snapshot.lastUpdatedAt = input.now.toISOString();
  record.snapshot.clock = clockFor(record, input.now);

  const result: MatchEvidenceUploadResult = {
    outcome: "evidence_uploaded",
    attachment: structuredClone(attachment),
    snapshot: cloneSnapshot(record.snapshot),
    event: {
      eventId,
      createdAt: input.now.toISOString(),
      replayed: false,
    },
  };
  record.evidenceIdempotency.set(input.idempotencyKey, structuredClone(result));
  return result;
}

export function getStoredDisputeMutation(
  matchId: string,
  seedState: MatchOperationState,
  idempotencyKey: string,
  now: Date,
): MatchDisputeMutationResult | null {
  const record = getRecord(matchId, seedState, now);
  const stored = record.disputeIdempotency.get(idempotencyKey);
  if (!stored) return null;
  return {
    ...structuredClone(stored),
    snapshot: getMatchResultOperationsSnapshot(matchId, seedState, now),
    event: { ...stored.event, replayed: true },
  };
}

export function persistDispute(
  matchId: string,
  seedState: MatchOperationState,
  input: {
    idempotencyKey: string;
    reason: MatchDisputeRecord["reason"];
    summary: string;
    claimedScore: MatchScore | null;
    nextVersion: number;
    now: Date;
  },
): MatchDisputeMutationResult {
  const record = getRecord(matchId, seedState, input.now);
  const eventId = randomUUID();
  record.snapshot.state = "disputed";
  record.snapshot.matchVersion = input.nextVersion;
  record.snapshot.dispute = {
    disputeId: randomUUID(),
    reason: input.reason,
    summary: input.summary,
    claimedScore: input.claimedScore,
    status: "open",
    createdBy: "current_user",
    createdAt: input.now.toISOString(),
    auditEventId: eventId,
  };
  record.snapshot.disputeEventCount += 1;
  record.snapshot.lastEventId = eventId;
  record.snapshot.lastUpdatedAt = input.now.toISOString();
  record.snapshot.clock = clockFor(record, input.now);

  const result: MatchDisputeMutationResult = {
    outcome: "dispute_created",
    snapshot: cloneSnapshot(record.snapshot),
    event: {
      eventId,
      createdAt: input.now.toISOString(),
      replayed: false,
    },
  };
  record.disputeIdempotency.set(input.idempotencyKey, structuredClone(result));
  return result;
}

export function rememberDisputeNoOp(
  matchId: string,
  seedState: MatchOperationState,
  idempotencyKey: string,
  now: Date,
): MatchDisputeMutationResult {
  const snapshot = getMatchResultOperationsSnapshot(matchId, seedState, now);
  const result: MatchDisputeMutationResult = {
    outcome: "already_applied",
    snapshot,
    event: {
      eventId: snapshot.dispute?.auditEventId ?? snapshot.lastEventId,
      createdAt: now.toISOString(),
      replayed: false,
    },
  };
  getRecord(matchId, seedState, now).disputeIdempotency.set(
    idempotencyKey,
    structuredClone(result),
  );
  return result;
}

export function resetMatchResultOperationsStore(): void {
  store.clear();
}
