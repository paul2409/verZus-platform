// VERZUS M10.7 PRIVACY-SAFE REWARD TELEMETRY SCHEMA

import { z } from "zod";

import { rewardWidgetNames } from "../reliability/model/reward-reliability.types";
import { rewardResourceNames } from "../resources/model/reward-resource.types";

export const rewardTelemetryEventNames = [
  "rewards_surface_viewed",
  "reward_resource_failed",
  "reward_resource_stale",
  "reward_resource_retry_requested",
  "reward_claim_started",
  "reward_claim_succeeded",
  "reward_claim_failed",
  "reward_claim_retry_requested",
  "reward_widget_failed",
  "reward_widget_retry_requested",
] as const;

export const rewardTelemetrySchema = z.object({
  eventName: z.enum(rewardTelemetryEventNames),
  surface: z.enum(["overview", "resource", "claim", "widget"]),
  resource: z.enum(rewardResourceNames).nullable().default(null),
  widget: z.enum(rewardWidgetNames).nullable().default(null),
  rewardId: z
    .string()
    .regex(/^[a-z0-9][a-z0-9-]{1,95}$/i)
    .nullable()
    .default(null),
  state: z.string().max(64).nullable().default(null),
  errorCode: z.string().max(96).nullable().default(null),
  requestId: z.string().max(160).nullable().default(null),
  route: z.string().startsWith("/rewards").max(220),
  occurredAt: z.string().datetime(),
  releaseSha: z.string().max(120),
});

export type RewardTelemetryEvent = z.infer<typeof rewardTelemetrySchema>;
