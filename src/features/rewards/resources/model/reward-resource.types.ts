// VERZUS M10.3 REWARD RESOURCE DOMAIN TYPES
// VERZUS M10.6 ACHIEVEMENT SUMMARY OWNERSHIP
// VERZUS M10.7 CONTROLLED EDGE STATES AND RETRY VISIBILITY

import type { RewardAchievementSummary } from "../../achievements";
import type {
  RewardHistoryItem,
  RewardProgress,
  RewardSummary,
  RewardTrackItem,
} from "../../foundation";
import type { RewardInventoryItem } from "../../inventory";
import type { RewardSeasonProgress } from "../../progression";

export const rewardResourceNames = [
  "progress",
  "season",
  "inventory",
  "history",
  "achievements",
] as const;

export type RewardResourceName = (typeof rewardResourceNames)[number];

export const rewardResourceScenarios = [
  "normal",
  "stale",
  "empty",
  "error",
  "malformed",
  "slow",
  "offline",
  "unauthorized",
  "forbidden",
  "not-found",
  "maintenance",
] as const;

export type RewardResourceScenario = (typeof rewardResourceScenarios)[number];

export type RewardResourceMeta = {
  requestId: string;
  fetchedAt: string;
  freshness: "fresh" | "stale";
  source: "production-reward-resource";
};

export type RewardProgressResource = {
  progress: RewardProgress;
  claimableRewards: RewardSummary[];
  track: RewardTrackItem[];
};

export type RewardSeasonResource = {
  season: RewardSeasonProgress | null;
};

export type RewardInventoryResource = {
  version: number;
  items: RewardInventoryItem[];
};

export type RewardHistoryResource = {
  items: RewardHistoryItem[];
};

export type RewardAchievementsResource = {
  items: RewardAchievementSummary[];
};

export type RewardResourceDataMap = {
  progress: RewardProgressResource;
  season: RewardSeasonResource;
  inventory: RewardInventoryResource;
  history: RewardHistoryResource;
  achievements: RewardAchievementsResource;
};

export type RewardResourceSnapshot<Name extends RewardResourceName> = {
  data: RewardResourceDataMap[Name];
  meta: RewardResourceMeta;
};

export type RewardResourceSnapshotMap = {
  [Name in RewardResourceName]?: RewardResourceSnapshot<Name>;
};

export type RewardResourceHealthState =
  | "loading"
  | "success"
  | "stale"
  | "empty"
  | "error"
  | "offline"
  | "retrying"
  | "unauthorized"
  | "forbidden"
  | "not-found"
  | "maintenance";

export type RewardResourceHealth = {
  name: RewardResourceName;
  state: RewardResourceHealthState;
  code: string | null;
  requestId: string | null;
  message: string | null;
  retryable: boolean;
};
