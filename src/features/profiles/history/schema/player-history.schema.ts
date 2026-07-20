// VERZUS M11.5 RAW PLAYER HISTORY API SCHEMAS

import { z } from "zod";

const freshnessSchema = z.enum(["fresh", "stale"]);
const resultSchema = z.enum(["win", "loss", "draw"]);
const gameSchema = z.enum(["EA FC 26", "Call of Duty", "NBA 2K26"]);

export const playerHistoryApiErrorSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  request_id: z.string().min(1),
  retryable: z.boolean(),
  field_errors: z.record(z.string(), z.array(z.string())).optional(),
});

export const playerMatchHistoryResponseSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().min(1),
      opponent_id: z.string().min(1),
      opponent_label: z.string().min(1),
      game_label: gameSchema,
      competition_label: z.string().min(1),
      score_for: z.number().int().nonnegative(),
      score_against: z.number().int().nonnegative(),
      result: resultSchema,
      played_at: z.string().datetime(),
      played_at_label: z.string().min(1),
      duration_minutes: z.number().int().positive(),
      rank_delta: z.number().int(),
      trust_delta: z.number().int(),
      verified: z.boolean(),
      match_href: z.string().startsWith("/"),
      opponent_href: z.string().startsWith("/"),
    }),
  ),
  page: z.number().int().positive(),
  page_size: z.number().int().min(1).max(20),
  total_items: z.number().int().nonnegative(),
  total_pages: z.number().int().nonnegative(),
  filters: z.object({
    game: z.enum(["all", "EA FC 26", "Call of Duty", "NBA 2K26"]),
    result: z.enum(["all", "win", "loss", "draw"]),
  }),
  request_id: z.string().min(1),
  fetched_at: z.string().datetime(),
  freshness: freshnessSchema,
});

export const playerDetailedStatisticsResponseSchema = z.object({
  window: z.enum(["season", "30d", "7d"]),
  game: z.enum(["all", "EA FC 26", "Call of Duty", "NBA 2K26"]),
  matches: z.number().int().nonnegative(),
  wins: z.number().int().nonnegative(),
  losses: z.number().int().nonnegative(),
  draws: z.number().int().nonnegative(),
  win_rate: z.number().min(0).max(100),
  rating: z.number().int().nonnegative(),
  rating_delta: z.number().int(),
  current_streak: z.number().int().nonnegative(),
  best_streak: z.number().int().nonnegative(),
  points_for: z.number().int().nonnegative(),
  points_against: z.number().int().nonnegative(),
  average_points_for: z.number().nonnegative(),
  average_points_against: z.number().nonnegative(),
  verified_rate: z.number().min(0).max(100),
  form: z.array(resultSchema).max(10),
  game_breakdown: z.array(
    z.object({
      game_label: gameSchema,
      matches: z.number().int().nonnegative(),
      wins: z.number().int().nonnegative(),
      losses: z.number().int().nonnegative(),
      draws: z.number().int().nonnegative(),
      win_rate: z.number().min(0).max(100),
      rating: z.number().int().nonnegative(),
      rating_delta: z.number().int(),
      best_streak: z.number().int().nonnegative(),
    }),
  ),
  request_id: z.string().min(1),
  fetched_at: z.string().datetime(),
  freshness: freshnessSchema,
});

export type PlayerMatchHistoryResponseRaw = z.infer<typeof playerMatchHistoryResponseSchema>;
export type PlayerDetailedStatisticsResponseRaw = z.infer<
  typeof playerDetailedStatisticsResponseSchema
>;
