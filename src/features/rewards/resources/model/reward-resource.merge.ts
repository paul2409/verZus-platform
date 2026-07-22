// VERZUS M10.3 REWARD RESOURCE VIEW-MODEL MERGE
// VERZUS M10.6 ACHIEVEMENT SUMMARY COMPOSITION

import type { RewardAchievementSummary } from "../../achievements";
import type { RewardsFoundationModel } from "../../foundation";
import type { RewardInventoryItem } from "../../inventory";
import type { RewardSeasonProgress } from "../../progression";
import type { RewardResourceSnapshotMap } from "./reward-resource.types";

export type RewardResourceViewModel = {
  foundation: RewardsFoundationModel;
  inventory: RewardInventoryItem[];
  season: RewardSeasonProgress | null;
  achievements: RewardAchievementSummary[];
};

export function mergeRewardResourceSnapshots(
  fallbackFoundation: RewardsFoundationModel,
  fallbackInventory: RewardInventoryItem[],
  fallbackSeason: RewardSeasonProgress | null,
  fallbackAchievements: RewardAchievementSummary[],
  snapshots: RewardResourceSnapshotMap,
): RewardResourceViewModel {
  return {
    foundation: {
      progress: snapshots.progress?.data.progress ?? fallbackFoundation.progress,
      claimableRewards:
        snapshots.progress?.data.claimableRewards ?? fallbackFoundation.claimableRewards,
      track: snapshots.progress?.data.track ?? fallbackFoundation.track,
      history: snapshots.history?.data.items ?? fallbackFoundation.history,
    },
    inventory: snapshots.inventory?.data.items ?? fallbackInventory,
    season: snapshots.season ? snapshots.season.data.season : fallbackSeason,
    achievements: snapshots.achievements?.data.items ?? fallbackAchievements,
  };
}
