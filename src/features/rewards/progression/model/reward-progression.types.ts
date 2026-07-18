// VERZUS M10.5 PROGRESSION AND SEASON TYPES

export const rewardSeasonStates = ["upcoming", "active", "completed", "ended"] as const;
export type RewardSeasonState = (typeof rewardSeasonStates)[number];

export const rewardSeasonMilestoneStates = ["completed", "current", "upcoming", "locked"] as const;
export type RewardSeasonMilestoneState = (typeof rewardSeasonMilestoneStates)[number];

export type RewardSeasonObjective = {
  id: string;
  title: string;
  description: string;
  progressCurrent: number;
  progressTarget: number;
  xpReward: number;
  completed: boolean;
};

export type RewardSeasonMilestone = {
  id: string;
  tier: number;
  title: string;
  description: string;
  state: RewardSeasonMilestoneState;
  requirementLabel: string;
  rewardId: string | null;
};

export type RewardSeasonProgress = {
  seasonId: string;
  label: string;
  chapterLabel: string;
  state: RewardSeasonState;
  startsAt: string;
  endsAt: string;
  daysRemaining: number;
  currentTier: number;
  totalTiers: number;
  currentSeasonXp: number;
  targetSeasonXp: number;
  weeklyXpEarned: number;
  weeklyXpCap: number;
  boostMultiplier: number;
  objectives: RewardSeasonObjective[];
  milestones: RewardSeasonMilestone[];
};
