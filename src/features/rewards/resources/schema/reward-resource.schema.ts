// VERZUS M10.3 RAW REWARD API SCHEMAS

import { z } from "zod";

const rewardStateSchema = z.enum([
  "locked",
  "eligible",
  "claimable",
  "claiming",
  "claimed",
  "expired",
  "revoked",
]);
const rewardKindSchema = z.enum(["coins", "xp", "crate", "cosmetic", "boost"]);
const freshnessSchema = z.enum(["fresh", "stale"]);

const metaSchema = z.object({
  request_id: z.string().min(1),
  fetched_at: z.string().datetime(),
  freshness: freshnessSchema,
  source: z.literal("production-reward-resource"),
});

const rewardSummarySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  kind: rewardKindSchema,
  state: rewardStateSchema,
  amount_label: z.string().min(1),
  artwork_src: z.string().min(1),
  artwork_alt: z.string().min(1),
});

const envelope = <T extends z.ZodTypeAny>(data: T) => z.object({ data, meta: metaSchema });

export const rewardProgressEnvelopeSchema = envelope(
  z.object({
    progress: z.object({
      current_level: z.number().int().min(0),
      next_level: z.number().int().min(0),
      current_xp: z.number().int().min(0),
      target_xp: z.number().int().positive(),
      remaining_xp: z.number().int().min(0),
      season_label: z.string().min(1),
    }),
    claimable_rewards: z.array(rewardSummarySchema),
    track: z.array(rewardSummarySchema.extend({ level: z.number().int().min(0) })),
  }),
);

export const rewardSeasonEnvelopeSchema = envelope(
  z.object({
    season: z
      .object({
        season_id: z.string().min(1),
        label: z.string().min(1),
        chapter_label: z.string().min(1),
        state: z.enum(["upcoming", "active", "completed", "ended"]),
        starts_at: z.string().datetime(),
        ends_at: z.string().datetime(),
        days_remaining: z.number().int().min(0),
        current_tier: z.number().int().min(0),
        total_tiers: z.number().int().positive(),
        current_season_xp: z.number().int().min(0),
        target_season_xp: z.number().int().positive(),
        weekly_xp_earned: z.number().int().min(0),
        weekly_xp_cap: z.number().int().positive(),
        boost_multiplier: z.number().positive(),
        objectives: z.array(
          z.object({
            id: z.string().min(1),
            title: z.string().min(1),
            description: z.string(),
            progress_current: z.number().int().min(0),
            progress_target: z.number().int().positive(),
            xp_reward: z.number().int().min(0),
            completed: z.boolean(),
          }),
        ),
        milestones: z.array(
          z.object({
            id: z.string().min(1),
            tier: z.number().int().min(0),
            title: z.string().min(1),
            description: z.string(),
            state: z.enum(["completed", "current", "upcoming", "locked"]),
            requirement_label: z.string().min(1),
            reward_id: z.string().min(1).nullable(),
          }),
        ),
      })
      .nullable(),
  }),
);

export const rewardInventoryEnvelopeSchema = envelope(
  z.object({
    version: z.number().int().positive(),
    items: z.array(
      rewardSummarySchema.extend({
        source_label: z.string().min(1),
        requirement_label: z.string().min(1),
        availability_label: z.string().min(1),
        state_detail: z.string().min(1),
        claim_reference: z.string().min(1).optional(),
        claimed_at_label: z.string().min(1).optional(),
        expires_at_label: z.string().min(1).optional(),
        revoked_reason: z.string().min(1).optional(),
      }),
    ),
  }),
);

export const rewardHistoryEnvelopeSchema = envelope(
  z.object({
    items: z.array(
      rewardSummarySchema.extend({
        source_label: z.string().min(1),
        claimed_at_label: z.string().min(1),
      }),
    ),
  }),
);

export const rewardAchievementsEnvelopeSchema = envelope(
  z.object({
    items: z.array(
      z.object({
        id: z.string().min(1),
        title: z.string().min(1),
        description: z.string(),
        state: z.enum(["locked", "in_progress", "unlocked"]),
        progress_current: z.number().int().min(0),
        progress_target: z.number().int().positive(),
        reward_id: z.string().min(1).nullable(),
        artwork_src: z.string().min(1),
        artwork_alt: z.string().min(1),
      }),
    ),
  }),
);

export const rewardResourceErrorEnvelopeSchema = z.object({
  error: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
    request_id: z.string().min(1),
    retryable: z.boolean(),
  }),
});
