// VERZUS M10.4 REWARD CLAIM API SCHEMAS

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

const rewardInventoryItemRawSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  kind: rewardKindSchema,
  state: rewardStateSchema,
  amount_label: z.string().min(1),
  artwork_src: z.string().min(1),
  artwork_alt: z.string().min(1),
  source_label: z.string().min(1),
  requirement_label: z.string().min(1),
  availability_label: z.string().min(1),
  state_detail: z.string().min(1),
  claim_reference: z.string().min(1).optional(),
  claimed_at_label: z.string().min(1).optional(),
  expires_at_label: z.string().min(1).optional(),
  revoked_reason: z.string().min(1).optional(),
});

const rewardHistoryItemRawSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  kind: rewardKindSchema,
  state: z.literal("claimed"),
  amount_label: z.string().min(1),
  artwork_src: z.string().min(1),
  artwork_alt: z.string().min(1),
  source_label: z.string().min(1),
  claimed_at_label: z.string().min(1),
});

export const rewardClaimCommandRawSchema = z.object({
  expected_version: z.number().int().positive(),
});

export const rewardClaimEnvelopeRawSchema = z.object({
  data: z.object({
    claim_id: z.string().min(1),
    claim_reference: z.string().min(1),
    reward_id: z.string().min(1),
    inventory_version: z.number().int().positive(),
    claimed_at: z.string().datetime(),
    replayed: z.boolean(),
    reward: rewardInventoryItemRawSchema,
    history_item: rewardHistoryItemRawSchema,
    audit_event: z.object({
      id: z.string().min(1),
      player_id: z.string().min(1),
      reward_id: z.string().min(1),
      action: z.literal("reward_claimed"),
      claim_reference: z.string().min(1),
      idempotency_key_hash: z.string().min(8),
      created_at: z.string().datetime(),
    }),
  }),
  meta: z.object({
    request_id: z.string().min(1),
    processed_at: z.string().datetime(),
    source: z.literal("production-reward-claim"),
  }),
});

export const rewardClaimErrorEnvelopeRawSchema = z.object({
  error: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
    request_id: z.string().min(1),
    retryable: z.boolean(),
    field_errors: z.record(z.string(), z.array(z.string())).optional(),
  }),
});
