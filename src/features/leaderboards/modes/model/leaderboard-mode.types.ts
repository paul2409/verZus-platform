// VERZUS M8.4 LEADERBOARD MODE COMPOSITION TYPES

import type {
  LeaderboardEntityType,
  LeaderboardGame,
  LeaderboardMode,
  LeaderboardScope,
  LeaderboardSortKey,
} from "../../foundation/model/leaderboard-foundation.types";
import type { LeaderboardSortDirection } from "../../explorer/model/leaderboard-query-state";

export const leaderboardModeColumnKeys = [
  "rank",
  "identity",
  "affiliation",
  "members",
  "game",
  "record",
  "win-rate",
  "streak",
  "trust",
  "recent-match",
  "points",
] as const;

export const leaderboardModeMetricKeys = [
  "points",
  "record",
  "win-rate",
  "members",
  "game",
  "streak",
  "trust",
] as const;

export type LeaderboardModeColumnKey = (typeof leaderboardModeColumnKeys)[number];
export type LeaderboardModeMetricKey = (typeof leaderboardModeMetricKeys)[number];
export type LeaderboardColumnAlignment = "start" | "end";

export type LeaderboardModeColumn = {
  key: LeaderboardModeColumnKey;
  label: string;
  alignment: LeaderboardColumnAlignment;
};

export type LeaderboardModeComposition = {
  mode: LeaderboardMode;
  entityType: LeaderboardEntityType;
  rankingBasis: string;
  identityLabel: string;
  affiliationLabel: string | null;
  pointsLabel: string;
  currentPositionLabel: string;
  defaultGame: LeaderboardGame;
  allowedGames: readonly LeaderboardGame[];
  defaultScope: LeaderboardScope;
  allowedScopes: readonly LeaderboardScope[];
  defaultSort: LeaderboardSortKey;
  defaultDirection: LeaderboardSortDirection;
  desktopColumns: readonly LeaderboardModeColumn[];
  mobilePrimaryMetric: LeaderboardModeMetricKey;
  mobileSecondaryMetrics: readonly LeaderboardModeMetricKey[];
};
