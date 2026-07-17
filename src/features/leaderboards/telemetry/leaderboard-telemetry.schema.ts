// VERZUS M8.10 LEADERBOARD TELEMETRY SCHEMA

import { z } from "zod";

export const leaderboardTelemetryEventNames = [
  "intel_opened",
  "intel_closed",
  "intel_load_succeeded",
  "intel_load_failed",
  "intel_retry_requested",
] as const;

export const leaderboardTelemetrySchema = z.object({
  eventName: z.enum(leaderboardTelemetryEventNames),
  entityKind: z.enum(["player", "crew", "match"]),
  entityId: z.string().regex(/^[a-z0-9][a-z0-9-]{1,95}$/i),
  route: z.string().startsWith("/leaderboards").max(180),
  scenario: z
    .enum(["normal", "stale", "partial", "error", "not-found", "malformed", "slow"])
    .default("normal"),
  requestId: z.string().max(120).nullable().default(null),
  occurredAt: z.string().datetime(),
  releaseSha: z.string().max(120),
});

export type LeaderboardTelemetryEvent = z.infer<typeof leaderboardTelemetrySchema>;
