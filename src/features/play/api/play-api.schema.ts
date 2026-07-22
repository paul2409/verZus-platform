// VERZUS M5 STEPS 5.1-5.4

import { z } from "zod";

const nullableUrlSchema = z.string().url().nullable();
const isoDateTimeSchema = z.string().datetime({ offset: true });

export const playApiErrorRawSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  request_id: z.string().min(1),
  retryable: z.boolean(),
  field_errors: z.record(z.string(), z.array(z.string())),
});

export type PlayApiErrorRaw = z.infer<typeof playApiErrorRawSchema>;

export const playApiFailureSchema = z.object({
  ok: z.literal(false),
  error: playApiErrorRawSchema,
});

export type PlayApiFailure = z.infer<typeof playApiFailureSchema>;

export const playerStatusRawSchema = z.object({
  player_id: z.string().min(1),
  handle: z.string().min(1),
  display_name: z.string().min(1),
  avatar_url: nullableUrlSchema,
  primary_game: z.string().min(1),
  game_lane: z.string().min(1),
  location_label: z.string().min(1),
  trust_score: z.number().int().min(0).max(100),
  trust_tier: z.enum(["restricted", "developing", "verified", "elite"]),
  week_label: z.string().min(1),
  unread_notifications: z.number().int().min(0),
  last_updated_at: isoDateTimeSchema,
});

export type PlayerStatusRaw = z.infer<typeof playerStatusRawSchema>;

export const matchParticipantRawSchema = z.object({
  player_id: z.string().min(1),
  handle: z.string().min(1),
  avatar_url: nullableUrlSchema,
  rank: z.number().int().nonnegative().nullable(),
  location_label: z.string().min(1),
  is_current_player: z.boolean(),
});

export const nextMatchRawSchema = z.object({
  match_id: z.string().min(1),
  competition_id: z.string().min(1),
  competition_name: z.string().min(1),
  game: z.string().min(1),
  format: z.string().min(1),
  status: z.enum([
    "scheduled",
    "check_in_open",
    "checked_in",
    "starting_soon",
    "in_progress",
    "completed",
    "cancelled",
  ]),
  starts_at: isoDateTimeSchema,
  check_in_opens_at: isoDateTimeSchema,
  check_in_closes_at: isoDateTimeSchema,
  server_now: isoDateTimeSchema,
  self: matchParticipantRawSchema,
  opponent: matchParticipantRawSchema,
});

export type NextMatchRaw = z.infer<typeof nextMatchRawSchema>;

export const currentCheckInRawSchema = z.object({
  match_id: z.string().min(1).nullable(),
  state: z.enum(["unavailable", "open", "checked_in", "closed"]),
  opens_at: isoDateTimeSchema.nullable(),
  closes_at: isoDateTimeSchema.nullable(),
  checked_in_at: isoDateTimeSchema.nullable(),
  server_now: isoDateTimeSchema,
  can_check_in: z.boolean(),
  mutation_key: z.string().min(1).nullable(),
});

export type CurrentCheckInRaw = z.infer<typeof currentCheckInRawSchema>;

export const currentPositionRawSchema = z.object({
  leaderboard_id: z.string().min(1),
  week_label: z.string().min(1),
  rank: z.number().int().nonnegative(),
  previous_rank: z.number().int().nonnegative().nullable(),
  movement: z.enum(["up", "down", "same", "new"]),
  points: z.number().int().min(0),
  target_points: z.number().int().positive(),
  wins: z.number().int().min(0),
  losses: z.number().int().min(0),
  win_rate: z.number().min(0).max(100),
  streak: z.string().min(1),
  tier: z.string().min(1),
  last_updated_at: isoDateTimeSchema,
});

export type CurrentPositionRaw = z.infer<typeof currentPositionRawSchema>;

export const crewSummaryRawSchema = z.object({
  crew_id: z.string().min(1),
  name: z.string().min(1),
  tag: z.string().min(1),
  emblem_url: nullableUrlSchema,
  rank: z.number().int().nonnegative(),
  points: z.number().int().min(0),
  online_members: z.number().int().min(0),
  total_members: z.number().int().positive(),
  live_activity_count: z.number().int().min(0),
  next_fixture_label: z.string().min(1).nullable(),
  next_fixture_at: isoDateTimeSchema.nullable(),
  last_updated_at: isoDateTimeSchema,
});

export type CrewSummaryRaw = z.infer<typeof crewSummaryRawSchema>;

export const recommendedCompetitionRawSchema = z.object({
  competition_id: z.string().min(1),
  title: z.string().min(1),
  game: z.string().min(1),
  format: z.string().min(1),
  starts_at: isoDateTimeSchema,
  registration_closes_at: isoDateTimeSchema,
  entry_label: z.string().min(1),
  eligibility_label: z.string().min(1),
  reward_label: z.string().min(1),
  is_featured: z.boolean(),
});

export type RecommendedCompetitionRaw = z.infer<typeof recommendedCompetitionRawSchema>;

export const recentActivityItemRawSchema = z.object({
  activity_id: z.string().min(1),
  type: z.enum([
    "match_win",
    "match_loss",
    "rank_change",
    "points_awarded",
    "crew_update",
    "competition_entry",
  ]),
  title: z.string().min(1),
  detail: z.string().min(1),
  occurred_at: isoDateTimeSchema,
  points_delta: z.number().int().nullable(),
  href: z.string().startsWith("/").nullable(),
});

export type RecentActivityItemRaw = z.infer<typeof recentActivityItemRawSchema>;

function successSchema<TSchema extends z.ZodType>(data: TSchema) {
  return z.object({
    ok: z.literal(true),
    data,
    request_id: z.string().min(1),
  });
}

export const playerStatusResponseSchema = z.discriminatedUnion("ok", [
  successSchema(playerStatusRawSchema),
  playApiFailureSchema,
]);

export const nextMatchResponseSchema = z.discriminatedUnion("ok", [
  successSchema(nextMatchRawSchema.nullable()),
  playApiFailureSchema,
]);

export const currentCheckInResponseSchema = z.discriminatedUnion("ok", [
  successSchema(currentCheckInRawSchema),
  playApiFailureSchema,
]);

export const currentPositionResponseSchema = z.discriminatedUnion("ok", [
  successSchema(currentPositionRawSchema),
  playApiFailureSchema,
]);

export const crewSummaryResponseSchema = z.discriminatedUnion("ok", [
  successSchema(crewSummaryRawSchema.nullable()),
  playApiFailureSchema,
]);

export const recommendedCompetitionsResponseSchema = z.discriminatedUnion("ok", [
  successSchema(z.array(recommendedCompetitionRawSchema)),
  playApiFailureSchema,
]);

export const recentActivityResponseSchema = z.discriminatedUnion("ok", [
  successSchema(z.array(recentActivityItemRawSchema)),
  playApiFailureSchema,
]);
