// VERZUS M4 STEP 4.9

import { z } from "zod";

import { dayOfWeekSchema, gameIdSchema, gamingPlatformSchema } from "../model";
import { onboardingApiFailureSchema } from "./onboarding-api.schema";

export const onboardingOptionWarningSchema = z.object({
  source: z.string().min(1),
  message: z.string().min(1),
  retryable: z.boolean(),
});

export const onboardingOptionMetaSchema = z.object({
  status: z.enum(["complete", "partial"]),
  warnings: z.array(onboardingOptionWarningSchema),
  generatedAt: z.string().datetime(),
});

export const onboardingGameOptionSchema = z.object({
  id: gameIdSchema,
  name: z.string().min(1).max(80),
  shortName: z.string().min(1).max(24),
  active: z.boolean(),
  competitive: z.boolean(),
  platforms: z.array(gamingPlatformSchema).min(1),
});

export const onboardingGameOptionsDataSchema = z.object({
  games: z.array(onboardingGameOptionSchema),
  recommendedGameIds: z.array(gameIdSchema),
  maximumSelections: z.number().int().positive(),
  meta: onboardingOptionMetaSchema,
});

export const onboardingCountryOptionSchema = z.object({
  code: z
    .string()
    .length(2)
    .transform((value) => value.toUpperCase()),
  name: z.string().min(1).max(80),
});

export const onboardingRegionOptionSchema = z.object({
  id: z.string().min(1).max(100),
  countryCode: z.string().length(2),
  name: z.string().min(1).max(80),
});

export const onboardingCityOptionSchema = z.object({
  id: z.string().min(1).max(100),
  countryCode: z.string().length(2),
  regionId: z.string().min(1).max(100),
  name: z.string().min(1).max(80),
});

export const onboardingLocationOptionsDataSchema = z.object({
  countries: z.array(onboardingCountryOptionSchema),
  regions: z.array(onboardingRegionOptionSchema),
  cities: z.array(onboardingCityOptionSchema),
  timezones: z.array(z.string().min(1)),
  selectedCountryCode: z.string().length(2).nullable(),
  selectedRegionId: z.string().min(1).nullable(),
  meta: onboardingOptionMetaSchema,
});

export const onboardingPlatformOptionSchema = z.object({
  id: gamingPlatformSchema,
  label: z.string().min(1).max(40),
  handleLabel: z.string().min(1).max(60),
});

export const onboardingIdentityOptionsDataSchema = z.object({
  currentGamerTag: z.string().min(3).max(24),
  platforms: z.array(onboardingPlatformOptionSchema),
  gamerTagRules: z.object({
    minimumLength: z.number().int().positive(),
    maximumLength: z.number().int().positive(),
    reservedWords: z.array(z.string()),
  }),
  meta: onboardingOptionMetaSchema,
});

export const onboardingAvailabilityDayOptionSchema = z.object({
  id: dayOfWeekSchema,
  label: z.string().min(1).max(20),
});

export const onboardingAvailabilityOptionsDataSchema = z.object({
  days: z.array(onboardingAvailabilityDayOptionSchema),
  timezone: z.string().min(1),
  slotRules: z.object({
    minuteIncrement: z.number().int().positive(),
    minimumDurationMinutes: z.number().int().positive(),
    maximumWindows: z.number().int().positive(),
  }),
  meta: onboardingOptionMetaSchema,
});

export const onboardingCrewOptionSchema = z.object({
  id: z.string().min(1).max(80),
  name: z.string().min(1).max(80),
  tag: z.string().min(2).max(8),
  memberCount: z.number().int().nonnegative(),
  acceptingMembers: z.boolean(),
  supportedGameIds: z.array(gameIdSchema),
  fitReasons: z.array(z.string().min(1)),
});

export const onboardingCrewOptionsDataSchema = z.object({
  crews: z.array(onboardingCrewOptionSchema),
  canSkip: z.literal(true),
  maximumSuggestions: z.number().int().positive(),
  requestedGameId: gameIdSchema.nullable(),
  meta: onboardingOptionMetaSchema,
});

export const onboardingGameOptionsSuccessSchema = z.object({
  ok: z.literal(true),
  data: onboardingGameOptionsDataSchema,
  requestId: z.string().min(1),
});

export const onboardingLocationOptionsSuccessSchema = z.object({
  ok: z.literal(true),
  data: onboardingLocationOptionsDataSchema,
  requestId: z.string().min(1),
});

export const onboardingIdentityOptionsSuccessSchema = z.object({
  ok: z.literal(true),
  data: onboardingIdentityOptionsDataSchema,
  requestId: z.string().min(1),
});

export const onboardingAvailabilityOptionsSuccessSchema = z.object({
  ok: z.literal(true),
  data: onboardingAvailabilityOptionsDataSchema,
  requestId: z.string().min(1),
});

export const onboardingCrewOptionsSuccessSchema = z.object({
  ok: z.literal(true),
  data: onboardingCrewOptionsDataSchema,
  requestId: z.string().min(1),
});

export const onboardingGameOptionsResponseSchema = z.discriminatedUnion("ok", [
  onboardingGameOptionsSuccessSchema,
  onboardingApiFailureSchema,
]);

export const onboardingLocationOptionsResponseSchema = z.discriminatedUnion("ok", [
  onboardingLocationOptionsSuccessSchema,
  onboardingApiFailureSchema,
]);

export const onboardingIdentityOptionsResponseSchema = z.discriminatedUnion("ok", [
  onboardingIdentityOptionsSuccessSchema,
  onboardingApiFailureSchema,
]);

export const onboardingAvailabilityOptionsResponseSchema = z.discriminatedUnion("ok", [
  onboardingAvailabilityOptionsSuccessSchema,
  onboardingApiFailureSchema,
]);

export const onboardingCrewOptionsResponseSchema = z.discriminatedUnion("ok", [
  onboardingCrewOptionsSuccessSchema,
  onboardingApiFailureSchema,
]);

export type OnboardingOptionMeta = z.infer<typeof onboardingOptionMetaSchema>;
export type OnboardingGameOptionsData = z.infer<typeof onboardingGameOptionsDataSchema>;
export type OnboardingLocationOptionsData = z.infer<typeof onboardingLocationOptionsDataSchema>;
export type OnboardingIdentityOptionsData = z.infer<typeof onboardingIdentityOptionsDataSchema>;
export type OnboardingAvailabilityOptionsData = z.infer<
  typeof onboardingAvailabilityOptionsDataSchema
>;
export type OnboardingCrewOptionsData = z.infer<typeof onboardingCrewOptionsDataSchema>;
export type OnboardingGameOptionsSuccess = z.infer<typeof onboardingGameOptionsSuccessSchema>;
export type OnboardingLocationOptionsSuccess = z.infer<
  typeof onboardingLocationOptionsSuccessSchema
>;
export type OnboardingIdentityOptionsSuccess = z.infer<
  typeof onboardingIdentityOptionsSuccessSchema
>;
export type OnboardingAvailabilityOptionsSuccess = z.infer<
  typeof onboardingAvailabilityOptionsSuccessSchema
>;
export type OnboardingCrewOptionsSuccess = z.infer<typeof onboardingCrewOptionsSuccessSchema>;
