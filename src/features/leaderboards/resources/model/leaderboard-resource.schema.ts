// VERZUS M8.3 LEADERBOARD VALIDATED DOMAIN SCHEMAS

import { z } from "zod";

import { leaderboardModes } from "../../foundation/model/leaderboard-foundation.types";
import {
  leaderboardModeColumnKeys,
  leaderboardModeMetricKeys,
} from "../../modes/model/leaderboard-mode.types";

const isoDateTimeSchema = z.string().datetime({ offset: true });
const modeSchema = z.enum(leaderboardModes);
const freshnessSchema = z.enum(["fresh", "stale"]);

export const leaderboardResourceMetaSchema = z.object({
  requestId: z.string().min(1),
  serverNow: isoDateTimeSchema,
  lastUpdatedAt: isoDateTimeSchema,
  freshness: freshnessSchema,
});

export const leaderboardFoundationRowSchema = z.object({
  id: z.string().min(1),
  rank: z.number().int().positive(),
  previousRank: z.number().int().positive().nullable(),
  movement: z.enum(["up", "down", "same", "new"]),
  movementDelta: z.number().int().min(0).nullable(),
  entityType: z.enum(["player", "pool", "crew"]),
  name: z.string().min(1),
  handle: z.string().min(1),
  initials: z.string().min(1),
  crewName: z.string().min(1).nullable(),
  countryCode: z.string().min(2).max(3),
  game: z.enum(["ea-fc", "cod-mobile", "clash-royale", "league"]),
  scope: z.enum(["global", "friends"]),
  wins: z.number().int().min(0),
  losses: z.number().int().min(0),
  winRate: z.number().min(0).max(100),
  points: z.number().int().min(0),
  streak: z.number().int().min(0),
  trust: z.number().min(0).max(100),
  tier: z.enum(["champion", "diamond", "platinum", "gold", "silver", "bronze"]),
  memberCount: z.number().int().positive().nullable(),
  isCurrentUser: z.boolean(),
});

export const leaderboardRewardSchema = z.object({
  rankLabel: z.string().min(1),
  xp: z.number().int().min(0),
  cashLabel: z.string().min(1),
});

// VERZUS M8.4 MODE COMPOSITION DOMAIN SCHEMA
export const leaderboardModeCompositionResourceDataSchema = z.object({
  mode: modeSchema,
  entityType: z.enum(["player", "pool", "crew"]),
  rankingBasis: z.string().min(1),
  identityLabel: z.string().min(1),
  affiliationLabel: z.string().min(1).nullable(),
  pointsLabel: z.string().min(1),
  currentPositionLabel: z.string().min(1),
  defaultGame: z.enum(["all", "ea-fc", "cod-mobile", "clash-royale", "league"]),
  allowedGames: z.array(z.enum(["all", "ea-fc", "cod-mobile", "clash-royale", "league"])).min(1),
  defaultScope: z.enum(["global", "friends"]),
  allowedScopes: z.array(z.enum(["global", "friends"])).min(1),
  defaultSort: z.enum(["rank", "points", "wins", "win-rate"]),
  defaultDirection: z.enum(["asc", "desc"]),
  desktopColumns: z
    .array(
      z.object({
        key: z.enum(leaderboardModeColumnKeys),
        label: z.string().min(1),
        alignment: z.enum(["start", "end"]),
      }),
    )
    .min(1),
  mobilePrimaryMetric: z.enum(leaderboardModeMetricKeys),
  mobileSecondaryMetrics: z.array(z.enum(leaderboardModeMetricKeys)),
  meta: leaderboardResourceMetaSchema,
});

export const leaderboardSummaryResourceDataSchema = z.object({
  mode: modeSchema,
  eyebrow: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  periodLabel: z.string().min(1),
  countdownLabel: z.string().min(1),
  totalCompetitors: z.number().int().min(0),
  percentileLabel: z.string().min(1),
  meta: leaderboardResourceMetaSchema,
});

export const leaderboardEntriesResourceDataSchema = z.object({
  items: z.array(leaderboardFoundationRowSchema),
  page: z.number().int().positive(),
  pageCount: z.number().int().positive(),
  total: z.number().int().min(0),
  startIndex: z.number().int().min(0),
  endIndex: z.number().int().min(0),
  hasPreviousPage: z.boolean(),
  hasNextPage: z.boolean(),
  // VERZUS M8.6 MALFORMED ROW ISOLATION EVIDENCE
  isolatedRowCount: z.number().int().min(0),
  isolatedRowIds: z.array(z.string().min(1)),
  meta: leaderboardResourceMetaSchema,
});

export const leaderboardCurrentPositionResourceDataSchema = z.object({
  entry: leaderboardFoundationRowSchema.nullable(),
  meta: leaderboardResourceMetaSchema,
});

export const leaderboardRewardsResourceDataSchema = z.object({
  items: z.array(leaderboardRewardSchema),
  meta: leaderboardResourceMetaSchema,
});

export const leaderboardStatusResourceDataSchema = z.object({
  mode: modeSchema,
  freshness: freshnessSchema,
  lastUpdatedAt: isoDateTimeSchema,
  nextRefreshAt: isoDateTimeSchema,
  source: z.enum(["mock-leaderboard", "leaderboard-api"]),
  meta: leaderboardResourceMetaSchema,
});
