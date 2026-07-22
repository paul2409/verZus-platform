// VERZUS M8.9 MATCH INTEL RESOURCE SCHEMAS

import { z } from "zod";

export const matchIntelResourceScenarios = [
  "normal",
  "stale",
  "partial",
  "error",
  "not-found",
  "malformed",
  "slow",
] as const;

export type MatchIntelResourceScenario = (typeof matchIntelResourceScenarios)[number];

const sideSchema = z.object({
  name: z.string().min(1),
  tag: z.string().min(1),
  side_label: z.string().min(1),
  emblem_src: z.string().min(1),
});

export const matchIntelRawSchema = z.object({
  id: z.string().min(1),
  week_label: z.string().min(1),
  status_label: z.string().min(1),
  countdown_label: z.string().min(1),
  starts_at_label: z.string().min(1),
  game_label: z.string().min(1),
  format_label: z.string().min(1),
  home: sideSchema,
  away: sideSchema,
  prize_pool_label: z.string().min(1),
  stakes_label: z.string().min(1),
  check_in_closes_label: z.string().min(1),
  score_label: z.string().min(1),
  competition_label: z.string().min(1),
  round_label: z.string().min(1),
  result_confirmation_label: z.string().min(1),
  dispute_label: z.string().min(1),
  match_href: z.string().min(1),
  check_in_href: z.string().nullable(),
});

export const matchIntelEnvelopeSchema = z.object({
  data: matchIntelRawSchema,
  meta: z.object({
    request_id: z.string().min(1),
    fetched_at: z.string().datetime(),
    freshness: z.enum(["fresh", "stale", "partial"]),
    source: z.literal("match-api"),
  }),
});

export const matchIntelErrorEnvelopeSchema = z.object({
  error: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
    request_id: z.string().min(1),
    retryable: z.boolean(),
  }),
});
