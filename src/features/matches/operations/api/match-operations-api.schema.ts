// VERZUS M7.3 MATCH OPERATIONS RAW API SCHEMAS

import { z } from "zod";

import { matchOperationStates } from "../model/match-operations.types";

const apiErrorSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  request_id: z.string().min(1),
  retryable: z.boolean(),
  field_errors: z.record(z.string(), z.array(z.string())).optional(),
});

const metaSchema = z.object({
  server_now: z.string().datetime({ offset: true }),
  last_updated_at: z.string().datetime({ offset: true }),
  freshness: z.enum(["fresh", "stale"]),
});

const failureSchema = z.object({ ok: z.literal(false), error: apiErrorSchema });

function successSchema<TSchema extends z.ZodType>(data: TSchema) {
  return z.object({
    ok: z.literal(true),
    data,
    request_id: z.string().min(1),
    meta: metaSchema,
  });
}

const actionRawSchema = z.object({
  label: z.string().min(1),
  tone: z.enum(["primary", "secondary", "danger"]),
  disabled: z.boolean(),
});

const participantRawSchema = z.object({
  participant_id: z.string().min(1),
  name: z.string().min(1),
  handle: z.string().min(1),
  rank_label: z.string().min(1),
  emblem: z.enum(["rebels", "apex"]),
  side_label: z.string().min(1),
  checked_in: z.boolean(),
  ready: z.boolean(),
});

const scoreRawSchema = z.object({
  home: z.number().int().nonnegative(),
  away: z.number().int().nonnegative(),
});

export const summaryRawSchema = z.object({
  match_id: z.string().min(1),
  state: z.enum(matchOperationStates),
  state_label: z.string().min(1),
  state_tone: z.enum(["neutral", "info", "success", "warning", "danger"]),
  competition_name: z.string().min(1),
  round_label: z.string().min(1),
  game_label: z.string().min(1),
  format_label: z.string().min(1),
  scheduled_at_label: z.string().min(1),
  match_version: z.number().int().positive(),
});

export const participantsRawSchema = z.object({
  home: participantRawSchema,
  away: participantRawSchema,
  score: scoreRawSchema.nullable(),
});

export const timelineRawSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().min(1),
      label: z.string().min(1),
      time_label: z.string().min(1),
      state: z.enum(["complete", "current", "future", "warning"]),
    }),
  ),
  server_time_label: z.string().min(1),
});

const commandRawSchema = z.object({
  visible: z.boolean(),
  state_tone: z.enum(["neutral", "info", "success", "warning", "danger"]),
  title: z.string().min(1),
  description: z.string().min(1),
  timer_label: z.string().nullable(),
  timer_caption: z.string().nullable(),
  primary_action: actionRawSchema.nullable(),
  secondary_action: actionRawSchema.nullable(),
});

export const checkInRawSchema = commandRawSchema;
export const lobbyRawSchema = commandRawSchema.extend({
  lobby_code: z.string().min(1),
  connection_status: z.enum(["waiting", "available", "connected", "in_progress"]),
  platform: z.string().min(1),
  server_region: z.string().min(1),
  join_instructions: z.string().min(1),
  current_user_entered: z.boolean(),
  current_user_ready: z.boolean(),
  opponent_entered: z.boolean(),
  opponent_ready: z.boolean(),
  can_enter: z.boolean(),
  can_confirm_ready: z.boolean(),
  can_start_match: z.boolean(),
  can_report_issue: z.boolean(),
  issue_count: z.number().int().nonnegative(),
  last_issue_id: z.string().min(1).nullable(),
});
export const resultRawSchema = commandRawSchema
  .omit({ timer_label: true, timer_caption: true })
  .extend({
    score: scoreRawSchema.nullable(),
    result_note: z.string().nullable(),
    xp_earned: z.number().int().nonnegative().nullable(),
    submission_id: z.string().min(1).nullable().optional(),
    submitted_at: z.string().datetime({ offset: true }).nullable().optional(),
    confirmed_at: z.string().datetime({ offset: true }).nullable().optional(),
    confirmation_status: z
      .enum(["not_submitted", "awaiting_opponent", "confirmed", "conflict", "disputed"])
      .optional(),
    can_submit: z.boolean().optional(),
    can_confirm: z.boolean().optional(),
    can_dispute: z.boolean().optional(),
    conflict_code: z.string().min(1).nullable().optional(),
  });

export const evidenceRawSchema = z.object({
  visible: z.boolean(),
  max_files: z.number().int().positive(),
  max_file_size_bytes: z.number().int().positive().optional(),
  accepted_mime_types: z.array(z.string().min(1)).min(1),
  uploaded_count: z.number().int().nonnegative(),
  upload_enabled: z.boolean(),
  attachments: z
    .array(
      z.object({
        evidence_id: z.string().min(1),
        file_name: z.string().min(1),
        mime_type: z.string().min(1),
        size_bytes: z.number().int().positive(),
        sha256: z.string().regex(/^[a-f0-9]{64}$/),
        uploaded_at: z.string().datetime({ offset: true }),
      }),
    )
    .max(5)
    .optional(),
});

export const disputeRawSchema = z.object({
  visible: z.boolean(),
  title: z.string().min(1),
  result_note: z.string().nullable(),
  dispute_id: z.string().nullable(),
  status_label: z.string().min(1),
  secondary_action: actionRawSchema.nullable(),
  reason_code: z.string().nullable().optional(),
  summary: z.string().nullable().optional(),
  created_at: z.string().datetime({ offset: true }).nullable().optional(),
  audit_event_count: z.number().int().nonnegative().optional(),
  can_create: z.boolean().optional(),
});

export const supportRawSchema = z.object({
  match_id: z.string().min(1),
  game_label: z.string().min(1),
  format_label: z.string().min(1),
  lobby_code: z.string().min(1),
  chat_available: z.boolean(),
  support_available: z.boolean(),
  note: z.string().min(1),
});

export const clockResponseSchema = z.object({
  data: z.object({
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
  }),
  meta: z.object({ requestId: z.string().min(1), source: z.literal("mock-match-clock") }),
});

export const matchOperationsResponseSchemas = {
  summary: z.discriminatedUnion("ok", [successSchema(summaryRawSchema), failureSchema]),
  participants: z.discriminatedUnion("ok", [successSchema(participantsRawSchema), failureSchema]),
  timeline: z.discriminatedUnion("ok", [successSchema(timelineRawSchema), failureSchema]),
  "check-in": z.discriminatedUnion("ok", [successSchema(checkInRawSchema), failureSchema]),
  lobby: z.discriminatedUnion("ok", [successSchema(lobbyRawSchema), failureSchema]),
  result: z.discriminatedUnion("ok", [successSchema(resultRawSchema), failureSchema]),
  evidence: z.discriminatedUnion("ok", [successSchema(evidenceRawSchema), failureSchema]),
  dispute: z.discriminatedUnion("ok", [successSchema(disputeRawSchema), failureSchema]),
  support: z.discriminatedUnion("ok", [successSchema(supportRawSchema), failureSchema]),
} as const;

export type MatchOperationsApiErrorRaw = z.infer<typeof apiErrorSchema>;
