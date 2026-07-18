// VERZUS M10.6 ACHIEVEMENT DETAIL ADAPTER

import type { RewardAchievementDetailSnapshot } from "../model/reward-achievement.types";
import {
  rewardAchievementDetailEnvelopeSchema,
  rewardAchievementDetailErrorSchema,
} from "../schema/reward-achievement.schema";

export class RewardAchievementDetailError extends Error {
  readonly code: string;
  readonly requestId: string;
  readonly retryable: boolean;

  constructor(input: { code: string; message: string; requestId: string; retryable: boolean }) {
    super(input.message);
    this.name = "RewardAchievementDetailError";
    this.code = input.code;
    this.requestId = input.requestId;
    this.retryable = input.retryable;
  }
}

export function adaptRewardAchievementDetailPayload(
  payload: unknown,
): RewardAchievementDetailSnapshot {
  const parsed = rewardAchievementDetailEnvelopeSchema.safeParse(payload);
  if (!parsed.success) {
    const failure = rewardAchievementDetailErrorSchema.safeParse(payload);
    if (failure.success) {
      throw new RewardAchievementDetailError({
        code: failure.data.error.code,
        message: failure.data.error.message,
        requestId: failure.data.error.request_id,
        retryable: failure.data.error.retryable,
      });
    }
    throw new RewardAchievementDetailError({
      code: "REWARD_ACHIEVEMENT_DETAIL_SCHEMA_INVALID",
      message: "Achievement detail failed schema validation.",
      requestId: "reward-achievement-detail-schema-invalid",
      retryable: true,
    });
  }

  const raw = parsed.data.data;
  return {
    data: {
      id: raw.id,
      title: raw.title,
      description: raw.description,
      state: raw.state,
      progressCurrent: raw.progress_current,
      progressTarget: raw.progress_target,
      rewardId: raw.reward_id,
      artworkSrc: raw.artwork_src,
      artworkAlt: raw.artwork_alt,
      categoryLabel: raw.category_label,
      rarity: raw.rarity,
      requirementLabel: raw.requirement_label,
      unlockedAt: raw.unlocked_at,
      unlockedAtLabel: raw.unlocked_at_label,
      linkedReward: raw.linked_reward
        ? {
            id: raw.linked_reward.id,
            title: raw.linked_reward.title,
            amountLabel: raw.linked_reward.amount_label,
            state: raw.linked_reward.state,
          }
        : null,
      provenance: raw.provenance.map((item) => ({
        sourceType: item.source_type,
        sourceId: item.source_id,
        sourceLabel: item.source_label,
        verifiedAt: item.verified_at,
        verifiedAtLabel: item.verified_at_label,
      })),
    },
    meta: {
      requestId: parsed.data.meta.request_id,
      fetchedAt: parsed.data.meta.fetched_at,
    },
  };
}
