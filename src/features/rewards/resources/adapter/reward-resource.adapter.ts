// VERZUS M10.3 REWARD RESOURCE ADAPTERS

import type {
  RewardAchievementsResource,
  RewardHistoryResource,
  RewardInventoryResource,
  RewardProgressResource,
  RewardResourceMeta,
  RewardSeasonResource,
  RewardResourceSnapshot,
} from "../model/reward-resource.types";
import {
  rewardAchievementsEnvelopeSchema,
  rewardHistoryEnvelopeSchema,
  rewardInventoryEnvelopeSchema,
  rewardProgressEnvelopeSchema,
  rewardResourceErrorEnvelopeSchema,
  rewardSeasonEnvelopeSchema,
} from "../schema/reward-resource.schema";

export class RewardResourceError extends Error {
  readonly code: string;
  readonly requestId: string;
  readonly retryable: boolean;

  constructor(input: { code: string; message: string; requestId: string; retryable: boolean }) {
    super(input.message);
    this.name = "RewardResourceError";
    this.code = input.code;
    this.requestId = input.requestId;
    this.retryable = input.retryable;
  }
}

function adaptMeta(meta: {
  request_id: string;
  fetched_at: string;
  freshness: "fresh" | "stale";
  source: "mock-reward-resource";
}): RewardResourceMeta {
  return {
    requestId: meta.request_id,
    fetchedAt: meta.fetched_at,
    freshness: meta.freshness,
    source: meta.source,
  };
}

function adaptSummary(item: {
  id: string;
  title: string;
  description: string;
  kind: "coins" | "xp" | "crate" | "cosmetic" | "boost";
  state: "locked" | "eligible" | "claimable" | "claiming" | "claimed" | "expired" | "revoked";
  amount_label: string;
  artwork_src: string;
  artwork_alt: string;
}) {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    kind: item.kind,
    state: item.state,
    amountLabel: item.amount_label,
    artworkSrc: item.artwork_src,
    artworkAlt: item.artwork_alt,
  };
}

function throwStructuredOrSchemaError(payload: unknown, resource: string): never {
  const failure = rewardResourceErrorEnvelopeSchema.safeParse(payload);
  if (failure.success) {
    throw new RewardResourceError({
      code: failure.data.error.code,
      message: failure.data.error.message,
      requestId: failure.data.error.request_id,
      retryable: failure.data.error.retryable,
    });
  }

  throw new RewardResourceError({
    code: `REWARD_${resource.toUpperCase()}_SCHEMA_INVALID`,
    message: `${resource} failed schema validation.`,
    requestId: `reward-${resource}-schema-invalid`,
    retryable: true,
  });
}

export function adaptRewardProgressPayload(payload: unknown): RewardResourceSnapshot<"progress"> {
  const result = rewardProgressEnvelopeSchema.safeParse(payload);
  if (!result.success) return throwStructuredOrSchemaError(payload, "progress");

  const raw = result.data.data;
  const data: RewardProgressResource = {
    progress: {
      currentLevel: raw.progress.current_level,
      nextLevel: raw.progress.next_level,
      currentXp: raw.progress.current_xp,
      targetXp: raw.progress.target_xp,
      remainingXp: raw.progress.remaining_xp,
      seasonLabel: raw.progress.season_label,
    },
    claimableRewards: raw.claimable_rewards.map(adaptSummary),
    track: raw.track.map((item) => ({ ...adaptSummary(item), level: item.level })),
  };

  return { data, meta: adaptMeta(result.data.meta) };
}

export function adaptRewardSeasonPayload(payload: unknown): RewardResourceSnapshot<"season"> {
  const result = rewardSeasonEnvelopeSchema.safeParse(payload);
  if (!result.success) return throwStructuredOrSchemaError(payload, "season");

  const raw = result.data.data.season;
  const data: RewardSeasonResource = {
    season: raw
      ? {
          seasonId: raw.season_id,
          label: raw.label,
          chapterLabel: raw.chapter_label,
          state: raw.state,
          startsAt: raw.starts_at,
          endsAt: raw.ends_at,
          daysRemaining: raw.days_remaining,
          currentTier: raw.current_tier,
          totalTiers: raw.total_tiers,
          currentSeasonXp: raw.current_season_xp,
          targetSeasonXp: raw.target_season_xp,
          weeklyXpEarned: raw.weekly_xp_earned,
          weeklyXpCap: raw.weekly_xp_cap,
          boostMultiplier: raw.boost_multiplier,
          objectives: raw.objectives.map((objective) => ({
            id: objective.id,
            title: objective.title,
            description: objective.description,
            progressCurrent: objective.progress_current,
            progressTarget: objective.progress_target,
            xpReward: objective.xp_reward,
            completed: objective.completed,
          })),
          milestones: raw.milestones.map((milestone) => ({
            id: milestone.id,
            tier: milestone.tier,
            title: milestone.title,
            description: milestone.description,
            state: milestone.state,
            requirementLabel: milestone.requirement_label,
            rewardId: milestone.reward_id,
          })),
        }
      : null,
  };

  return { data, meta: adaptMeta(result.data.meta) };
}

export function adaptRewardInventoryPayload(payload: unknown): RewardResourceSnapshot<"inventory"> {
  const result = rewardInventoryEnvelopeSchema.safeParse(payload);
  if (!result.success) return throwStructuredOrSchemaError(payload, "inventory");

  const data: RewardInventoryResource = {
    version: result.data.data.version,
    items: result.data.data.items.map((item) => ({
      ...adaptSummary(item),
      sourceLabel: item.source_label,
      requirementLabel: item.requirement_label,
      availabilityLabel: item.availability_label,
      stateDetail: item.state_detail,
      ...(item.claim_reference ? { claimReference: item.claim_reference } : {}),
      ...(item.claimed_at_label ? { claimedAtLabel: item.claimed_at_label } : {}),
      ...(item.expires_at_label ? { expiresAtLabel: item.expires_at_label } : {}),
      ...(item.revoked_reason ? { revokedReason: item.revoked_reason } : {}),
    })),
  };

  return { data, meta: adaptMeta(result.data.meta) };
}

export function adaptRewardHistoryPayload(payload: unknown): RewardResourceSnapshot<"history"> {
  const result = rewardHistoryEnvelopeSchema.safeParse(payload);
  if (!result.success) return throwStructuredOrSchemaError(payload, "history");

  const data: RewardHistoryResource = {
    items: result.data.data.items.map((item) => ({
      ...adaptSummary(item),
      sourceLabel: item.source_label,
      claimedAtLabel: item.claimed_at_label,
    })),
  };

  return { data, meta: adaptMeta(result.data.meta) };
}

export function adaptRewardAchievementsPayload(
  payload: unknown,
): RewardResourceSnapshot<"achievements"> {
  const result = rewardAchievementsEnvelopeSchema.safeParse(payload);
  if (!result.success) return throwStructuredOrSchemaError(payload, "achievements");

  const data: RewardAchievementsResource = {
    items: result.data.data.items.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      state: item.state,
      progressCurrent: item.progress_current,
      progressTarget: item.progress_target,
      rewardId: item.reward_id,
      artworkSrc: item.artwork_src,
      artworkAlt: item.artwork_alt,
    })),
  };

  return { data, meta: adaptMeta(result.data.meta) };
}
