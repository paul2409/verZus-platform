// VERZUS M10.6 ACHIEVEMENT DETAIL DOMAIN TYPES

export const rewardAchievementStates = ["locked", "in_progress", "unlocked"] as const;
export type RewardAchievementState = (typeof rewardAchievementStates)[number];

export const rewardAchievementRarities = ["common", "rare", "epic", "legendary"] as const;
export type RewardAchievementRarity = (typeof rewardAchievementRarities)[number];

export type RewardAchievementSummary = {
  id: string;
  title: string;
  description: string;
  state: RewardAchievementState;
  progressCurrent: number;
  progressTarget: number;
  rewardId: string | null;
  artworkSrc: string;
  artworkAlt: string;
};

export type RewardAchievementProvenance = {
  sourceType: "match" | "competition" | "crew" | "season";
  sourceId: string;
  sourceLabel: string;
  verifiedAt: string;
  verifiedAtLabel: string;
};

export type RewardAchievementLinkedReward = {
  id: string;
  title: string;
  amountLabel: string;
  state: "locked" | "claimable" | "claimed";
} | null;

export type RewardAchievementDetail = RewardAchievementSummary & {
  categoryLabel: string;
  rarity: RewardAchievementRarity;
  requirementLabel: string;
  unlockedAt: string | null;
  unlockedAtLabel: string | null;
  linkedReward: RewardAchievementLinkedReward;
  provenance: RewardAchievementProvenance[];
};

export type RewardAchievementDetailMeta = {
  requestId: string;
  fetchedAt: string;
};

export type RewardAchievementDetailSnapshot = {
  data: RewardAchievementDetail;
  meta: RewardAchievementDetailMeta;
};
