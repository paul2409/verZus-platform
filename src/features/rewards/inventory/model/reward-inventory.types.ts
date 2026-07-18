// VERZUS M10.2 REWARD INVENTORY TYPES

import type { RewardState, RewardSummary } from "../../foundation";

export const rewardInventoryFilters = [
  "all",
  "claimable",
  "eligible",
  "claiming",
  "locked",
  "claimed",
  "expired",
  "revoked",
] as const;

export type RewardInventoryFilter = (typeof rewardInventoryFilters)[number];

export type RewardInventoryItem = RewardSummary & {
  sourceLabel: string;
  requirementLabel: string;
  availabilityLabel: string;
  stateDetail: string;
  claimReference?: string;
  claimedAtLabel?: string;
  expiresAtLabel?: string;
  revokedReason?: string;
};

export type RewardStatePresentation = {
  label: string;
  helper: string;
  tone: "neutral" | "information" | "positive" | "warning" | "negative" | "special";
};

export type RewardInventoryCounts = Record<RewardState, number> & {
  all: number;
};
