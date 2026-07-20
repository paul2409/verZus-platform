// VERZUS M11.1 PLAYER PROFILE FOUNDATION TYPES

export type PlayerProfileVisibility = "public" | "friends" | "private";
export type PlayerAvailabilityState = "available" | "limited" | "unavailable";
export type PlayerMatchResult = "win" | "loss" | "draw";
export type PlayerAchievementRarity = "common" | "rare" | "epic" | "legendary";

export type PlayerProfileIdentity = {
  id: string;
  displayName: string;
  handle: string;
  title: string;
  bio: string;
  locationLabel: string;
  countryCode: string;
  avatarSrc: string | null;
  avatarAlt: string;
  bannerSrc: string;
  verified: boolean;
  profileVisibility: PlayerProfileVisibility;
  joinedLabel: string;
};

export type PlayerCrewIdentity = {
  id: string;
  name: string;
  tag: string;
  roleLabel: string;
  href: string;
};

export type PlayerProfileStats = {
  matches: number;
  wins: number;
  losses: number;
  draws: number;
  winRateLabel: string;
  rating: number;
  weeklyRank: number;
  points: number;
  trustScore: number;
  currentStreakLabel: string;
};

export type PlayerGameIdentity = {
  id: string;
  gameLabel: string;
  handle: string;
  platformLabel: string;
  rankLabel: string;
  recordLabel: string;
  verified: boolean;
};

export type PlayerRecentMatch = {
  id: string;
  opponentLabel: string;
  competitionLabel: string;
  gameLabel: string;
  scoreLabel: string;
  result: PlayerMatchResult;
  playedAtLabel: string;
  href: string;
};

export type PlayerAchievementPreview = {
  id: string;
  title: string;
  rarity: PlayerAchievementRarity;
  progressLabel: string;
  unlocked: boolean;
};

export type PlayerAvailability = {
  state: PlayerAvailabilityState;
  label: string;
  detail: string;
  nextWindowLabel: string;
};

export type PlayerProfileViewModel = {
  identity: PlayerProfileIdentity;
  crew: PlayerCrewIdentity | null;
  stats: PlayerProfileStats;
  games: readonly PlayerGameIdentity[];
  recentMatches: readonly PlayerRecentMatch[];
  achievements: readonly PlayerAchievementPreview[];
  availability: PlayerAvailability;
};
