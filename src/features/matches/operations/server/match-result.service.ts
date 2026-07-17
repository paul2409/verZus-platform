// VERZUS M7.6 RESULT, EVIDENCE AND DISPUTE SERVER SERVICES

import {
  MatchMutationPreconditionError,
  assertMatchMutationPrecondition,
} from "../model/match-lifecycle.machine";
import type {
  MatchDisputeCommand,
  MatchDisputeMutationResult,
  MatchEvidenceUploadResult,
  MatchResultCommand,
  MatchResultMutationResult,
  MatchResultOperationsSnapshot,
  MatchScore,
} from "../model/match-result-operations.types";
import type { MatchOperationState } from "../model/match-operations.types";
import {
  getMatchResultOperationsSnapshot,
  getStoredDisputeMutation,
  getStoredEvidenceMutation,
  getStoredResultMutation,
  persistDispute,
  persistEvidenceUpload,
  persistResultConfirmation,
  persistResultConflict,
  persistResultSubmission,
  rememberDisputeNoOp,
  rememberResultNoOp,
} from "./match-result.store";

export class MatchResultOperationError extends Error {
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
    this.name = "MatchResultOperationError";
    this.code = input.code;
    this.status = input.status;
    this.retryable = input.retryable;
    this.fieldErrors = input.fieldErrors;
  }
}

function mapPreconditionError(error: unknown): never {
  if (error instanceof MatchMutationPreconditionError) {
    throw new MatchResultOperationError({
      code: error.code,
      message: error.message,
      status: 409,
      retryable: error.retryable,
    });
  }
  throw error;
}

function scoreMatches(left: MatchScore, right: MatchScore): boolean {
  return left.home === right.home && left.away === right.away;
}

function validateScore(score: MatchScore): void {
  if (!Number.isInteger(score.home) || !Number.isInteger(score.away)) {
    throw new MatchResultOperationError({
      code: "MATCH_RESULT_INVALID_SCORE",
      message: "Scores must be whole numbers.",
      status: 400,
      retryable: false,
      fieldErrors: { score: ["Enter whole-number scores for both participants."] },
    });
  }
  if (score.home < 0 || score.away < 0 || score.home > 99 || score.away > 99) {
    throw new MatchResultOperationError({
      code: "MATCH_RESULT_INVALID_SCORE",
      message: "Scores must be between 0 and 99.",
      status: 400,
      retryable: false,
      fieldErrors: { score: ["Scores must be between 0 and 99."] },
    });
  }
}

export function executeMatchResultCommand(
  command: MatchResultCommand,
  now: Date = new Date(),
): MatchResultMutationResult {
  const replay = getStoredResultMutation(
    command.matchId,
    command.seedState,
    command.idempotencyKey,
    now,
  );
  if (replay) return replay;

  validateScore(command.score);
  const snapshot = getMatchResultOperationsSnapshot(command.matchId, command.seedState, now);

  if (command.action === "submit_result") {
    if (snapshot.submission && snapshot.state !== "submit-result") {
      return rememberResultNoOp(
        command.matchId,
        command.seedState,
        command.idempotencyKey,
        command.action,
        now,
      );
    }
    if (now.getTime() > Date.parse(snapshot.clock.resultDueAt)) {
      throw new MatchResultOperationError({
        code: "MATCH_RESULT_DEADLINE_CLOSED",
        message: "The server-controlled result deadline has passed.",
        status: 409,
        retryable: false,
      });
    }
    let next;
    try {
      next = assertMatchMutationPrecondition(
        { state: snapshot.state, matchVersion: snapshot.matchVersion },
        {
          expectedState: command.expectedState,
          expectedVersion: command.expectedVersion,
          nextState: "awaiting-opponent-confirmation",
        },
      );
    } catch (error) {
      mapPreconditionError(error);
    }
    return persistResultSubmission(command.matchId, command.seedState, {
      idempotencyKey: command.idempotencyKey,
      score: command.score,
      note: command.note?.trim() || null,
      nextVersion: next.matchVersion,
      now,
    });
  }

  if (snapshot.confirmation && snapshot.state === "result-confirmed") {
    return rememberResultNoOp(
      command.matchId,
      command.seedState,
      command.idempotencyKey,
      command.action,
      now,
    );
  }
  if (!snapshot.submission) {
    throw new MatchResultOperationError({
      code: "MATCH_RESULT_NOT_SUBMITTED",
      message: "No submitted result is available for confirmation.",
      status: 409,
      retryable: true,
    });
  }
  if (
    snapshot.state !== command.expectedState ||
    snapshot.matchVersion !== command.expectedVersion
  ) {
    try {
      assertMatchMutationPrecondition(
        { state: snapshot.state, matchVersion: snapshot.matchVersion },
        {
          expectedState: command.expectedState,
          expectedVersion: command.expectedVersion,
          nextState: "result-confirmed",
        },
      );
    } catch (error) {
      mapPreconditionError(error);
    }
  }

  if (!scoreMatches(snapshot.submission.score, command.score)) {
    return persistResultConflict(command.matchId, command.seedState, {
      idempotencyKey: command.idempotencyKey,
      confirmationScore: command.score,
      nextVersion: snapshot.matchVersion + 1,
      now,
    });
  }

  let next;
  try {
    next = assertMatchMutationPrecondition(
      { state: snapshot.state, matchVersion: snapshot.matchVersion },
      {
        expectedState: command.expectedState,
        expectedVersion: command.expectedVersion,
        nextState: "result-confirmed",
      },
    );
  } catch (error) {
    mapPreconditionError(error);
  }
  return persistResultConfirmation(command.matchId, command.seedState, {
    idempotencyKey: command.idempotencyKey,
    score: command.score,
    nextVersion: next.matchVersion,
    now,
  });
}

const allowedEvidenceStates = new Set<MatchOperationState>([
  "submit-result",
  "awaiting-opponent-confirmation",
  "disputed",
]);

export async function executeMatchEvidenceUpload(input: {
  matchId: string;
  seedState: MatchOperationState;
  expectedState: MatchOperationState;
  expectedVersion: number;
  idempotencyKey: string;
  fileName: string;
  mimeType: string;
  bytes: Uint8Array;
  now?: Date;
}): Promise<MatchEvidenceUploadResult> {
  const now = input.now ?? new Date();
  const replay = getStoredEvidenceMutation(
    input.matchId,
    input.seedState,
    input.idempotencyKey,
    now,
  );
  if (replay) return replay;

  const snapshot = getMatchResultOperationsSnapshot(input.matchId, input.seedState, now);
  if (snapshot.state !== input.expectedState || snapshot.matchVersion !== input.expectedVersion) {
    throw new MatchResultOperationError({
      code:
        snapshot.matchVersion !== input.expectedVersion
          ? "MATCH_STALE_VERSION"
          : "MATCH_STALE_STATE",
      message: "The match changed before evidence was attached. Refresh and retry.",
      status: 409,
      retryable: true,
    });
  }
  if (!allowedEvidenceStates.has(snapshot.state)) {
    throw new MatchResultOperationError({
      code: "MATCH_EVIDENCE_NOT_ALLOWED",
      message: "Evidence cannot be attached in the current match state.",
      status: 409,
      retryable: false,
    });
  }
  if (!["image/png", "image/jpeg", "video/mp4"].includes(input.mimeType)) {
    throw new MatchResultOperationError({
      code: "MATCH_EVIDENCE_TYPE_FORBIDDEN",
      message: "Only PNG, JPEG and MP4 evidence is accepted.",
      status: 415,
      retryable: false,
      fieldErrors: { file: ["Choose a PNG, JPEG or MP4 file."] },
    });
  }
  if (input.bytes.byteLength < 1) {
    throw new MatchResultOperationError({
      code: "MATCH_EVIDENCE_EMPTY",
      message: "The evidence file is empty.",
      status: 400,
      retryable: false,
    });
  }
  if (input.bytes.byteLength > 25 * 1024 * 1024) {
    throw new MatchResultOperationError({
      code: "MATCH_EVIDENCE_TOO_LARGE",
      message: "Evidence files must be 25 MB or smaller.",
      status: 413,
      retryable: false,
      fieldErrors: { file: ["Maximum file size is 25 MB."] },
    });
  }
  if (snapshot.evidenceAttachments.length >= 5) {
    throw new MatchResultOperationError({
      code: "MATCH_EVIDENCE_CAPACITY_REACHED",
      message: "The match already has the maximum of five evidence files.",
      status: 409,
      retryable: false,
    });
  }

  return persistEvidenceUpload(input.matchId, input.seedState, {
    idempotencyKey: input.idempotencyKey,
    fileName: input.fileName.slice(0, 160),
    mimeType: input.mimeType as "image/png" | "image/jpeg" | "video/mp4",
    bytes: input.bytes,
    now,
  });
}

export function executeMatchDisputeCommand(
  command: MatchDisputeCommand,
  now: Date = new Date(),
): MatchDisputeMutationResult {
  const replay = getStoredDisputeMutation(
    command.matchId,
    command.seedState,
    command.idempotencyKey,
    now,
  );
  if (replay) return replay;

  const snapshot = getMatchResultOperationsSnapshot(command.matchId, command.seedState, now);
  if (snapshot.dispute) {
    return rememberDisputeNoOp(command.matchId, command.seedState, command.idempotencyKey, now);
  }

  const summary = command.summary.trim();
  if (summary.length < 8 || summary.length > 500) {
    throw new MatchResultOperationError({
      code: "MATCH_DISPUTE_INVALID_SUMMARY",
      message: "Dispute details must contain between 8 and 500 characters.",
      status: 400,
      retryable: false,
      fieldErrors: { summary: ["Enter 8 to 500 characters."] },
    });
  }

  let next;
  try {
    next = assertMatchMutationPrecondition(
      { state: snapshot.state, matchVersion: snapshot.matchVersion },
      {
        expectedState: command.expectedState,
        expectedVersion: command.expectedVersion,
        nextState: "disputed",
      },
    );
  } catch (error) {
    mapPreconditionError(error);
  }

  return persistDispute(command.matchId, command.seedState, {
    idempotencyKey: command.idempotencyKey,
    reason: command.reason,
    summary,
    claimedScore: command.claimedScore,
    nextVersion: next.matchVersion,
    now,
  });
}

function scoreRaw(score: MatchScore) {
  return { home: score.home, away: score.away };
}

export function presentResultSnapshot(snapshot: MatchResultOperationsSnapshot) {
  return {
    match_id: snapshot.matchId,
    seed_state: snapshot.seedState,
    state: snapshot.state,
    match_version: snapshot.matchVersion,
    submission: snapshot.submission
      ? {
          submission_id: snapshot.submission.submissionId,
          score: scoreRaw(snapshot.submission.score),
          note: snapshot.submission.note,
          submitted_by: snapshot.submission.submittedBy,
          submitted_at: snapshot.submission.submittedAt,
        }
      : null,
    confirmation: snapshot.confirmation
      ? {
          confirmation_id: snapshot.confirmation.confirmationId,
          score: scoreRaw(snapshot.confirmation.score),
          confirmed_by: snapshot.confirmation.confirmedBy,
          confirmed_at: snapshot.confirmation.confirmedAt,
        }
      : null,
    conflict: snapshot.conflict
      ? {
          conflict_id: snapshot.conflict.conflictId,
          submitted_score: scoreRaw(snapshot.conflict.submittedScore),
          confirmation_score: scoreRaw(snapshot.conflict.confirmationScore),
          detected_at: snapshot.conflict.detectedAt,
        }
      : null,
    evidence_attachments: snapshot.evidenceAttachments.map((attachment) => ({
      evidence_id: attachment.evidenceId,
      file_name: attachment.fileName,
      mime_type: attachment.mimeType,
      size_bytes: attachment.sizeBytes,
      sha256: attachment.sha256,
      uploaded_at: attachment.uploadedAt,
    })),
    dispute: snapshot.dispute
      ? {
          dispute_id: snapshot.dispute.disputeId,
          reason: snapshot.dispute.reason,
          summary: snapshot.dispute.summary,
          claimed_score: snapshot.dispute.claimedScore
            ? scoreRaw(snapshot.dispute.claimedScore)
            : null,
          status: snapshot.dispute.status,
          created_by: snapshot.dispute.createdBy,
          created_at: snapshot.dispute.createdAt,
          audit_event_id: snapshot.dispute.auditEventId,
        }
      : null,
    result_event_count: snapshot.resultEventCount,
    evidence_event_count: snapshot.evidenceEventCount,
    dispute_event_count: snapshot.disputeEventCount,
    last_event_id: snapshot.lastEventId,
    last_updated_at: snapshot.lastUpdatedAt,
    clock: snapshot.clock,
  };
}

export function presentResultMutation(result: MatchResultMutationResult) {
  return {
    outcome: result.outcome,
    snapshot: presentResultSnapshot(result.snapshot),
    event: {
      event_id: result.event.eventId,
      action: result.event.action,
      created_at: result.event.createdAt,
      replayed: result.event.replayed,
    },
  };
}

export function presentEvidenceMutation(result: MatchEvidenceUploadResult) {
  return {
    outcome: result.outcome,
    attachment: {
      evidence_id: result.attachment.evidenceId,
      file_name: result.attachment.fileName,
      mime_type: result.attachment.mimeType,
      size_bytes: result.attachment.sizeBytes,
      sha256: result.attachment.sha256,
      uploaded_at: result.attachment.uploadedAt,
    },
    snapshot: presentResultSnapshot(result.snapshot),
    event: {
      event_id: result.event.eventId,
      created_at: result.event.createdAt,
      replayed: result.event.replayed,
    },
  };
}

export function presentDisputeMutation(result: MatchDisputeMutationResult) {
  return {
    outcome: result.outcome,
    snapshot: presentResultSnapshot(result.snapshot),
    event: {
      event_id: result.event.eventId,
      created_at: result.event.createdAt,
      replayed: result.event.replayed,
    },
  };
}
