// VERZUS M7.4 CHECK-IN RAW API SCHEMAS

import { z } from "zod";

import { matchOperationStates } from "../model/match-operations.types";

export const matchCheckInRequestRawSchema = z.object({
  expected_state: z.enum(matchOperationStates),
  expected_version: z.number().int().positive(),
});

const participantSchema = z.object({
  participant_id: z.string().min(1),
  checked_in: z.boolean(),
  ready: z.boolean(),
});

const clockSchema = z.object({
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

const successSchema = z.object({
  ok: z.literal(true),
  data: z.object({
    outcome: z.enum(["checked_in", "both_ready", "already_checked_in"]),
    match_id: z.string().min(1),
    seed_state: z.enum(matchOperationStates),
    state: z.enum(matchOperationStates),
    match_version: z.number().int().positive(),
    current_user: participantSchema,
    opponent: participantSchema,
    check_in_event_count: z.number().int().nonnegative(),
    last_event_id: z.string().min(1).nullable(),
    last_updated_at: z.string().datetime({ offset: true }),
    clock: clockSchema,
    event: z.object({
      event_id: z.string().min(1).nullable(),
      created_at: z.string().datetime({ offset: true }),
      replayed: z.boolean(),
    }),
  }),
  request_id: z.string().min(1),
});

const failureSchema = z.object({
  ok: z.literal(false),
  error: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
    request_id: z.string().min(1),
    retryable: z.boolean(),
    field_errors: z.record(z.string(), z.array(z.string())).optional(),
  }),
});

export const matchCheckInResponseRawSchema = z.discriminatedUnion("ok", [
  successSchema,
  failureSchema,
]);
