// VERZUS M5 STEPS 5.1-5.4

import { z } from "zod";

export const playScenarioSchema = z.enum([
  "normal",
  "check_in_open",
  "checked_in",
  "match_starting_soon",
  "no_match_scheduled",
  "crew_activity_present",
  "no_crew",
  "opportunities_available",
  "partial_api_failure",
  "offline",
]);

export type PlayScenario = z.infer<typeof playScenarioSchema>;

export const playIsoDateTimeSchema = z.string().datetime({ offset: true });

export const playerStatusSchema = z.object({
  playerId: z.string().min(1),
  handle: z.string().min(1),
  displayName: z.string().min(1),
  avatarUrl: z.string().url().nullable(),
  primaryGame: z.string().min(1),
  gameLane: z.string().min(1),
  locationLabel: z.string().min(1),
  trustScore: z.number().int().min(0).max(100),
  trustTier: z.enum(["restricted", "developing", "verified", "elite"]),
  weekLabel: z.string().min(1),
  unreadNotifications: z.number().int().min(0),
  lastUpdatedAt: playIsoDateTimeSchema,
});

export type PlayerStatus = z.infer<typeof playerStatusSchema>;

export const matchParticipantSchema = z.object({
  playerId: z.string().min(1),
  handle: z.string().min(1),
  avatarUrl: z.string().url().nullable(),
  rank: z.number().int().nonnegative().nullable(),
  locationLabel: z.string().min(1),
  isCurrentPlayer: z.boolean(),
});

export type MatchParticipant = z.infer<typeof matchParticipantSchema>;

export const nextMatchStatusSchema = z.enum([
  "scheduled",
  "check_in_open",
  "checked_in",
  "starting_soon",
  "in_progress",
  "completed",
  "cancelled",
]);

export type NextMatchStatus = z.infer<typeof nextMatchStatusSchema>;

export const nextMatchSchema = z.object({
  matchId: z.string().min(1),
  competitionId: z.string().min(1),
  competitionName: z.string().min(1),
  game: z.string().min(1),
  format: z.string().min(1),
  status: nextMatchStatusSchema,
  startsAt: playIsoDateTimeSchema,
  checkInOpensAt: playIsoDateTimeSchema,
  checkInClosesAt: playIsoDateTimeSchema,
  serverNow: playIsoDateTimeSchema,
  self: matchParticipantSchema,
  opponent: matchParticipantSchema,
});

export type NextMatch = z.infer<typeof nextMatchSchema>;

export const checkInStateSchema = z.enum(["unavailable", "open", "checked_in", "closed"]);

export type CheckInState = z.infer<typeof checkInStateSchema>;

export const currentCheckInSchema = z.object({
  matchId: z.string().min(1).nullable(),
  state: checkInStateSchema,
  opensAt: playIsoDateTimeSchema.nullable(),
  closesAt: playIsoDateTimeSchema.nullable(),
  checkedInAt: playIsoDateTimeSchema.nullable(),
  serverNow: playIsoDateTimeSchema,
  canCheckIn: z.boolean(),
  mutationKey: z.string().min(1).nullable(),
});

export type CurrentCheckIn = z.infer<typeof currentCheckInSchema>;

export const rankMovementSchema = z.enum(["up", "down", "same", "new"]);

export type RankMovement = z.infer<typeof rankMovementSchema>;

export const currentPositionSchema = z.object({
  leaderboardId: z.string().min(1),
  weekLabel: z.string().min(1),
  rank: z.number().int().nonnegative(),
  previousRank: z.number().int().positive().nullable(),
  movement: rankMovementSchema,
  points: z.number().int().min(0),
  targetPoints: z.number().int().positive(),
  wins: z.number().int().min(0),
  losses: z.number().int().min(0),
  winRate: z.number().min(0).max(100),
  streak: z.string().min(1),
  tier: z.string().min(1),
  lastUpdatedAt: playIsoDateTimeSchema,
});

export type CurrentPosition = z.infer<typeof currentPositionSchema>;

export const crewSummarySchema = z.object({
  crewId: z.string().min(1),
  name: z.string().min(1),
  tag: z.string().min(1),
  emblemUrl: z.string().url().nullable(),
  rank: z.number().int().nonnegative(),
  points: z.number().int().min(0),
  onlineMembers: z.number().int().min(0),
  totalMembers: z.number().int().positive(),
  liveActivityCount: z.number().int().min(0),
  nextFixtureLabel: z.string().min(1).nullable(),
  nextFixtureAt: playIsoDateTimeSchema.nullable(),
  lastUpdatedAt: playIsoDateTimeSchema,
});

export type CrewSummary = z.infer<typeof crewSummarySchema>;

export const recommendedCompetitionSchema = z.object({
  competitionId: z.string().min(1),
  title: z.string().min(1),
  game: z.string().min(1),
  format: z.string().min(1),
  startsAt: playIsoDateTimeSchema,
  registrationClosesAt: playIsoDateTimeSchema,
  entryLabel: z.string().min(1),
  eligibilityLabel: z.string().min(1),
  rewardLabel: z.string().min(1),
  isFeatured: z.boolean(),
});

export type RecommendedCompetition = z.infer<typeof recommendedCompetitionSchema>;

export const recommendedCompetitionsSchema = z.array(recommendedCompetitionSchema);

export const activityTypeSchema = z.enum([
  "match_win",
  "match_loss",
  "rank_change",
  "points_awarded",
  "crew_update",
  "competition_entry",
]);

export type ActivityType = z.infer<typeof activityTypeSchema>;

export const recentActivityItemSchema = z.object({
  activityId: z.string().min(1),
  type: activityTypeSchema,
  title: z.string().min(1),
  detail: z.string().min(1),
  occurredAt: playIsoDateTimeSchema,
  pointsDelta: z.number().int().nullable(),
  href: z.string().startsWith("/").nullable(),
});

export type RecentActivityItem = z.infer<typeof recentActivityItemSchema>;

export const recentActivitySchema = z.array(recentActivityItemSchema);
