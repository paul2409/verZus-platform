// VERZUS M7.5 LOBBY MUTATION RAW API SCHEMAS

import { z } from "zod";

import {
  matchLobbyActions,
  matchLobbyIssueCategories,
} from "../model/match-lobby-operations.types";
import { matchOperationStates } from "../model/match-operations.types";

export const matchLobbyRequestRawSchema = z
  .object({
    action: z.enum(matchLobbyActions),
    expected_state: z.enum(matchOperationStates),
    expected_version: z.number().int().positive(),
    issue: z
      .object({
        category: z.enum(matchLobbyIssueCategories),
        summary: z.string().trim().min(3).max(240),
      })
      .optional(),
  })
  .superRefine((value, context) => {
    if (value.action === "report_issue" && !value.issue) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["issue"],
        message: "Issue details are required when reporting a lobby problem.",
      });
    }
  });

const participantSchema = z.object({
  participant_id: z.string().min(1),
  checked_in: z.boolean(),
  entered: z.boolean(),
  ready: z.boolean(),
});

const issueSchema = z.object({
  issue_id: z.string().min(1),
  category: z.enum(matchLobbyIssueCategories),
  summary: z.string().min(3).max(240),
  status: z.literal("open"),
  created_at: z.string().datetime({ offset: true }),
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
    outcome: z.enum([
      "lobby_entered",
      "ready_confirmed",
      "match_started",
      "issue_reported",
      "already_applied",
    ]),
    match_id: z.string().min(1),
    seed_state: z.enum(matchOperationStates),
    state: z.enum(matchOperationStates),
    match_version: z.number().int().positive(),
    current_user: participantSchema,
    opponent: participantSchema,
    connection: z.object({
      lobby_code: z.string().min(1),
      platform: z.string().min(1),
      server_region: z.string().min(1),
      join_method: z.string().min(1),
    }),
    action_event_count: z.number().int().nonnegative(),
    issue_count: z.number().int().nonnegative(),
    last_issue: issueSchema.nullable(),
    last_event_id: z.string().min(1).nullable(),
    last_updated_at: z.string().datetime({ offset: true }),
    clock: clockSchema,
    event: z.object({
      event_id: z.string().min(1).nullable(),
      action: z.enum(matchLobbyActions),
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

export const matchLobbyResponseRawSchema = z.discriminatedUnion("ok", [
  successSchema,
  failureSchema,
]);
