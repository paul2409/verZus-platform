// VERZUS M11.2 PUBLIC PROFILE TYPES AND PERMISSION CONTRACT

import type {
  PlayerAchievementPreview,
  PlayerCrewIdentity,
  PlayerMatchResult,
  PlayerProfileStats,
  PlayerProfileVisibility,
} from "../../foundation";

export const publicProfileViewerModes = [
  "anonymous",
  "member",
  "friend",
  "owner",
  "blocked",
] as const;

export type PublicProfileViewerMode = (typeof publicProfileViewerModes)[number];
export type PublicProfileAccess = "full" | "limited" | "blocked";
export type ProfileFieldAudience = "public" | "friends" | "private";

export type PublicProfileIdentityRecord = {
  id: string;
  displayName: string;
  handle: string;
  title: string;
  bio: string;
  locationLabel: string;
  avatarSrc: string | null;
  avatarAlt: string;
  bannerSrc: string;
  verified: boolean;
  profileVisibility: PlayerProfileVisibility;
  joinedLabel: string;
};

export type PublicProfileGameRecord = {
  id: string;
  gameLabel: string;
  handle: string;
  platformLabel: string;
  rankLabel: string;
  recordLabel: string;
  verified: boolean;
};

export type PublicProfileMatchRecord = {
  id: string;
  opponentLabel: string;
  competitionLabel: string;
  gameLabel: string;
  scoreLabel: string;
  result: PlayerMatchResult;
  playedAtLabel: string;
  href: string;
};

export type PublicProfileAvailabilityRecord = {
  state: "available" | "limited" | "unavailable";
  publicLabel: string;
  privateDetail: string;
  nextWindowLabel: string;
};

export type PublicProfilePrivacyPolicy = {
  location: ProfileFieldAudience;
  crew: ProfileFieldAudience;
  statistics: ProfileFieldAudience;
  trustScore: ProfileFieldAudience;
  matchHistory: ProfileFieldAudience;
  gameHandles: ProfileFieldAudience;
  achievements: ProfileFieldAudience;
  availability: ProfileFieldAudience;
};

export type PublicPlayerProfileRecord = {
  identity: PublicProfileIdentityRecord;
  crew: PlayerCrewIdentity | null;
  stats: PlayerProfileStats;
  games: readonly PublicProfileGameRecord[];
  recentMatches: readonly PublicProfileMatchRecord[];
  achievements: readonly PlayerAchievementPreview[];
  availability: PublicProfileAvailabilityRecord;
  privacy: PublicProfilePrivacyPolicy;
};

export type PublicProfilePermissions = {
  canEdit: boolean;
  canViewLocation: boolean;
  canViewCrew: boolean;
  canViewStatistics: boolean;
  canViewTrustScore: boolean;
  canViewMatchHistory: boolean;
  canViewGameHandles: boolean;
  canViewAchievements: boolean;
  canViewAvailability: boolean;
};

export type PublicPlayerIdentityView = {
  id: string;
  displayName: string;
  handle: string;
  title: string;
  bio: string | null;
  locationLabel: string | null;
  avatarSrc: string | null;
  avatarAlt: string;
  bannerSrc: string;
  verified: boolean;
  visibility: PlayerProfileVisibility;
  joinedLabel: string;
};

export type PublicGameIdentityView = Omit<PublicProfileGameRecord, "handle"> & {
  handle: string | null;
};

export type PublicAvailabilityView = {
  state: PublicProfileAvailabilityRecord["state"];
  label: string;
  detail: string | null;
  nextWindowLabel: string | null;
};

export type PublicPlayerProfileViewModel = {
  access: PublicProfileAccess;
  viewerMode: PublicProfileViewerMode;
  identity: PublicPlayerIdentityView;
  permissions: PublicProfilePermissions;
  crew: PlayerCrewIdentity | null;
  stats: (Omit<PlayerProfileStats, "trustScore"> & { trustScore: number | null }) | null;
  games: readonly PublicGameIdentityView[];
  recentMatches: readonly PublicProfileMatchRecord[];
  achievements: readonly PlayerAchievementPreview[];
  availability: PublicAvailabilityView | null;
  redactedFields: readonly string[];
};
