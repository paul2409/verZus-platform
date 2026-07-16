// VERZUS M6.7 COMPETITION TELEMETRY

import { z } from "zod";

export const competitionTelemetryEventNames = [
  "competition.route_viewed",
  "competition.lifecycle_viewed",
  "competition.entry_started",
  "competition.entry_succeeded",
  "competition.entry_failed",
  "competition.retry_requested",
  "competition.resource_failed",
  "competition.feature_disabled",
] as const;

export const competitionTelemetryEventSchema = z
  .object({
    name: z.enum(competitionTelemetryEventNames),
    occurredAt: z.string().datetime({ offset: true }),
    route: z.string().min(1).max(240),
    competitionId: z.string().min(1).max(160).optional(),
    scenario: z.string().min(1).max(80).optional(),
    code: z.string().min(1).max(120).optional(),
    requestId: z.string().min(1).max(180).optional(),
    status: z.number().int().min(100).max(599).optional(),
    durationMs: z.number().finite().min(0).max(120_000).optional(),
    environment: z.string().min(1).max(40),
    release: z.string().min(1).max(120),
  })
  .strict();

export type CompetitionTelemetryEvent = z.infer<typeof competitionTelemetryEventSchema>;
