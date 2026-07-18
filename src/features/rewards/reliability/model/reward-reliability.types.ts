// VERZUS M10.7 REWARD RELIABILITY TYPES

export const rewardWidgetNames = [
  "progress",
  "claimable",
  "inventory",
  "season",
  "achievements",
  "recent-history",
  "audit-history",
] as const;

export type RewardWidgetName = (typeof rewardWidgetNames)[number];

export const rewardWidgetScenarios = ["normal", "crash"] as const;

export type RewardWidgetScenario = (typeof rewardWidgetScenarios)[number];
