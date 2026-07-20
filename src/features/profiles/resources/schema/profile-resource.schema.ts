// VERZUS M11.4 RAW PROFILE API SCHEMAS

import { z } from "zod";

const resourceMetaSchema = z.object({
  request_id: z.string().min(1),
  fetched_at: z.string().datetime(),
  freshness: z.enum(["fresh", "stale"]),
  source: z.string().min(1),
  version: z.number().int().nonnegative(),
});

const errorEnvelopeSchema = z.object({
  error: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
    request_id: z.string().min(1),
    retryable: z.boolean(),
    field_errors: z.record(z.string(), z.array(z.string())).optional(),
  }),
});

export const profileIdentityResponseSchema = z.object({
  data: z.object({
    id: z.string().min(1),
    display_name: z.string().min(1),
    handle: z.string().min(1),
    title: z.string(),
    bio: z.string(),
    location_label: z.string(),
    country_code: z.string().length(2),
    avatar_src: z.string().nullable(),
    avatar_alt: z.string(),
    banner_src: z.string(),
    verified: z.boolean(),
    profile_visibility: z.enum(["public", "friends", "private"]),
    joined_label: z.string(),
  }),
  meta: resourceMetaSchema,
});

export const profileCompetitiveSummaryResponseSchema = z.object({
  data: z.object({
    matches: z.number().int().nonnegative(),
    wins: z.number().int().nonnegative(),
    losses: z.number().int().nonnegative(),
    draws: z.number().int().nonnegative(),
    win_rate_label: z.string(),
    rating: z.number().int().nonnegative(),
    weekly_rank: z.number().int().positive(),
    points: z.number().int().nonnegative(),
    trust_score: z.number().min(0).max(100),
    current_streak_label: z.string(),
  }),
  meta: resourceMetaSchema,
});

export const profileCrewResponseSchema = z.object({
  data: z.object({
    crew: z
      .object({
        id: z.string().min(1),
        name: z.string().min(1),
        tag: z.string().min(1),
        role_label: z.string().min(1),
        href: z.string().min(1),
      })
      .nullable(),
  }),
  meta: resourceMetaSchema,
});

export const profileAvailabilityResponseSchema = z.object({
  data: z.object({
    state: z.enum(["available", "limited", "unavailable"]),
    label: z.string().min(1),
    detail: z.string(),
    next_window_label: z.string(),
  }),
  meta: resourceMetaSchema,
});

export const profileResourceErrorEnvelopeSchema = errorEnvelopeSchema;

export type RawProfileIdentityResponse = z.infer<typeof profileIdentityResponseSchema>;
export type RawProfileCompetitiveSummaryResponse = z.infer<
  typeof profileCompetitiveSummaryResponseSchema
>;
export type RawProfileCrewResponse = z.infer<typeof profileCrewResponseSchema>;
export type RawProfileAvailabilityResponse = z.infer<typeof profileAvailabilityResponseSchema>;
