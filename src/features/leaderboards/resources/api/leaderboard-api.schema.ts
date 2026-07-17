// VERZUS M8.3 LEADERBOARD RAW HTTP SCHEMAS

import { z } from "zod";

import { leaderboardModes } from "../../foundation/model/leaderboard-foundation.types";
import {
  leaderboardModeColumnKeys,
  leaderboardModeMetricKeys,
} from "../../modes/model/leaderboard-mode.types";

const isoDateTimeSchema = z.string().datetime({ offset: true });
const modeSchema = z.enum(leaderboardModes);

export const leaderboardApiErrorRawSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  request_id: z.string().min(1),
  retryable: z.boolean(),
  field_errors: z.record(z.string(), z.array(z.string())),
});

export type LeaderboardApiErrorRaw = z.infer<typeof leaderboardApiErrorRawSchema>;

const apiFailureSchema = z.object({
  ok: z.literal(false),
  error: leaderboardApiErrorRawSchema,
});

const responseMetaRawSchema = z.object({
  server_now: isoDateTimeSchema,
  last_updated_at: isoDateTimeSchema,
  freshness: z.enum(["fresh", "stale"]),
});

export const leaderboardRowRawSchema = z.object({
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

const rewardRawSchema = z.object({
  rank_label: z.string().min(1),
  xp: z.number().int().min(0),
  cash_label: z.string().min(1),
});

function successSchema<TSchema extends z.ZodType>(data: TSchema) {
  return z.object({
    ok: z.literal(true),
    data,
    request_id: z.string().min(1),
    meta: responseMetaRawSchema,
  });
}

// VERZUS M8.4 MODE COMPOSITION HTTP SCHEMA
export const leaderboardCompositionResponseSchema = z.discriminatedUnion("ok", [
  successSchema(
    z.object({
      mode: modeSchema,
      entity_type: z.enum(["player", "pool", "crew"]),
      ranking_basis: z.string().min(1),
      identity_label: z.string().min(1),
      affiliation_label: z.string().min(1).nullable(),
      points_label: z.string().min(1),
      current_position_label: z.string().min(1),
      default_game: z.enum(["all", "ea-fc", "cod-mobile", "clash-royale", "league"]),
      allowed_games: z
        .array(z.enum(["all", "ea-fc", "cod-mobile", "clash-royale", "league"]))
        .min(1),
      default_scope: z.enum(["global", "friends"]),
      allowed_scopes: z.array(z.enum(["global", "friends"])).min(1),
      default_sort: z.enum(["rank", "points", "wins", "win-rate"]),
      default_direction: z.enum(["asc", "desc"]),
      desktop_columns: z
        .array(
          z.object({
            key: z.enum(leaderboardModeColumnKeys),
            label: z.string().min(1),
            alignment: z.enum(["start", "end"]),
          }),
        )
        .min(1),
      mobile_primary_metric: z.enum(leaderboardModeMetricKeys),
      mobile_secondary_metrics: z.array(z.enum(leaderboardModeMetricKeys)),
    }),
  ),
  apiFailureSchema,
]);

export const leaderboardSummaryResponseSchema = z.discriminatedUnion("ok", [
  successSchema(
    z.object({
      mode: modeSchema,
      eyebrow: z.string().min(1),
      title: z.string().min(1),
      description: z.string().min(1),
      period_label: z.string().min(1),
      countdown_label: z.string().min(1),
      total_competitors: z.number().int().min(0),
      percentile_label: z.string().min(1),
    }),
  ),
  apiFailureSchema,
]);

// VERZUS M8.6 ROW-ISOLATING ENVELOPE
export const leaderboardEntriesResponseSchema = z.discriminatedUnion("ok", [
  successSchema(
    z.object({
      items: z.array(z.unknown()),
      page: z.number().int().positive(),
      page_count: z.number().int().positive(),
      total: z.number().int().min(0),
      start_index: z.number().int().min(0),
      end_index: z.number().int().min(0),
      has_previous_page: z.boolean(),
      has_next_page: z.boolean(),
    }),
  ),
  apiFailureSchema,
]);

export const leaderboardCurrentPositionResponseSchema = z.discriminatedUnion("ok", [
  successSchema(z.object({ entry: leaderboardRowRawSchema.nullable() })),
  apiFailureSchema,
]);

export const leaderboardRewardsResponseSchema = z.discriminatedUnion("ok", [
  successSchema(z.object({ items: z.array(rewardRawSchema) })),
  apiFailureSchema,
]);

export const leaderboardStatusResponseSchema = z.discriminatedUnion("ok", [
  successSchema(
    z.object({
      mode: modeSchema,
      freshness: z.enum(["fresh", "stale"]),
      last_updated_at: isoDateTimeSchema,
      next_refresh_at: isoDateTimeSchema,
      source: z.enum(["mock-leaderboard", "leaderboard-api"]),
    }),
  ),
  apiFailureSchema,
]);
