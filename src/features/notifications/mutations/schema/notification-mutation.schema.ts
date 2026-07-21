// VERZUS M12.6 RELIABILITY EDGE STATES
// VERZUS M12.4 NOTIFICATION MUTATION SCHEMAS

import { z } from "zod";

export const notificationMutationScenarioSchema = z.enum([
  "normal",
  "slow",
  "error",
  "offline",
  "malformed",
  "unauthorized",
  "forbidden",
  "maintenance",
  "conflict",
  "not-found",
]);

export const singleNotificationMutationRequestSchema = z.object({
  operation: z.enum(["read", "actioned", "dismissed"]),
  expected_state: z.enum(["unread", "read", "actioned", "dismissed", "expired"]),
  idempotency_key: z.string().min(8).max(160),
  scenario: notificationMutationScenarioSchema.default("normal"),
});

export const readAllNotificationsMutationRequestSchema = z.object({
  category: z
    .enum(["all", "match", "crew", "competition", "reward", "security", "system"])
    .default("all"),
  idempotency_key: z.string().min(8).max(160),
  scenario: notificationMutationScenarioSchema.default("normal"),
});

const rawNotificationSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(["match", "crew", "competition", "reward", "security", "system"]),
  state: z.enum(["unread", "read", "actioned", "dismissed", "expired"]),
  priority: z.enum(["critical", "high", "normal", "low"]),
  created_at: z.string().datetime(),
  expires_at: z.string().datetime().nullable(),
  href: z.string().nullable(),
  action_label: z.string().nullable(),
  source_label: z.string().min(1),
  reference: z.string().min(1),
});

export const notificationMutationResponseSchema = z.object({
  data: z.object({
    item: rawNotificationSchema.nullable(),
    operation: z.enum(["read", "actioned", "dismissed", "read_all"]),
    updated_count: z.number().int().nonnegative(),
    unread_count: z.number().int().nonnegative(),
    replayed: z.boolean(),
  }),
  meta: z.object({
    request_id: z.string().min(1),
    idempotency_key: z.string().min(1),
  }),
});

export const notificationUnreadCountResponseSchema = z.object({
  data: z.object({
    unread_count: z.number().int().nonnegative(),
  }),
  meta: z.object({
    request_id: z.string().min(1),
    fetched_at: z.string().datetime(),
  }),
});

export const notificationMutationErrorSchema = z.object({
  error: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
    request_id: z.string().min(1),
    retryable: z.boolean(),
  }),
});
