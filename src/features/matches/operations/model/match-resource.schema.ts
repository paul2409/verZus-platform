// VERZUS M7.3 MATCH OPERATIONS DOMAIN SCHEMAS

import { z } from "zod";

import { matchOperationStates } from "./match-operations.types";

const actionSchema = z.object({
  label: z.string().min(1),
  tone: z.enum(["primary", "secondary", "danger"]),
  disabled: z.boolean(),
});

const participantSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  handle: z.string().min(1),
  rankLabel: z.string().min(1),
  emblem: z.enum(["rebels", "apex"]),
  sideLabel: z.string().min(1),
  checkedIn: z.boolean(),
  ready: z.boolean(),
});

const scoreSchema = z.object({
  home: z.number().int().nonnegative(),
  away: z.number().int().nonnegative(),
});

const timelineItemSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  timeLabel: z.string().min(1),
  state: z.enum(["complete", "current", "future", "warning"]),
});

export const matchClockSnapshotSchema = z.object({
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

export const matchSummarySchema = z.object({
  id: z.string().min(1),
  state: z.enum(matchOperationStates),
  stateLabel: z.string().min(1),
  stateTone: z.enum(["neutral", "info", "success", "warning", "danger"]),
  competitionName: z.string().min(1),
  roundLabel: z.string().min(1),
  gameLabel: z.string().min(1),
  formatLabel: z.string().min(1),
  scheduledAtLabel: z.string().min(1),
  matchVersion: z.number().int().positive(),
});

export const matchParticipantsSchema = z.object({
  home: participantSchema,
  away: participantSchema,
  score: scoreSchema.nullable(),
});

export const matchTimelineSchema = z.object({
  timeline: z.array(timelineItemSchema),
  serverTimeLabel: z.string().min(1),
});

const commandPanelSchema = z.object({
  visible: z.boolean(),
  stateTone: z.enum(["neutral", "info", "success", "warning", "danger"]),
  title: z.string().min(1),
  description: z.string().min(1),
  timerLabel: z.string().nullable(),
  timerCaption: z.string().nullable(),
  primaryAction: actionSchema.nullable(),
  secondaryAction: actionSchema.nullable(),
});

export const matchCheckInSchema = commandPanelSchema;
export const matchLobbySchema = commandPanelSchema.extend({
  lobbyCode: z.string().min(1),
  connectionStatus: z.enum(["waiting", "available", "connected", "in_progress"]),
  platform: z.string().min(1),
  serverRegion: z.string().min(1),
  joinInstructions: z.string().min(1),
  currentUserEntered: z.boolean(),
  currentUserReady: z.boolean(),
  opponentEntered: z.boolean(),
  opponentReady: z.boolean(),
  canEnter: z.boolean(),
  canConfirmReady: z.boolean(),
  canStartMatch: z.boolean(),
  canReportIssue: z.boolean(),
  issueCount: z.number().int().nonnegative(),
  lastIssueId: z.string().min(1).nullable(),
});
export const matchResultSchema = commandPanelSchema
  .omit({ timerLabel: true, timerCaption: true })
  .extend({
    score: scoreSchema.nullable(),
    resultNote: z.string().nullable(),
    xpEarned: z.number().int().nonnegative().nullable(),
    submissionId: z.string().min(1).nullable(),
    submittedAt: z.string().datetime({ offset: true }).nullable(),
    confirmedAt: z.string().datetime({ offset: true }).nullable(),
    confirmationStatus: z.enum([
      "not_submitted",
      "awaiting_opponent",
      "confirmed",
      "conflict",
      "disputed",
    ]),
    canSubmit: z.boolean(),
    canConfirm: z.boolean(),
    canDispute: z.boolean(),
    conflictCode: z.string().min(1).nullable(),
  });

export const matchEvidenceSchema = z.object({
  visible: z.boolean(),
  maxFiles: z.number().int().positive(),
  maxFileSizeBytes: z.number().int().positive(),
  acceptedMimeTypes: z.array(z.string().min(1)).min(1),
  uploadedCount: z.number().int().nonnegative(),
  uploadEnabled: z.boolean(),
  attachments: z
    .array(
      z.object({
        evidenceId: z.string().min(1),
        fileName: z.string().min(1),
        mimeType: z.string().min(1),
        sizeBytes: z.number().int().positive(),
        sha256: z.string().regex(/^[a-f0-9]{64}$/),
        uploadedAt: z.string().datetime({ offset: true }),
      }),
    )
    .max(5),
});

export const matchDisputeSchema = z.object({
  visible: z.boolean(),
  title: z.string().min(1),
  resultNote: z.string().nullable(),
  disputeId: z.string().nullable(),
  statusLabel: z.string().min(1),
  secondaryAction: actionSchema.nullable(),
  reasonCode: z.string().nullable(),
  summary: z.string().nullable(),
  createdAt: z.string().datetime({ offset: true }).nullable(),
  auditEventCount: z.number().int().nonnegative(),
  canCreate: z.boolean(),
});

export const matchSupportSchema = z.object({
  matchId: z.string().min(1),
  gameLabel: z.string().min(1),
  formatLabel: z.string().min(1),
  lobbyCode: z.string().min(1),
  chatAvailable: z.boolean(),
  supportAvailable: z.boolean(),
  note: z.string().min(1),
});

export function matchResourceDataSchema<TSchema extends z.ZodType>(valueSchema: TSchema) {
  return z.object({
    value: valueSchema,
    meta: z.object({
      requestId: z.string().min(1),
      serverNow: z.string().datetime({ offset: true }),
      lastUpdatedAt: z.string().datetime({ offset: true }),
      freshness: z.enum(["fresh", "stale"]),
    }),
  });
}
