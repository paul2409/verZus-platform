// VERZUS M12.7 NOTIFICATION SETTINGS SCHEMAS

import { z } from "zod";

export const notificationSettingsScenarioSchema = z.enum([
  "normal",
  "slow",
  "error",
  "offline",
  "malformed",
  "unauthorized",
  "forbidden",
  "maintenance",
  "conflict",
]);

export const rawNotificationSettingsSchema = z.object({
  version: z.number().int().positive(),
  channels: z.object({
    in_app: z.literal(true),
    email: z.boolean(),
    push: z.boolean(),
  }),
  categories: z.object({
    match: z.boolean(),
    crew: z.boolean(),
    competition: z.boolean(),
    reward: z.boolean(),
    security: z.literal(true),
    system: z.boolean(),
  }),
  quiet_hours: z.object({
    enabled: z.boolean(),
    start_minute: z.number().int().min(0).max(1439),
    end_minute: z.number().int().min(0).max(1439),
    time_zone: z.string().min(1).max(80),
  }),
  email_digest: z.enum(["immediate", "daily", "weekly"]),
  updated_at: z.string().datetime(),
});

export const notificationSettingsResponseSchema = z.object({
  data: rawNotificationSettingsSchema,
  meta: z.object({
    request_id: z.string().min(1),
    idempotency_key: z.string().min(1).optional(),
    replayed: z.boolean().optional(),
  }),
});

export const notificationSettingsUpdateRequestSchema = z.object({
  expected_version: z.number().int().positive(),
  idempotency_key: z.string().min(8).max(160),
  scenario: notificationSettingsScenarioSchema.default("normal"),
  settings: z.object({
    channels: z.object({
      in_app: z.literal(true),
      email: z.boolean(),
      push: z.boolean(),
    }),
    categories: z.object({
      match: z.boolean(),
      crew: z.boolean(),
      competition: z.boolean(),
      reward: z.boolean(),
      security: z.literal(true),
      system: z.boolean(),
    }),
    quiet_hours: z.object({
      enabled: z.boolean(),
      start_minute: z.number().int().min(0).max(1439),
      end_minute: z.number().int().min(0).max(1439),
      time_zone: z.string().min(1).max(80),
    }),
    email_digest: z.enum(["immediate", "daily", "weekly"]),
  }),
});

export const notificationSettingsErrorSchema = z.object({
  error: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
    request_id: z.string().min(1),
    retryable: z.boolean(),
  }),
});
