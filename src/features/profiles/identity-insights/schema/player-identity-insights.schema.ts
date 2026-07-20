// VERZUS M11.6 RAW PROFILE INSIGHT API SCHEMAS

import { z } from "zod";

const freshnessSchema = z.enum(["fresh", "stale"]);

export const rawProfileAchievementEntrySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(["competitive", "crew", "trust", "season"]),
  rarity: z.enum(["common", "rare", "epic", "legendary"]),
  state: z.enum(["unlocked", "in-progress", "locked"]),
  progress_current: z.number().int().nonnegative(),
  progress_target: z.number().int().positive(),
  progress_label: z.string().min(1),
  unlocked_at_label: z.string().min(1).nullable(),
  reward_label: z.string().min(1).nullable(),
  evidence_label: z.string().min(1),
});

export const rawProfileAchievementPageSchema = z.object({
  data: z.object({
    entries: z.array(rawProfileAchievementEntrySchema),
    page: z.number().int().positive(),
    page_size: z.number().int().positive(),
    total_entries: z.number().int().nonnegative(),
    total_pages: z.number().int().nonnegative(),
    unlocked_count: z.number().int().nonnegative(),
    in_progress_count: z.number().int().nonnegative(),
    locked_count: z.number().int().nonnegative(),
    freshness: freshnessSchema,
  }),
  meta: z.object({
    request_id: z.string().min(1),
    generated_at: z.string().datetime(),
  }),
});

export const rawProfileGameIdentityEntrySchema = z.object({
  id: z.string().min(1),
  game_label: z.string().min(1),
  handle: z.string().min(1),
  platform_label: z.string().min(1),
  rank_label: z.string().min(1),
  record_label: z.string().min(1),
  status: z.enum(["verified", "pending", "expired"]),
  visibility: z.enum(["public", "friends", "private"]),
  linked_at_label: z.string().min(1),
  last_verified_at_label: z.string().min(1).nullable(),
});

export const rawProfileGameIdentityCollectionSchema = z.object({
  data: z.object({
    entries: z.array(rawProfileGameIdentityEntrySchema),
    verified_count: z.number().int().nonnegative(),
    pending_count: z.number().int().nonnegative(),
    private_count: z.number().int().nonnegative(),
    freshness: freshnessSchema,
  }),
  meta: z.object({
    request_id: z.string().min(1),
    generated_at: z.string().datetime(),
  }),
});

export const rawProfileTrustCategorySchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  score: z.number().min(0).max(100),
  detail: z.string().min(1),
});

export const rawProfileTrustHistoryEntrySchema = z.object({
  id: z.string().min(1),
  type: z.enum([
    "verified-result",
    "sportsmanship",
    "reliability",
    "dispute",
    "penalty",
    "manual-review",
  ]),
  title: z.string().min(1),
  detail: z.string().min(1),
  delta: z.number().int(),
  score_after: z.number().min(0).max(100),
  occurred_at_label: z.string().min(1),
  reference_label: z.string().min(1),
  actor_label: z.string().min(1),
});

export const rawProfileTrustHistoryPageSchema = z.object({
  data: z.object({
    score: z.number().min(0).max(100),
    status_label: z.string().min(1),
    trend: z.number().int(),
    categories: z.array(rawProfileTrustCategorySchema),
    entries: z.array(rawProfileTrustHistoryEntrySchema),
    page: z.number().int().positive(),
    page_size: z.number().int().positive(),
    total_entries: z.number().int().nonnegative(),
    total_pages: z.number().int().nonnegative(),
    freshness: freshnessSchema,
  }),
  meta: z.object({
    request_id: z.string().min(1),
    generated_at: z.string().datetime(),
  }),
});

export const rawProfileInsightErrorSchema = z.object({
  error: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
    request_id: z.string().min(1),
    retryable: z.boolean(),
  }),
});

export type RawProfileAchievementPage = z.infer<typeof rawProfileAchievementPageSchema>;
export type RawProfileGameIdentityCollection = z.infer<
  typeof rawProfileGameIdentityCollectionSchema
>;
export type RawProfileTrustHistoryPage = z.infer<typeof rawProfileTrustHistoryPageSchema>;
