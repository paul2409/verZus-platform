// VERZUS M8.1 LEADERBOARD RESPONSIVE FOUNDATION TYPES

export const leaderboardModes = ["weekly", "pools", "game", "crew", "combine"] as const;

export type LeaderboardMode = (typeof leaderboardModes)[number];
export type LeaderboardScope = "global" | "friends";
export type LeaderboardGame = "all" | "ea-fc" | "cod-mobile" | "clash-royale" | "league";
export type LeaderboardSortKey = "rank" | "points" | "wins" | "win-rate";
export type LeaderboardMovement = "up" | "down" | "same" | "new";
export type LeaderboardEntityType = "player" | "pool" | "crew";
export type LeaderboardTier = "champion" | "diamond" | "platinum" | "gold" | "silver" | "bronze";

export type LeaderboardFoundationRow = {
  id: string;
  rank: number;
  previousRank: number | null;
  movement: LeaderboardMovement;
  movementDelta: number | null;
  entityType: LeaderboardEntityType;
  name: string;
  handle: string;
  initials: string;
  crewName: string | null;
  countryCode: string;
  game: Exclude<LeaderboardGame, "all">;
  scope: LeaderboardScope;
  wins: number;
  losses: number;
  winRate: number;
  points: number;
  streak: number;
  trust: number;
  tier: LeaderboardTier;
  memberCount: number | null;
  isCurrentUser: boolean;
};

export type LeaderboardReward = {
  rankLabel: string;
  xp: number;
  cashLabel: string;
};

export type LeaderboardFoundationBoard = {
  mode: LeaderboardMode;
  eyebrow: string;
  title: string;
  description: string;
  periodLabel: string;
  countdownLabel: string;
  totalCompetitors: number;
  percentileLabel: string;
  rows: readonly LeaderboardFoundationRow[];
  currentEntry: LeaderboardFoundationRow;
  rewards: readonly LeaderboardReward[];
};

export const leaderboardModeLabels: Record<LeaderboardMode, string> = {
  weekly: "Weekly",
  pools: "Pools",
  game: "Game",
  crew: "Crew",
  combine: "Combine",
};

export const leaderboardGameLabels: Record<LeaderboardGame, string> = {
  all: "All games",
  "ea-fc": "EA FC",
  "cod-mobile": "COD Mobile",
  "clash-royale": "Clash Royale",
  league: "League",
};
