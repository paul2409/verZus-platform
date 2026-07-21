// VERZUS M12.6 RELIABILITY EDGE STATES
// VERZUS M12.5 PERSONALIZED ACTIVITY FEED SCHEMAS

import { z } from "zod";

export const activityFeedDomainSchema = z.enum([
  "all",
  "matches",
  "competitions",
  "crews",
  "rewards",
  "rankings",
  "profile",
]);

export const activityFeedScenarioSchema = z.enum([
  "normal",
  "empty",
  "slow",
  "error",
  "offline",
  "malformed",
  "stale",
  "unauthorized",
  "forbidden",
  "not-found",
  "maintenance",
  "partial",
]);

const rawActivityActorSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(["player", "crew", "platform"]),
  name: z.string().min(1),
  handle: z.string().nullable(),
  initials: z.string().min(1).max(4),
  artwork_url: z.string().nullable(),
  verified: z.boolean(),
});

const rawActivityItemSchema = z.object({
  id: z.string().min(1),
  domain: z.enum(["matches", "competitions", "crews", "rewards", "rankings", "profile"]),
  verb: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  actor: rawActivityActorSchema,
  occurred_at: z.string().datetime(),
  href: z.string().regex(/^\//, "Expected a relative VERZUS route."),
  action_label: z.string().min(1),
  context_label: z.string().min(1),
  metric: z.string().nullable(),
  tone: z.enum(["cyan", "green", "gold", "magenta", "violet"]),
  visibility: z.enum(["public", "crew", "private"]),
  personalization_reason: z.string().min(1),
});

export const activityFeedResponseSchema = z.object({
  data: z.object({
    items: z.array(rawActivityItemSchema),
  }),
  meta: z.object({
    request_id: z.string().min(1),
    fetched_at: z.string().datetime(),
    freshness: z.enum(["fresh", "stale"]),
    domain: activityFeedDomainSchema,
    page_size: z.number().int().positive(),
    next_cursor: z.string().nullable(),
    has_next_page: z.boolean(),
    total_visible: z.number().int().nonnegative(),
    personalization: z.literal("viewer"),
  }),
});

export const activityFeedErrorSchema = z.object({
  error: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
    request_id: z.string().min(1),
    retryable: z.boolean(),
  }),
});

export type RawActivityFeedResponse = z.infer<typeof activityFeedResponseSchema>;
