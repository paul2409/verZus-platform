// VERZUS M7.6 RESULT, EVIDENCE AND DISPUTE RAW API SCHEMAS

import { z } from "zod";

import { matchDisputeReasons, matchResultActions } from "../model/match-result-operations.types";
import { matchOperationStates } from "../model/match-operations.types";

const scoreRawSchema = z.object({
  home: z.number().int().min(0).max(99),
  away: z.number().int().min(0).max(99),
});

const clockRawSchema = z.object({
  matchId: z.string().min(1),
  state: z.enum(matchOperationStates),
  matchVersion: z.number().int().positive(),
  serverNow: z.string().datetime({ offset: true }),
  issuedAt: z.string().datetime({ offset: true }),
  scheduledAt: z.string().datetime({ offset: true }),
  checkInOpensAt: z.string().datetime({ offset: true }),
  checkInClosesAt: z.string().datetime({ offset: true }),
  lobbyOpensAt: z.string().datetime({ offset: true }),
  matchStartsAt: z.string().datetime({ offset: true }),
  resultDueAt: z.string().datetime({ offset: true }),
  activeDeadlineKind: z
    .enum(["check_in_opens", "check_in_closes", "lobby_opens", "match_starts", "result_due"])
    .nullable(),
  activeDeadlineAt: z.string().datetime({ offset: true }).nullable(),
  mode: z.enum(["countdown", "elapsed", "none"]),
  timezone: z.literal("UTC"),
});

const submissionRawSchema = z.object({
  submission_id: z.string().min(1),
  score: scoreRawSchema,
  note: z.string().max(500).nullable(),
  submitted_by: z.literal("current_user"),
  submitted_at: z.string().datetime({ offset: true }),
});

const confirmationRawSchema = z.object({
  confirmation_id: z.string().min(1),
  score: scoreRawSchema,
  confirmed_by: z.literal("opponent"),
  confirmed_at: z.string().datetime({ offset: true }),
});

const conflictRawSchema = z.object({
  conflict_id: z.string().min(1),
  submitted_score: scoreRawSchema,
  confirmation_score: scoreRawSchema,
  detected_at: z.string().datetime({ offset: true }),
});

export const evidenceAttachmentRawSchema = z.object({
  evidence_id: z.string().min(1),
  file_name: z.string().min(1).max(160),
  mime_type: z.enum(["image/png", "image/jpeg", "video/mp4"]),
  size_bytes: z
    .number()
    .int()
    .positive()
    .max(25 * 1024 * 1024),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  uploaded_at: z.string().datetime({ offset: true }),
});

const disputeRawSchema = z.object({
  dispute_id: z.string().min(1),
  reason: z.enum(matchDisputeReasons),
  summary: z.string().min(8).max(500),
  claimed_score: scoreRawSchema.nullable(),
  status: z.literal("open"),
  created_by: z.literal("current_user"),
  created_at: z.string().datetime({ offset: true }),
  audit_event_id: z.string().min(1),
});

export const resultSnapshotRawSchema = z.object({
  match_id: z.string().min(1),
  seed_state: z.enum(matchOperationStates),
  state: z.enum(matchOperationStates),
  match_version: z.number().int().positive(),
  submission: submissionRawSchema.nullable(),
  confirmation: confirmationRawSchema.nullable(),
  conflict: conflictRawSchema.nullable(),
  evidence_attachments: z.array(evidenceAttachmentRawSchema).max(5),
  dispute: disputeRawSchema.nullable(),
  result_event_count: z.number().int().nonnegative(),
  evidence_event_count: z.number().int().nonnegative(),
  dispute_event_count: z.number().int().nonnegative(),
  last_event_id: z.string().min(1).nullable(),
  last_updated_at: z.string().datetime({ offset: true }),
  clock: clockRawSchema,
});

const errorRawSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  request_id: z.string().min(1),
  retryable: z.boolean(),
  field_errors: z.record(z.string(), z.array(z.string())).optional(),
});

const failureSchema = z.object({ ok: z.literal(false), error: errorRawSchema });

export const matchResultRequestRawSchema = z.object({
  action: z.enum(matchResultActions),
  expected_state: z.enum(matchOperationStates),
  expected_version: z.number().int().positive(),
  score: scoreRawSchema,
  note: z.string().trim().max(500).optional(),
});

export const matchDisputeRequestRawSchema = z.object({
  expected_state: z.enum(matchOperationStates),
  expected_version: z.number().int().positive(),
  reason: z.enum(matchDisputeReasons),
  summary: z.string().trim().min(8).max(500),
  claimed_score: scoreRawSchema.nullable(),
});

export const matchResultMutationResponseRawSchema = z.discriminatedUnion("ok", [
  z.object({
    ok: z.literal(true),
    data: z.object({
      outcome: z.enum([
        "result_submitted",
        "result_confirmed",
        "result_conflict_detected",
        "already_applied",
      ]),
      snapshot: resultSnapshotRawSchema,
      event: z.object({
        event_id: z.string().min(1).nullable(),
        action: z.enum(matchResultActions),
        created_at: z.string().datetime({ offset: true }),
        replayed: z.boolean(),
      }),
    }),
    request_id: z.string().min(1),
  }),
  failureSchema,
]);

export const matchEvidenceMutationResponseRawSchema = z.discriminatedUnion("ok", [
  z.object({
    ok: z.literal(true),
    data: z.object({
      outcome: z.enum(["evidence_uploaded", "already_applied"]),
      attachment: evidenceAttachmentRawSchema,
      snapshot: resultSnapshotRawSchema,
      event: z.object({
        event_id: z.string().min(1).nullable(),
        created_at: z.string().datetime({ offset: true }),
        replayed: z.boolean(),
      }),
    }),
    request_id: z.string().min(1),
  }),
  failureSchema,
]);

export const matchDisputeMutationResponseRawSchema = z.discriminatedUnion("ok", [
  z.object({
    ok: z.literal(true),
    data: z.object({
      outcome: z.enum(["dispute_created", "already_applied"]),
      snapshot: resultSnapshotRawSchema,
      event: z.object({
        event_id: z.string().min(1).nullable(),
        created_at: z.string().datetime({ offset: true }),
        replayed: z.boolean(),
      }),
    }),
    request_id: z.string().min(1),
  }),
  failureSchema,
]);
