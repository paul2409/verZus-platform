// VERZUS M10.6 ACHIEVEMENT DETAIL SERVICE

import { rewardAchievementDetailMockById } from "../mocks/reward-achievement.mock";

export function getRewardAchievementDetailFixture(achievementId: string) {
  return rewardAchievementDetailMockById[achievementId] ?? null;
}

export function serializeRewardAchievementDetail(achievementId: string): unknown | null {
  const item = getRewardAchievementDetailFixture(achievementId);
  if (!item) return null;

  return {
    id: item.id,
    title: item.title,
    description: item.description,
    state: item.state,
    progress_current: item.progressCurrent,
    progress_target: item.progressTarget,
    reward_id: item.rewardId,
    artwork_src: item.artworkSrc,
    artwork_alt: item.artworkAlt,
    category_label: item.categoryLabel,
    rarity: item.rarity,
    requirement_label: item.requirementLabel,
    unlocked_at: item.unlockedAt,
    unlocked_at_label: item.unlockedAtLabel,
    linked_reward: item.linkedReward
      ? {
          id: item.linkedReward.id,
          title: item.linkedReward.title,
          amount_label: item.linkedReward.amountLabel,
          state: item.linkedReward.state,
        }
      : null,
    provenance: item.provenance.map((entry) => ({
      source_type: entry.sourceType,
      source_id: entry.sourceId,
      source_label: entry.sourceLabel,
      verified_at: entry.verifiedAt,
      verified_at_label: entry.verifiedAtLabel,
    })),
  };
}
