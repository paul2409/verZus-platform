// VERZUS M7.6 RESULT OPERATIONS DOMAIN SCHEMAS

import { z } from "zod";

import { matchClockSnapshotSchema } from "./match-resource.schema";
import { matchDisputeReasons, matchResultActions } from "./match-result-operations.types";
import { matchOperationStates } from "./match-operations.types";

export const matchScoreSchema = z.object({
  home: z.number().int().min(0).max(99),
  away: z.number().int().min(0).max(99),
});

export const matchEvidenceAttachmentSchema = z.object({
  evidenceId: z.string().min(1),
  fileName: z.string().min(1).max(160),
  mimeType: z.enum(["image/png", "image/jpeg", "video/mp4"]),
  sizeBytes: z
    .number()
    .int()
    .positive()
    .max(25 * 1024 * 1024),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  uploadedAt: z.string().datetime({ offset: true }),
});

const submissionSchema = z.object({
  submissionId: z.string().min(1),
  score: matchScoreSchema,
  note: z.string().max(500).nullable(),
  submittedBy: z.literal("current_user"),
  submittedAt: z.string().datetime({ offset: true }),
});

const confirmationSchema = z.object({
  confirmationId: z.string().min(1),
  score: matchScoreSchema,
  confirmedBy: z.literal("opponent"),
  confirmedAt: z.string().datetime({ offset: true }),
});

const conflictSchema = z.object({
  conflictId: z.string().min(1),
  submittedScore: matchScoreSchema,
  confirmationScore: matchScoreSchema,
  detectedAt: z.string().datetime({ offset: true }),
});

const disputeSchema = z.object({
  disputeId: z.string().min(1),
  reason: z.enum(matchDisputeReasons),
  summary: z.string().min(8).max(500),
  claimedScore: matchScoreSchema.nullable(),
  status: z.literal("open"),
  createdBy: z.literal("current_user"),
  createdAt: z.string().datetime({ offset: true }),
  auditEventId: z.string().min(1),
});

export const matchResultOperationsSnapshotSchema = z.object({
  matchId: z.string().min(1),
  seedState: z.enum(matchOperationStates),
  state: z.enum(matchOperationStates),
  matchVersion: z.number().int().positive(),
  submission: submissionSchema.nullable(),
  confirmation: confirmationSchema.nullable(),
  conflict: conflictSchema.nullable(),
  evidenceAttachments: z.array(matchEvidenceAttachmentSchema).max(5),
  dispute: disputeSchema.nullable(),
  resultEventCount: z.number().int().nonnegative(),
  evidenceEventCount: z.number().int().nonnegative(),
  disputeEventCount: z.number().int().nonnegative(),
  lastEventId: z.string().min(1).nullable(),
  lastUpdatedAt: z.string().datetime({ offset: true }),
  clock: matchClockSnapshotSchema,
});

export const matchResultMutationResultSchema = z.object({
  outcome: z.enum([
    "result_submitted",
    "result_confirmed",
    "result_conflict_detected",
    "already_applied",
  ]),
  snapshot: matchResultOperationsSnapshotSchema,
  event: z.object({
    eventId: z.string().min(1).nullable(),
    action: z.enum(matchResultActions),
    createdAt: z.string().datetime({ offset: true }),
    replayed: z.boolean(),
  }),
});

export const matchEvidenceUploadResultSchema = z.object({
  outcome: z.enum(["evidence_uploaded", "already_applied"]),
  attachment: matchEvidenceAttachmentSchema,
  snapshot: matchResultOperationsSnapshotSchema,
  event: z.object({
    eventId: z.string().min(1).nullable(),
    createdAt: z.string().datetime({ offset: true }),
    replayed: z.boolean(),
  }),
});

export const matchDisputeMutationResultSchema = z.object({
  outcome: z.enum(["dispute_created", "already_applied"]),
  snapshot: matchResultOperationsSnapshotSchema,
  event: z.object({
    eventId: z.string().min(1).nullable(),
    createdAt: z.string().datetime({ offset: true }),
    replayed: z.boolean(),
  }),
});
