// VERZUS M12.3 NOTIFICATION CENTER SCHEMAS

import { z } from "zod";

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

export const notificationCenterResponseSchema = z.object({
  data: z.object({
    items: z.array(rawNotificationSchema),
  }),
  meta: z.object({
    request_id: z.string().min(1),
    fetched_at: z.string().datetime(),
    freshness: z.enum(["fresh", "stale"]),
    page: z.number().int().positive(),
    page_size: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    total_pages: z.number().int().nonnegative(),
    unread_count: z.number().int().nonnegative(),
  }),
});

export const notificationCenterErrorSchema = z.object({
  error: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
    request_id: z.string().min(1),
    retryable: z.boolean(),
  }),
});

export type RawNotificationCenterResponse = z.infer<typeof notificationCenterResponseSchema>;
