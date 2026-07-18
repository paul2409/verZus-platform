// VERZUS M10.2 REWARD INVENTORY VIEW MODEL

import type { RewardState } from "../../foundation";
import type {
  RewardInventoryCounts,
  RewardInventoryFilter,
  RewardInventoryItem,
  RewardStatePresentation,
} from "./reward-inventory.types";

const rewardStateOrder: Record<RewardState, number> = {
  claimable: 0,
  eligible: 1,
  claiming: 2,
  locked: 3,
  claimed: 4,
  expired: 5,
  revoked: 6,
};

export const rewardStatePresentations: Record<RewardState, RewardStatePresentation> = {
  claimable: {
    label: "Claimable",
    helper: "Verified and ready for a server-authoritative claim.",
    tone: "positive",
  },
  eligible: {
    label: "Eligible",
    helper: "Requirements are complete; the claim window has not opened yet.",
    tone: "information",
  },
  claiming: {
    label: "Claiming",
    helper: "A claim request is being confirmed. Do not submit another request.",
    tone: "special",
  },
  locked: {
    label: "Locked",
    helper: "Complete the listed requirement before this reward becomes available.",
    tone: "neutral",
  },
  claimed: {
    label: "Claimed",
    helper: "This reward is already recorded in the player inventory.",
    tone: "positive",
  },
  expired: {
    label: "Expired",
    helper: "The claim window closed before this reward was claimed.",
    tone: "warning",
  },
  revoked: {
    label: "Revoked",
    helper: "The reward was removed by an auditable correction or policy decision.",
    tone: "negative",
  },
};

export const rewardInventoryFilterLabels: Record<RewardInventoryFilter, string> = {
  all: "All",
  claimable: "Claimable",
  eligible: "Eligible",
  claiming: "Claiming",
  locked: "Locked",
  claimed: "Claimed",
  expired: "Expired",
  revoked: "Revoked",
};

export function buildRewardInventoryCounts(items: RewardInventoryItem[]): RewardInventoryCounts {
  const counts: RewardInventoryCounts = {
    all: items.length,
    locked: 0,
    eligible: 0,
    claimable: 0,
    claiming: 0,
    claimed: 0,
    expired: 0,
    revoked: 0,
  };

  for (const item of items) counts[item.state] += 1;
  return counts;
}

export function filterRewardInventory(
  items: RewardInventoryItem[],
  filter: RewardInventoryFilter,
): RewardInventoryItem[] {
  return items
    .filter((item) => filter === "all" || item.state === filter)
    .sort((left, right) => {
      const stateDifference = rewardStateOrder[left.state] - rewardStateOrder[right.state];
      if (stateDifference !== 0) return stateDifference;
      return left.title.localeCompare(right.title, "en", { sensitivity: "base" });
    });
}
