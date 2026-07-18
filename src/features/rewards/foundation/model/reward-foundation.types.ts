// VERZUS M10.1 REWARDS FOUNDATION TYPES

export const rewardStates = [
  "locked",
  "eligible",
  "claimable",
  "claiming",
  "claimed",
  "expired",
  "revoked",
] as const;

export type RewardState = (typeof rewardStates)[number];

export type RewardKind = "coins" | "xp" | "crate" | "cosmetic" | "boost";

export type RewardProgress = {
  currentLevel: number;
  nextLevel: number;
  currentXp: number;
  targetXp: number;
  remainingXp: number;
  seasonLabel: string;
};

export type RewardSummary = {
  id: string;
  title: string;
  description: string;
  kind: RewardKind;
  state: RewardState;
  amountLabel: string;
  artworkSrc: string;
  artworkAlt: string;
};

export type RewardTrackItem = RewardSummary & {
  level: number;
};

export type RewardHistoryItem = RewardSummary & {
  sourceLabel: string;
  claimedAtLabel: string;
};

export type RewardsFoundationModel = {
  progress: RewardProgress;
  claimableRewards: RewardSummary[];
  track: RewardTrackItem[];
  history: RewardHistoryItem[];
};
