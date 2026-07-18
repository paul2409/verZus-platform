// VERZUS M10.3 REWARD RESOURCE MOCK SERVICE
// VERZUS M10.4 CLAIM-CONFIRMED RESOURCE READ MODELS

import { rewardAchievementSummaryMock } from "../../achievements";
import { rewardsFoundationMock } from "../../foundation";
import { rewardSeasonProgressMock } from "../../progression";
import { getRewardClaimReadModel } from "../../claims/server/reward-claim.store";
import type { RewardInventoryItem } from "../../inventory";
import type { RewardResourceName, RewardResourceScenario } from "../model/reward-resource.types";

export function normalizeRewardResourceScenario(value: string | null): RewardResourceScenario {
  switch (value) {
    case "stale":
    case "empty":
    case "error":
    case "malformed":
    case "slow":
    case "offline":
    case "unauthorized":
    case "forbidden":
    case "not-found":
    case "maintenance":
      return value;
    default:
      return "normal";
  }
}

function serializeSummary(item: {
  id: string;
  title: string;
  description: string;
  kind: "coins" | "xp" | "crate" | "cosmetic" | "boost";
  state: "locked" | "eligible" | "claimable" | "claiming" | "claimed" | "expired" | "revoked";
  amountLabel: string;
  artworkSrc: string;
  artworkAlt: string;
}) {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    kind: item.kind,
    state: item.state,
    amount_label: item.amountLabel,
    artwork_src: item.artworkSrc,
    artwork_alt: item.artworkAlt,
  };
}

function serializeInventoryItem(item: RewardInventoryItem) {
  return {
    ...serializeSummary(item),
    source_label: item.sourceLabel,
    requirement_label: item.requirementLabel,
    availability_label: item.availabilityLabel,
    state_detail: item.stateDetail,
    ...(item.claimReference ? { claim_reference: item.claimReference } : {}),
    ...(item.claimedAtLabel ? { claimed_at_label: item.claimedAtLabel } : {}),
    ...(item.expiresAtLabel ? { expires_at_label: item.expiresAtLabel } : {}),
    ...(item.revokedReason ? { revoked_reason: item.revokedReason } : {}),
  };
}

export function serializeRewardResource(
  resource: RewardResourceName,
  scenario: RewardResourceScenario,
): unknown {
  const empty = scenario === "empty";
  const claimReadModel = getRewardClaimReadModel();
  const inventoryById = new Map(claimReadModel.inventory.map((item) => [item.id, item]));

  switch (resource) {
    case "progress": {
      const claimableRewards = rewardsFoundationMock.claimableRewards
        .map((item) => {
          const inventoryItem = inventoryById.get(item.id);
          return inventoryItem ? { ...item, state: inventoryItem.state } : item;
        })
        .filter((item) => item.state === "claimable");

      const track = rewardsFoundationMock.track.map((item) => {
        const inventoryItem = inventoryById.get(item.id);
        return inventoryItem ? { ...item, state: inventoryItem.state } : item;
      });

      return {
        progress: {
          current_level: rewardsFoundationMock.progress.currentLevel,
          next_level: rewardsFoundationMock.progress.nextLevel,
          current_xp: rewardsFoundationMock.progress.currentXp,
          target_xp: rewardsFoundationMock.progress.targetXp,
          remaining_xp: rewardsFoundationMock.progress.remainingXp,
          season_label: rewardsFoundationMock.progress.seasonLabel,
        },
        claimable_rewards: empty ? [] : claimableRewards.map(serializeSummary),
        track: empty
          ? []
          : track.map((item) => ({
              ...serializeSummary(item),
              level: item.level,
            })),
      };
    }
    case "season":
      return {
        season: empty
          ? null
          : {
              season_id: rewardSeasonProgressMock.seasonId,
              label: rewardSeasonProgressMock.label,
              chapter_label: rewardSeasonProgressMock.chapterLabel,
              state: rewardSeasonProgressMock.state,
              starts_at: rewardSeasonProgressMock.startsAt,
              ends_at: rewardSeasonProgressMock.endsAt,
              days_remaining: rewardSeasonProgressMock.daysRemaining,
              current_tier: rewardSeasonProgressMock.currentTier,
              total_tiers: rewardSeasonProgressMock.totalTiers,
              current_season_xp: rewardSeasonProgressMock.currentSeasonXp,
              target_season_xp: rewardSeasonProgressMock.targetSeasonXp,
              weekly_xp_earned: rewardSeasonProgressMock.weeklyXpEarned,
              weekly_xp_cap: rewardSeasonProgressMock.weeklyXpCap,
              boost_multiplier: rewardSeasonProgressMock.boostMultiplier,
              objectives: rewardSeasonProgressMock.objectives.map((objective) => ({
                id: objective.id,
                title: objective.title,
                description: objective.description,
                progress_current: objective.progressCurrent,
                progress_target: objective.progressTarget,
                xp_reward: objective.xpReward,
                completed: objective.completed,
              })),
              milestones: rewardSeasonProgressMock.milestones.map((milestone) => ({
                id: milestone.id,
                tier: milestone.tier,
                title: milestone.title,
                description: milestone.description,
                state: milestone.state,
                requirement_label: milestone.requirementLabel,
                reward_id: milestone.rewardId,
              })),
            },
      };
    case "inventory":
      return {
        version: claimReadModel.version,
        items: empty ? [] : claimReadModel.inventory.map(serializeInventoryItem),
      };
    case "history":
      return {
        items: empty
          ? []
          : claimReadModel.history.map((item) => ({
              ...serializeSummary(item),
              source_label: item.sourceLabel,
              claimed_at_label: item.claimedAtLabel,
            })),
      };
    case "achievements":
      return {
        items: empty
          ? []
          : rewardAchievementSummaryMock.map((item) => ({
              id: item.id,
              title: item.title,
              description: item.description,
              state: item.state,
              progress_current: item.progressCurrent,
              progress_target: item.progressTarget,
              reward_id: item.rewardId,
              artwork_src: item.artworkSrc,
              artwork_alt: item.artworkAlt,
            })),
      };
  }
}
