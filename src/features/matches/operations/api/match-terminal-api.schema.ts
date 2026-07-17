// VERZUS M7.7 TERMINAL OPERATIONS RAW API SCHEMAS

import { z } from "zod";

import { matchOperationStates } from "../model/match-operations.types";
import {
  matchTerminalActions,
  matchTerminalRoles,
  terminalMatchStates,
} from "../model/match-terminal-operations.types";

const clockSchema = z.object({
  matchId: z.string(),
  state: z.enum(matchOperationStates),
  matchVersion: z.number().int(),
  serverNow: z.string(),
  issuedAt: z.string(),
  scheduledAt: z.string(),
  checkInOpensAt: z.string(),
  checkInClosesAt: z.string(),
  lobbyOpensAt: z.string(),
  matchStartsAt: z.string(),
  resultDueAt: z.string(),
  activeDeadlineKind: z
    .enum(["check_in_opens", "check_in_closes", "lobby_opens", "match_starts", "result_due"])
    .nullable(),
  activeDeadlineAt: z.string().nullable(),
  mode: z.enum(["countdown", "elapsed", "none"]),
  timezone: z.literal("UTC"),
});

export const matchTerminalRequestRawSchema = z.object({
  expected_state: z.enum(matchOperationStates),
  expected_version: z.number().int().nonnegative(),
  action: z.enum(matchTerminalActions),
  reason: z.string().trim().min(8).max(500),
});

export const matchTerminalSnapshotRawSchema = z.object({
  match_id: z.string(),
  seed_state: z.enum(matchOperationStates),
  state: z.enum(matchOperationStates),
  match_version: z.number().int().nonnegative(),
  terminal_reason: z.string().nullable(),
  terminal_at: z.string().nullable(),
  actor_role: z.enum(matchTerminalRoles).nullable(),
  audit_event_id: z.string().nullable(),
  terminal_event_count: z.number().int().nonnegative(),
  last_updated_at: z.string(),
  clock: clockSchema,
});

export const matchTerminalReadEnvelopeRawSchema = z.object({
  ok: z.literal(true),
  data: matchTerminalSnapshotRawSchema,
  request_id: z.string(),
});

export const matchTerminalMutationEnvelopeRawSchema = z.object({
  ok: z.literal(true),
  data: z.object({
    outcome: z.enum(["match_forfeited", "match_cancelled", "match_completed", "already_applied"]),
    snapshot: matchTerminalSnapshotRawSchema,
    event: z.object({
      audit_event_id: z.string(),
      action: z.enum(matchTerminalActions),
      actor_role: z.enum(matchTerminalRoles),
      reason: z.string(),
      previous_state: z.enum(matchOperationStates),
      next_state: z.enum(terminalMatchStates),
      previous_version: z.number().int(),
      next_version: z.number().int(),
      created_at: z.string(),
      replayed: z.boolean(),
    }),
  }),
  request_id: z.string(),
});
