// VERZUS M8.9 CREW INTEL RESOURCE SCHEMAS

import { z } from "zod";

export const crewIntelResourceScenarios = [
  "normal",
  "stale",
  "partial",
  "error",
  "not-found",
  "malformed",
  "slow",
] as const;

export type CrewIntelResourceScenario = (typeof crewIntelResourceScenarios)[number];

export const crewIntelRawSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  tag: z.string().min(1),
  tier_label: z.string().min(1),
  location_label: z.string().min(1),
  emblem_src: z.string().min(1),
  rank: z.number().int().positive(),
  trust: z.number().int().min(0).max(100),
  verified: z.boolean(),
  reputation_label: z.string().min(1),
  members_label: z.string().min(1),
  win_rate_label: z.string().min(1),
  war_record_label: z.string().min(1),
  owner_name: z.string().min(1),
  captain_names: z.array(z.string().min(1)).max(5),
  active_roster_count: z.number().int().min(0),
  recent_results: z.array(z.enum(["W", "D", "L"])).max(10),
  crew_href: z.string().min(1),
  join_war_href: z.string().nullable(),
});

export const crewIntelEnvelopeSchema = z.object({
  data: crewIntelRawSchema,
  meta: z.object({
    request_id: z.string().min(1),
    fetched_at: z.string().datetime(),
    freshness: z.enum(["fresh", "stale", "partial"]),
    source: z.literal("mock-crew-intel"),
  }),
});

export const crewIntelErrorEnvelopeSchema = z.object({
  error: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
    request_id: z.string().min(1),
    retryable: z.boolean(),
  }),
});
