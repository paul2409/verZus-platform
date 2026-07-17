// VERZUS M7.6 RESULT, EVIDENCE AND DISPUTE RESPONSE ADAPTERS

import {
  matchDisputeMutationResultSchema,
  matchEvidenceUploadResultSchema,
  matchResultMutationResultSchema,
  matchResultOperationsSnapshotSchema,
} from "../model/match-result-operations.schema";
import type {
  MatchDisputeMutationResult,
  MatchEvidenceUploadResult,
  MatchResultMutationResult,
  MatchResultOperationsSnapshot,
} from "../model/match-result-operations.types";
import { MatchOperationsApiClientError } from "./match-operations-api.adapter";
import {
  matchDisputeMutationResponseRawSchema,
  matchEvidenceMutationResponseRawSchema,
  matchResultMutationResponseRawSchema,
  resultSnapshotRawSchema,
} from "./match-result-api.schema";

function clientError(input: {
  code: string;
  message: string;
  request_id: string;
  retryable: boolean;
  field_errors?: Record<string, string[]> | undefined;
}) {
  return new MatchOperationsApiClientError({
    code: input.code,
    message: input.message,
    requestId: input.request_id,
    retryable: input.retryable,
    ...(input.field_errors ? { fieldErrors: input.field_errors } : {}),
  });
}

function invalid(resource: string) {
  return new MatchOperationsApiClientError({
    code: "invalid_response",
    message: `The match ${resource} mutation returned invalid data.`,
    requestId: `match-${resource}-invalid-response`,
    retryable: true,
  });
}

function adaptSnapshot(raw: unknown): MatchResultOperationsSnapshot {
  const parsed = resultSnapshotRawSchema.parse(raw);
  return matchResultOperationsSnapshotSchema.parse({
    matchId: parsed.match_id,
    seedState: parsed.seed_state,
    state: parsed.state,
    matchVersion: parsed.match_version,
    submission: parsed.submission
      ? {
          submissionId: parsed.submission.submission_id,
          score: parsed.submission.score,
          note: parsed.submission.note,
          submittedBy: parsed.submission.submitted_by,
          submittedAt: parsed.submission.submitted_at,
        }
      : null,
    confirmation: parsed.confirmation
      ? {
          confirmationId: parsed.confirmation.confirmation_id,
          score: parsed.confirmation.score,
          confirmedBy: parsed.confirmation.confirmed_by,
          confirmedAt: parsed.confirmation.confirmed_at,
        }
      : null,
    conflict: parsed.conflict
      ? {
          conflictId: parsed.conflict.conflict_id,
          submittedScore: parsed.conflict.submitted_score,
          confirmationScore: parsed.conflict.confirmation_score,
          detectedAt: parsed.conflict.detected_at,
        }
      : null,
    evidenceAttachments: parsed.evidence_attachments.map((attachment) => ({
      evidenceId: attachment.evidence_id,
      fileName: attachment.file_name,
      mimeType: attachment.mime_type,
      sizeBytes: attachment.size_bytes,
      sha256: attachment.sha256,
      uploadedAt: attachment.uploaded_at,
    })),
    dispute: parsed.dispute
      ? {
          disputeId: parsed.dispute.dispute_id,
          reason: parsed.dispute.reason,
          summary: parsed.dispute.summary,
          claimedScore: parsed.dispute.claimed_score,
          status: parsed.dispute.status,
          createdBy: parsed.dispute.created_by,
          createdAt: parsed.dispute.created_at,
          auditEventId: parsed.dispute.audit_event_id,
        }
      : null,
    resultEventCount: parsed.result_event_count,
    evidenceEventCount: parsed.evidence_event_count,
    disputeEventCount: parsed.dispute_event_count,
    lastEventId: parsed.last_event_id,
    lastUpdatedAt: parsed.last_updated_at,
    clock: parsed.clock,
  });
}

export function adaptMatchResultMutation(payload: unknown): MatchResultMutationResult {
  const parsed = matchResultMutationResponseRawSchema.safeParse(payload);
  if (!parsed.success) throw invalid("result");
  if (!parsed.data.ok) throw clientError(parsed.data.error);
  return matchResultMutationResultSchema.parse({
    outcome: parsed.data.data.outcome,
    snapshot: adaptSnapshot(parsed.data.data.snapshot),
    event: {
      eventId: parsed.data.data.event.event_id,
      action: parsed.data.data.event.action,
      createdAt: parsed.data.data.event.created_at,
      replayed: parsed.data.data.event.replayed,
    },
  });
}

export function adaptMatchEvidenceMutation(payload: unknown): MatchEvidenceUploadResult {
  const parsed = matchEvidenceMutationResponseRawSchema.safeParse(payload);
  if (!parsed.success) throw invalid("evidence");
  if (!parsed.data.ok) throw clientError(parsed.data.error);
  return matchEvidenceUploadResultSchema.parse({
    outcome: parsed.data.data.outcome,
    attachment: {
      evidenceId: parsed.data.data.attachment.evidence_id,
      fileName: parsed.data.data.attachment.file_name,
      mimeType: parsed.data.data.attachment.mime_type,
      sizeBytes: parsed.data.data.attachment.size_bytes,
      sha256: parsed.data.data.attachment.sha256,
      uploadedAt: parsed.data.data.attachment.uploaded_at,
    },
    snapshot: adaptSnapshot(parsed.data.data.snapshot),
    event: {
      eventId: parsed.data.data.event.event_id,
      createdAt: parsed.data.data.event.created_at,
      replayed: parsed.data.data.event.replayed,
    },
  });
}

export function adaptMatchDisputeMutation(payload: unknown): MatchDisputeMutationResult {
  const parsed = matchDisputeMutationResponseRawSchema.safeParse(payload);
  if (!parsed.success) throw invalid("dispute");
  if (!parsed.data.ok) throw clientError(parsed.data.error);
  return matchDisputeMutationResultSchema.parse({
    outcome: parsed.data.data.outcome,
    snapshot: adaptSnapshot(parsed.data.data.snapshot),
    event: {
      eventId: parsed.data.data.event.event_id,
      createdAt: parsed.data.data.event.created_at,
      replayed: parsed.data.data.event.replayed,
    },
  });
}
