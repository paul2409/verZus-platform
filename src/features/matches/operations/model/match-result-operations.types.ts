// VERZUS M7.6 RESULT, EVIDENCE, CONFIRMATION AND DISPUTE CONTRACTS

import type { MatchClockSnapshot, MatchOperationState } from "./match-operations.types";

export type MatchScore = {
  home: number;
  away: number;
};

export const matchResultActions = ["submit_result", "confirm_result"] as const;
export type MatchResultAction = (typeof matchResultActions)[number];

export const matchDisputeReasons = [
  "score_mismatch",
  "opponent_no_show",
  "rule_violation",
  "connection_failure",
  "other",
] as const;
export type MatchDisputeReason = (typeof matchDisputeReasons)[number];

export type MatchResultSubmission = {
  submissionId: string;
  score: MatchScore;
  note: string | null;
  submittedBy: "current_user";
  submittedAt: string;
};

export type MatchResultConfirmation = {
  confirmationId: string;
  score: MatchScore;
  confirmedBy: "opponent";
  confirmedAt: string;
};

export type MatchResultConflict = {
  conflictId: string;
  submittedScore: MatchScore;
  confirmationScore: MatchScore;
  detectedAt: string;
};

export type MatchEvidenceAttachment = {
  evidenceId: string;
  fileName: string;
  mimeType: "image/png" | "image/jpeg" | "video/mp4";
  sizeBytes: number;
  sha256: string;
  uploadedAt: string;
};

export type MatchDisputeRecord = {
  disputeId: string;
  reason: MatchDisputeReason;
  summary: string;
  claimedScore: MatchScore | null;
  status: "open";
  createdBy: "current_user";
  createdAt: string;
  auditEventId: string;
};

export type MatchResultOperationsSnapshot = {
  matchId: string;
  seedState: MatchOperationState;
  state: MatchOperationState;
  matchVersion: number;
  submission: MatchResultSubmission | null;
  confirmation: MatchResultConfirmation | null;
  conflict: MatchResultConflict | null;
  evidenceAttachments: MatchEvidenceAttachment[];
  dispute: MatchDisputeRecord | null;
  resultEventCount: number;
  evidenceEventCount: number;
  disputeEventCount: number;
  lastEventId: string | null;
  lastUpdatedAt: string;
  clock: MatchClockSnapshot;
};

export type MatchResultCommand = {
  matchId: string;
  seedState: MatchOperationState;
  expectedState: MatchOperationState;
  expectedVersion: number;
  idempotencyKey: string;
  action: MatchResultAction;
  score: MatchScore;
  note?: string;
};

export type MatchResultOutcome =
  "result_submitted" | "result_confirmed" | "result_conflict_detected" | "already_applied";

export type MatchResultMutationResult = {
  outcome: MatchResultOutcome;
  snapshot: MatchResultOperationsSnapshot;
  event: {
    eventId: string | null;
    action: MatchResultAction;
    createdAt: string;
    replayed: boolean;
  };
};

export type MatchEvidenceUploadCommand = {
  matchId: string;
  seedState: MatchOperationState;
  expectedState: MatchOperationState;
  expectedVersion: number;
  idempotencyKey: string;
  file: File;
};

export type MatchEvidenceUploadResult = {
  outcome: "evidence_uploaded" | "already_applied";
  attachment: MatchEvidenceAttachment;
  snapshot: MatchResultOperationsSnapshot;
  event: {
    eventId: string | null;
    createdAt: string;
    replayed: boolean;
  };
};

export type MatchDisputeCommand = {
  matchId: string;
  seedState: MatchOperationState;
  expectedState: MatchOperationState;
  expectedVersion: number;
  idempotencyKey: string;
  reason: MatchDisputeReason;
  summary: string;
  claimedScore: MatchScore | null;
};

export type MatchDisputeMutationResult = {
  outcome: "dispute_created" | "already_applied";
  snapshot: MatchResultOperationsSnapshot;
  event: {
    eventId: string | null;
    createdAt: string;
    replayed: boolean;
  };
};
