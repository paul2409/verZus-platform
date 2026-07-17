// VERZUS M8.5 LIVE UPDATE HTTP SCHEMA

import { z } from "zod";

import { leaderboardModes } from "../../foundation/model/leaderboard-foundation.types";

const isoDateTimeSchema = z.string().datetime({ offset: true });

const rowRawSchema = z.object({
  leaderboard_entry_id: z.string().min(1),
  rank: z.number().int().positive(),
  previous_rank: z.number().int().positive().nullable(),
  movement: z.enum(["up", "down", "same", "new"]),
  movement_delta: z.number().int().min(0).nullable(),
  entity_type: z.enum(["player", "pool", "crew"]),
  display_name: z.string().min(1),
  handle: z.string().min(1),
  initials: z.string().min(1),
  crew_name: z.string().min(1).nullable(),
  country_code: z.string().min(2).max(3),
  game: z.enum(["ea-fc", "cod-mobile", "clash-royale", "league"]),
  scope: z.enum(["global", "friends"]),
  wins: z.number().int().min(0),
  losses: z.number().int().min(0),
  win_rate: z.number().min(0).max(100),
  points: z.number().int().min(0),
  streak: z.number().int().min(0),
  trust: z.number().min(0).max(100),
  tier: z.enum(["champion", "diamond", "platinum", "gold", "silver", "bronze"]),
  member_count: z.number().int().positive().nullable(),
  is_current_user: z.boolean(),
});

const apiFailureSchema = z.object({
  ok: z.literal(false),
  error: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
    request_id: z.string().min(1),
    retryable: z.boolean(),
    field_errors: z.record(z.string(), z.array(z.string())),
  }),
});

export const leaderboardLiveUpdateResponseSchema = z.discriminatedUnion("ok", [
  z.object({
    ok: z.literal(true),
    data: z.object({
      mode: z.enum(leaderboardModes),
      revision: z.number().int().positive(),
      base_revision: z.number().int().positive(),
      has_changes: z.boolean(),
      changed_entry_ids: z.array(z.string().min(1)),
      items: z.array(rowRawSchema),
      current_position: z.object({
        entry: rowRawSchema.nullable(),
        previous_rank: z.number().int().positive().nullable(),
        movement: z.enum(["up", "down", "same", "new"]),
        movement_delta: z.number().int().min(0).nullable(),
        next_rank: z.number().int().positive().nullable(),
        points_to_next_rank: z.number().int().min(0).nullable(),
      }),
      next_poll_at: isoDateTimeSchema,
    }),
    request_id: z.string().min(1),
    meta: z.object({
      server_now: isoDateTimeSchema,
      last_updated_at: isoDateTimeSchema,
      freshness: z.enum(["fresh", "stale"]),
    }),
  }),
  apiFailureSchema,
]);
