import type { RewardAchievementSummary } from "../achievements";
import type { RewardInventoryItem } from "../inventory";
import type { RewardSeasonProgress } from "../progression";
import type { RewardsFoundationModel } from "./model/reward-foundation.types";

export const emptyRewardsFoundation: RewardsFoundationModel = {
  progress: {
    currentLevel: 0,
    nextLevel: 1,
    currentXp: 0,
    targetXp: 1000,
    remainingXp: 1000,
    seasonLabel: "No active season",
  },
  claimableRewards: [],
  track: [],
  history: [],
};

export const emptyRewardInventory: RewardInventoryItem[] = [];
export const emptyRewardSeason: RewardSeasonProgress | null = null;
export const emptyRewardAchievements: RewardAchievementSummary[] = [];
