// VERZUS M8.3 LEADERBOARD RESOURCE DOMAIN CONTRACTS

import type {
  LeaderboardFoundationRow,
  LeaderboardMode,
  LeaderboardReward,
} from "../../foundation/model/leaderboard-foundation.types";
import type { LeaderboardModeComposition } from "../../modes/model/leaderboard-mode.types";

export const leaderboardResourceScenarios = [
  "normal",
  "empty",
  "stale",
  "error",
  "malformed",
  // VERZUS M8.6 RELIABILITY RESOURCE SCENARIOS
  "slow",
  "offline",
  "unauthorized",
  "malformed-row",
] as const;

export type LeaderboardResourceScenario = (typeof leaderboardResourceScenarios)[number];
export type LeaderboardFreshness = "fresh" | "stale";

export type LeaderboardResourceMeta = {
  requestId: string;
  serverNow: string;
  lastUpdatedAt: string;
  freshness: LeaderboardFreshness;
};

export type LeaderboardSummaryResourceData = {
  mode: LeaderboardMode;
  eyebrow: string;
  title: string;
  description: string;
  periodLabel: string;
  countdownLabel: string;
  totalCompetitors: number;
  percentileLabel: string;
  meta: LeaderboardResourceMeta;
};

export type LeaderboardEntriesResourceData = {
  items: LeaderboardFoundationRow[];
  page: number;
  pageCount: number;
  total: number;
  startIndex: number;
  endIndex: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  // VERZUS M8.6 MALFORMED ROW ISOLATION EVIDENCE
  isolatedRowCount: number;
  isolatedRowIds: string[];
  meta: LeaderboardResourceMeta;
};

export type LeaderboardCurrentPositionResourceData = {
  entry: LeaderboardFoundationRow | null;
  meta: LeaderboardResourceMeta;
};

export type LeaderboardRewardsResourceData = {
  items: LeaderboardReward[];
  meta: LeaderboardResourceMeta;
};

export type LeaderboardStatusResourceData = {
  mode: LeaderboardMode;
  freshness: LeaderboardFreshness;
  lastUpdatedAt: string;
  nextRefreshAt: string;
  source: "mock-leaderboard" | "leaderboard-api";
  meta: LeaderboardResourceMeta;
};

// VERZUS M8.4 MODE COMPOSITION RESOURCE
export type LeaderboardModeCompositionResourceData = LeaderboardModeComposition & {
  meta: LeaderboardResourceMeta;
};

export type LeaderboardResourceSnapshot = {
  composition?: LeaderboardModeCompositionResourceData;
  summary?: LeaderboardSummaryResourceData;
  entries?: LeaderboardEntriesResourceData;
  currentPosition?: LeaderboardCurrentPositionResourceData;
  rewards?: LeaderboardRewardsResourceData;
  status?: LeaderboardStatusResourceData;
};
