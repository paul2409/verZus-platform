import { z } from "zod";

import {
  competitionLifecycleActionSchema,
  competitionLifecycleDispositionSchema,
  competitionLifecycleScenarioSchema,
  competitionLifecycleStateSchema,
} from "../model/competition-lifecycle.schema";

export const competitionLifecycleApiErrorSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  request_id: z.string().min(1).nullable(),
  retryable: z.boolean(),
  field_errors: z.record(z.string(), z.array(z.string())).optional(),
});

export const competitionLifecycleRawSchema = z.object({
  competition_id: z.string().min(1),
  lifecycle: competitionLifecycleStateSchema,
  scenario: competitionLifecycleScenarioSchema,
  disposition: competitionLifecycleDispositionSchema,
  title: z.string().min(1),
  message: z.string().min(1),
  severity: z.enum(["info", "warning", "critical"]),
  primary_action: competitionLifecycleActionSchema,
  entry_allowed: z.boolean(),
  waitlist_allowed: z.boolean(),
  blocking: z.boolean(),
  retryable: z.boolean(),
  registered_count: z.number().int().nonnegative(),
  capacity: z.number().int().positive(),
});

export const competitionLifecycleApiSuccessSchema = z.object({
  ok: z.literal(true),
  data: competitionLifecycleRawSchema,
  meta: z.object({
    request_id: z.string().min(1),
    server_now: z.string().datetime(),
    last_updated_at: z.string().datetime(),
    freshness: z.enum(["fresh", "stale"]),
  }),
});

export const competitionLifecycleApiFailureSchema = z.object({
  ok: z.literal(false),
  error: competitionLifecycleApiErrorSchema,
});

export const competitionLifecycleApiResponseSchema = z.discriminatedUnion("ok", [
  competitionLifecycleApiSuccessSchema,
  competitionLifecycleApiFailureSchema,
]);

export type CompetitionLifecycleApiResponse = z.infer<typeof competitionLifecycleApiResponseSchema>;
