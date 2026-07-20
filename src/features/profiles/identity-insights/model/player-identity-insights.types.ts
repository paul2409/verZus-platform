// VERZUS M11.6 ACHIEVEMENTS, GAME IDENTITIES AND TRUST HISTORY TYPES

export type ProfileInsightScenario =
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

export type ProfileInsightResourceName = "achievements" | "game-identities" | "trust-history";

export type ProfileAchievementCategory = "competitive" | "crew" | "trust" | "season";
export type ProfileAchievementCategoryFilter = "all" | ProfileAchievementCategory;
export type ProfileAchievementState = "unlocked" | "in-progress" | "locked";
export type ProfileAchievementStateFilter = "all" | ProfileAchievementState;
export type ProfileAchievementRarity = "common" | "rare" | "epic" | "legendary";

export type ProfileAchievementEntry = {
  id: string;
  title: string;
  description: string;
  category: ProfileAchievementCategory;
  rarity: ProfileAchievementRarity;
  state: ProfileAchievementState;
  progressCurrent: number;
  progressTarget: number;
  progressLabel: string;
  unlockedAtLabel: string | null;
  rewardLabel: string | null;
  evidenceLabel: string;
};

export type ProfileAchievementPage = {
  entries: readonly ProfileAchievementEntry[];
  page: number;
  pageSize: number;
  totalEntries: number;
  totalPages: number;
  unlockedCount: number;
  inProgressCount: number;
  lockedCount: number;
  freshness: "fresh" | "stale";
  requestId: string;
  generatedAt: string;
};

export type ProfileGameIdentityStatus = "verified" | "pending" | "expired";
export type ProfileGameIdentityVisibility = "public" | "friends" | "private";

export type ProfileGameIdentityEntry = {
  id: string;
  gameLabel: string;
  handle: string;
  platformLabel: string;
  rankLabel: string;
  recordLabel: string;
  status: ProfileGameIdentityStatus;
  visibility: ProfileGameIdentityVisibility;
  linkedAtLabel: string;
  lastVerifiedAtLabel: string | null;
};

export type ProfileGameIdentityCollection = {
  entries: readonly ProfileGameIdentityEntry[];
  verifiedCount: number;
  pendingCount: number;
  privateCount: number;
  freshness: "fresh" | "stale";
  requestId: string;
  generatedAt: string;
};

export type ProfileTrustEventType =
  "verified-result" | "sportsmanship" | "reliability" | "dispute" | "penalty" | "manual-review";

export type ProfileTrustHistoryEntry = {
  id: string;
  type: ProfileTrustEventType;
  title: string;
  detail: string;
  delta: number;
  scoreAfter: number;
  occurredAtLabel: string;
  referenceLabel: string;
  actorLabel: string;
};

export type ProfileTrustCategory = {
  id: string;
  label: string;
  score: number;
  detail: string;
};

export type ProfileTrustHistoryPage = {
  score: number;
  statusLabel: string;
  trend: number;
  categories: readonly ProfileTrustCategory[];
  entries: readonly ProfileTrustHistoryEntry[];
  page: number;
  pageSize: number;
  totalEntries: number;
  totalPages: number;
  freshness: "fresh" | "stale";
  requestId: string;
  generatedAt: string;
};
