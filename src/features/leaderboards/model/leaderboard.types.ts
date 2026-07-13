import type { AvatarPresence, AvatarTone } from "@/components/primitives/avatar";
import type { MovementDirection, RankTier } from "@/components/primitives/badge";

export type LeaderboardState =
  "loading" | "success" | "empty" | "stale" | "error" | "offline" | "partial-failure";

export type LeaderboardSortKey = "rank" | "player" | "played" | "wins" | "points";

export type LeaderboardSortDirection = "ascending" | "descending";

export type LeaderboardSort = {
  key: LeaderboardSortKey;
  direction: LeaderboardSortDirection;
};

export type LeaderboardPlayerViewModel = {
  id: string;
  name: string;
  handle: string | null;
  initials: string;
  avatarSrc: string | null;
  presence: AvatarPresence;
  verified: boolean;
  tone: AvatarTone;
};

export type LeaderboardCrewViewModel = {
  id: string;
  name: string;
  tag: string;
  initials: string;
  emblemSrc: string | null;
  verified: boolean;
  tone: AvatarTone;
};

export type LeaderboardEntryViewModel = {
  id: string;
  rank: number;
  rankTier: RankTier;
  movement: MovementDirection;
  movementValue: number | null;
  player: LeaderboardPlayerViewModel;
  crew: LeaderboardCrewViewModel | null;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  points: number;
  streak: number;
  winRate: number;
  isCurrentPlayer: boolean;
  lastUpdatedLabel: string;
};
