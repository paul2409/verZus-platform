// VERZUS M11.7 PROFILE PRIVACY TYPES

export const profilePrivacyAudiences = ["public", "friends", "private"] as const;
export type ProfilePrivacyAudience = (typeof profilePrivacyAudiences)[number];

export const profileVisibilityValues = ["public", "friends", "private"] as const;
export type ProfileVisibility = (typeof profileVisibilityValues)[number];

export const profilePrivacyFields = [
  "location",
  "crew",
  "statistics",
  "trustScore",
  "matchHistory",
  "gameHandles",
  "achievements",
  "availability",
] as const;
export type ProfilePrivacyField = (typeof profilePrivacyFields)[number];

export type ProfilePrivacySettings = {
  profileVisibility: ProfileVisibility;
  location: ProfilePrivacyAudience;
  crew: ProfilePrivacyAudience;
  statistics: ProfilePrivacyAudience;
  trustScore: ProfilePrivacyAudience;
  matchHistory: ProfilePrivacyAudience;
  gameHandles: ProfilePrivacyAudience;
  achievements: ProfilePrivacyAudience;
  availability: ProfilePrivacyAudience;
};

export type ProfilePrivacySnapshot = {
  playerId: string;
  version: number;
  updatedAt: string;
  settings: ProfilePrivacySettings;
  requestId: string;
  source: string;
  replayed: boolean;
};

export type ProfilePrivacyScenario =
  | "normal"
  | "stale"
  | "error"
  | "offline"
  | "slow"
  | "malformed"
  | "unauthorized"
  | "forbidden"
  | "not-found"
  | "maintenance";

export type ProfilePrivacySaveScenario =
  "normal" | "slow" | "error" | "conflict" | "unavailable" | "response-lost";

export type ProfilePrivacyUpdateCommand = {
  expectedVersion: number;
  settings: ProfilePrivacySettings;
};

export type ProfilePrivacyApiErrorShape = {
  code: string;
  message: string;
  requestId: string;
  retryable: boolean;
  fieldErrors?: Record<string, string[]>;
};
