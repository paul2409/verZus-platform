// VERZUS M7.8 MATCH OPERATIONS TELEMETRY

import { z } from "zod";

export const matchTelemetryEventNames = [
  "match.route_viewed",
  "match.state_viewed",
  "match.check_in_started",
  "match.lobby_action_started",
  "match.result_action_started",
  "match.dispute_started",
  "match.terminal_action_started",
  "match.retry_requested",
  "match.resource_failed",
  "match.widget_recovered",
  "match.feature_disabled",
] as const;

export const matchTelemetryEventSchema = z
  .object({
    name: z.enum(matchTelemetryEventNames),
    occurredAt: z.string().datetime({ offset: true }),
    route: z.string().min(1).max(240),
    matchId: z.string().min(1).max(160).optional(),
    state: z.string().min(1).max(80).optional(),
    resource: z.string().min(1).max(80).optional(),
    scenario: z.string().min(1).max(80).optional(),
    code: z.string().min(1).max(120).optional(),
    requestId: z.string().min(1).max(180).optional(),
    status: z.number().int().min(100).max(599).optional(),
    durationMs: z.number().finite().min(0).max(120_000).optional(),
    environment: z.string().min(1).max(40),
    release: z.string().min(1).max(120),
  })
  .strict();

export type MatchTelemetryEvent = z.infer<typeof matchTelemetryEventSchema>;
