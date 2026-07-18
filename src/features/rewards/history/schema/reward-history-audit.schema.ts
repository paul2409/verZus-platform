// VERZUS M10.6 RAW AUDITABLE REWARD HISTORY SCHEMA

import { z } from "zod";

export const rewardHistoryAuditEnvelopeSchema = z.object({
  data: z.object({
    items: z.array(
      z.object({
        id: z.string().min(1),
        reward_id: z.string().min(1),
        title: z.string().min(1),
        kind: z.enum(["coins", "xp", "crate", "cosmetic", "boost"]),
        action: z.enum(["reward_issued", "reward_claimed", "reward_expired", "reward_revoked"]),
        status_label: z.string().min(1),
        amount_label: z.string().min(1),
        source_label: z.string().min(1),
        occurred_at: z.string().datetime(),
        occurred_at_label: z.string().min(1),
        actor_label: z.string().min(1),
        event_reference: z.string().min(1),
        claim_reference: z.string().min(1).nullable(),
        reason: z.string().min(1).nullable(),
        inventory_version: z.number().int().positive().nullable(),
      }),
    ),
    page: z.number().int().positive(),
    page_size: z.number().int().positive(),
    total: z.number().int().min(0),
    total_pages: z.number().int().positive(),
  }),
  meta: z.object({
    request_id: z.string().min(1),
    fetched_at: z.string().datetime(),
  }),
});

export const rewardHistoryAuditErrorSchema = z.object({
  error: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
    request_id: z.string().min(1),
    retryable: z.boolean(),
  }),
});
