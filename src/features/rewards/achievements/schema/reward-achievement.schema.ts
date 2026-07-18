// VERZUS M10.6 RAW ACHIEVEMENT DETAIL API SCHEMA

import { z } from "zod";

export const rewardAchievementDetailEnvelopeSchema = z.object({
  data: z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    description: z.string(),
    state: z.enum(["locked", "in_progress", "unlocked"]),
    progress_current: z.number().int().min(0),
    progress_target: z.number().int().positive(),
    reward_id: z.string().min(1).nullable(),
    artwork_src: z.string().min(1),
    artwork_alt: z.string().min(1),
    category_label: z.string().min(1),
    rarity: z.enum(["common", "rare", "epic", "legendary"]),
    requirement_label: z.string().min(1),
    unlocked_at: z.string().datetime().nullable(),
    unlocked_at_label: z.string().min(1).nullable(),
    linked_reward: z
      .object({
        id: z.string().min(1),
        title: z.string().min(1),
        amount_label: z.string().min(1),
        state: z.enum(["locked", "claimable", "claimed"]),
      })
      .nullable(),
    provenance: z.array(
      z.object({
        source_type: z.enum(["match", "competition", "crew", "season"]),
        source_id: z.string().min(1),
        source_label: z.string().min(1),
        verified_at: z.string().datetime(),
        verified_at_label: z.string().min(1),
      }),
    ),
  }),
  meta: z.object({
    request_id: z.string().min(1),
    fetched_at: z.string().datetime(),
  }),
});

export const rewardAchievementDetailErrorSchema = z.object({
  error: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
    request_id: z.string().min(1),
    retryable: z.boolean(),
  }),
});
