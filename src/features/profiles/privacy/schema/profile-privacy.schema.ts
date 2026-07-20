// VERZUS M11.7 PROFILE PRIVACY ZOD SCHEMAS

import { z } from "zod";

export const profilePrivacyAudienceSchema = z.enum(["public", "friends", "private"]);
export const profileVisibilitySchema = z.enum(["public", "friends", "private"]);

export const profilePrivacySettingsSchema = z
  .object({
    profileVisibility: profileVisibilitySchema,
    location: profilePrivacyAudienceSchema,
    crew: profilePrivacyAudienceSchema,
    statistics: profilePrivacyAudienceSchema,
    trustScore: profilePrivacyAudienceSchema,
    matchHistory: profilePrivacyAudienceSchema,
    gameHandles: profilePrivacyAudienceSchema,
    achievements: profilePrivacyAudienceSchema,
    availability: profilePrivacyAudienceSchema,
  })
  .strict();

export const profilePrivacyDataRawSchema = z
  .object({
    player_id: z.string().min(1),
    version: z.number().int().positive(),
    updated_at: z.string().datetime(),
    profile_visibility: profileVisibilitySchema,
    field_audiences: z
      .object({
        location: profilePrivacyAudienceSchema,
        crew: profilePrivacyAudienceSchema,
        statistics: profilePrivacyAudienceSchema,
        trust_score: profilePrivacyAudienceSchema,
        match_history: profilePrivacyAudienceSchema,
        game_handles: profilePrivacyAudienceSchema,
        achievements: profilePrivacyAudienceSchema,
        availability: profilePrivacyAudienceSchema,
      })
      .strict(),
    replayed: z.boolean().optional().default(false),
  })
  .strict();

export const profilePrivacyResponseRawSchema = z
  .object({
    data: profilePrivacyDataRawSchema,
    meta: z
      .object({
        request_id: z.string().min(1),
        source: z.string().min(1),
      })
      .strict(),
  })
  .strict();

export const profilePrivacyUpdateCommandRawSchema = z
  .object({
    expected_version: z.number().int().positive(),
    profile_visibility: profileVisibilitySchema,
    field_audiences: z
      .object({
        location: profilePrivacyAudienceSchema,
        crew: profilePrivacyAudienceSchema,
        statistics: profilePrivacyAudienceSchema,
        trust_score: profilePrivacyAudienceSchema,
        match_history: profilePrivacyAudienceSchema,
        game_handles: profilePrivacyAudienceSchema,
        achievements: profilePrivacyAudienceSchema,
        availability: profilePrivacyAudienceSchema,
      })
      .strict(),
  })
  .strict();

export const profilePrivacyErrorRawSchema = z
  .object({
    error: z
      .object({
        code: z.string().min(1),
        message: z.string().min(1),
        request_id: z.string().min(1),
        retryable: z.boolean(),
        field_errors: z.record(z.string(), z.array(z.string())).optional(),
      })
      .strict(),
  })
  .strict();
