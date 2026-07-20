// VERZUS M11.6 PROFILE INSIGHT ADAPTERS

import type {
  ProfileAchievementPage,
  ProfileGameIdentityCollection,
  ProfileTrustHistoryPage,
} from "../model/player-identity-insights.types";
import {
  rawProfileAchievementPageSchema,
  rawProfileGameIdentityCollectionSchema,
  rawProfileInsightErrorSchema,
  rawProfileTrustHistoryPageSchema,
} from "../schema/player-identity-insights.schema";

export class ProfileInsightResourceError extends Error {
  readonly code: string;
  readonly requestId: string;
  readonly retryable: boolean;
  readonly status: number | undefined;

  constructor(input: {
    code: string;
    message: string;
    requestId: string;
    retryable: boolean;
    status?: number;
  }) {
    super(input.message);
    this.name = "ProfileInsightResourceError";
    this.code = input.code;
    this.requestId = input.requestId;
    this.retryable = input.retryable;
    this.status = input.status;
  }
}

export function adaptProfileAchievementPage(payload: unknown): ProfileAchievementPage {
  const parsed = rawProfileAchievementPageSchema.parse(payload);
  return {
    entries: parsed.data.entries.map((entry) => ({
      id: entry.id,
      title: entry.title,
      description: entry.description,
      category: entry.category,
      rarity: entry.rarity,
      state: entry.state,
      progressCurrent: entry.progress_current,
      progressTarget: entry.progress_target,
      progressLabel: entry.progress_label,
      unlockedAtLabel: entry.unlocked_at_label,
      rewardLabel: entry.reward_label,
      evidenceLabel: entry.evidence_label,
    })),
    page: parsed.data.page,
    pageSize: parsed.data.page_size,
    totalEntries: parsed.data.total_entries,
    totalPages: parsed.data.total_pages,
    unlockedCount: parsed.data.unlocked_count,
    inProgressCount: parsed.data.in_progress_count,
    lockedCount: parsed.data.locked_count,
    freshness: parsed.data.freshness,
    requestId: parsed.meta.request_id,
    generatedAt: parsed.meta.generated_at,
  };
}

export function adaptProfileGameIdentityCollection(
  payload: unknown,
): ProfileGameIdentityCollection {
  const parsed = rawProfileGameIdentityCollectionSchema.parse(payload);
  return {
    entries: parsed.data.entries.map((entry) => ({
      id: entry.id,
      gameLabel: entry.game_label,
      handle: entry.handle,
      platformLabel: entry.platform_label,
      rankLabel: entry.rank_label,
      recordLabel: entry.record_label,
      status: entry.status,
      visibility: entry.visibility,
      linkedAtLabel: entry.linked_at_label,
      lastVerifiedAtLabel: entry.last_verified_at_label,
    })),
    verifiedCount: parsed.data.verified_count,
    pendingCount: parsed.data.pending_count,
    privateCount: parsed.data.private_count,
    freshness: parsed.data.freshness,
    requestId: parsed.meta.request_id,
    generatedAt: parsed.meta.generated_at,
  };
}

export function adaptProfileTrustHistory(payload: unknown): ProfileTrustHistoryPage {
  const parsed = rawProfileTrustHistoryPageSchema.parse(payload);
  return {
    score: parsed.data.score,
    statusLabel: parsed.data.status_label,
    trend: parsed.data.trend,
    categories: parsed.data.categories.map((category) => ({
      id: category.id,
      label: category.label,
      score: category.score,
      detail: category.detail,
    })),
    entries: parsed.data.entries.map((entry) => ({
      id: entry.id,
      type: entry.type,
      title: entry.title,
      detail: entry.detail,
      delta: entry.delta,
      scoreAfter: entry.score_after,
      occurredAtLabel: entry.occurred_at_label,
      referenceLabel: entry.reference_label,
      actorLabel: entry.actor_label,
    })),
    page: parsed.data.page,
    pageSize: parsed.data.page_size,
    totalEntries: parsed.data.total_entries,
    totalPages: parsed.data.total_pages,
    freshness: parsed.data.freshness,
    requestId: parsed.meta.request_id,
    generatedAt: parsed.meta.generated_at,
  };
}

export function adaptProfileInsightError(payload: unknown, status: number) {
  const parsed = rawProfileInsightErrorSchema.safeParse(payload);
  if (parsed.success) {
    return new ProfileInsightResourceError({
      code: parsed.data.error.code,
      message: parsed.data.error.message,
      requestId: parsed.data.error.request_id,
      retryable: parsed.data.error.retryable,
      status,
    });
  }

  return new ProfileInsightResourceError({
    code: "PROFILE_INSIGHT_UNKNOWN_ERROR",
    message: "Profile insight data could not be loaded.",
    requestId: `profile-insight-${status}`,
    retryable: status >= 500,
    status,
  });
}
