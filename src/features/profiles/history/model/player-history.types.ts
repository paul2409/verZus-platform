// VERZUS M11.5 PLAYER MATCH HISTORY AND STATISTICS TYPES

import type { PlayerMatchResult } from "../../foundation";

export type PlayerHistoryResourceName = "matches" | "statistics";

export type PlayerHistoryScenario =
  | "normal"
  | "stale"
  | "empty"
  | "error"
  | "offline"
  | "slow"
  | "malformed"
  | "unauthorized"
  | "forbidden"
  | "not-found"
  | "maintenance";

export type PlayerHistoryGameFilter = "all" | "EA FC 26" | "Call of Duty" | "NBA 2K26";
export type PlayerHistoryResultFilter = "all" | PlayerMatchResult;
export type PlayerStatisticsWindow = "season" | "30d" | "7d";

export type PlayerMatchHistoryEntry = {
  id: string;
  opponentId: string;
  opponentLabel: string;
  gameLabel: Exclude<PlayerHistoryGameFilter, "all">;
  competitionLabel: string;
  scoreFor: number;
  scoreAgainst: number;
  scoreLabel: string;
  result: PlayerMatchResult;
  playedAt: string;
  playedAtLabel: string;
  durationMinutes: number;
  rankDelta: number;
  trustDelta: number;
  verified: boolean;
  matchHref: string;
  opponentHref: string;
};

export type PlayerMatchHistoryPage = {
  items: readonly PlayerMatchHistoryEntry[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  filters: {
    game: PlayerHistoryGameFilter;
    result: PlayerHistoryResultFilter;
  };
  requestId: string;
  fetchedAt: string;
  freshness: "fresh" | "stale";
};

export type PlayerGameStatistics = {
  gameLabel: Exclude<PlayerHistoryGameFilter, "all">;
  matches: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  rating: number;
  ratingDelta: number;
  bestStreak: number;
};

export type PlayerDetailedStatistics = {
  window: PlayerStatisticsWindow;
  game: PlayerHistoryGameFilter;
  matches: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  rating: number;
  ratingDelta: number;
  currentStreak: number;
  bestStreak: number;
  pointsFor: number;
  pointsAgainst: number;
  averagePointsFor: number;
  averagePointsAgainst: number;
  verifiedRate: number;
  form: readonly PlayerMatchResult[];
  gameBreakdown: readonly PlayerGameStatistics[];
  requestId: string;
  fetchedAt: string;
  freshness: "fresh" | "stale";
};

export type PlayerHistoryApiErrorShape = {
  code: string;
  message: string;
  requestId: string;
  retryable: boolean;
  fieldErrors?: Record<string, string[]>;
};

export type PlayerHistoryHealthState =
  | "loading"
  | "success"
  | "empty"
  | "stale"
  | "retrying"
  | "error"
  | "offline"
  | "unauthorized"
  | "forbidden"
  | "not-found"
  | "maintenance";

export type PlayerHistoryHealth = {
  name: PlayerHistoryResourceName;
  state: PlayerHistoryHealthState;
  code: string | null;
  requestId: string | null;
  message: string | null;
  retryable: boolean;
};
