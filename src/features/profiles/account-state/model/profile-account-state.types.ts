// VERZUS M11.7 PROFILE ACCOUNT-STATE TYPES

export const profileAccountStatuses = ["active", "empty", "suspended", "blocked"] as const;
export type ProfileAccountStatus = (typeof profileAccountStatuses)[number];

export const profileAccountStateScenarios = [
  "normal",
  "empty",
  "suspended",
  "blocked",
  "error",
  "offline",
  "slow",
  "malformed",
  "maintenance",
] as const;
export type ProfileAccountStateScenario = (typeof profileAccountStateScenarios)[number];

export type ProfileAccountState = {
  status: ProfileAccountStatus;
  profileId: string | null;
  title: string;
  message: string;
  caseReference: string | null;
  reviewAtLabel: string | null;
  canEditProfile: boolean;
  canViewPublicProfile: boolean;
  requestId: string;
  source: string;
};

export type PublicProfileAccountState = {
  status: "active" | "suspended" | "blocked";
  playerId: string;
  displayName: string;
  handle: string;
  title: string;
  message: string;
  caseReference: string | null;
};
