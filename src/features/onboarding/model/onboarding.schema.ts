// VERZUS M4 STEP 4.7

import { z } from "zod";

export const onboardingStepValues = [
  "welcome",
  "games",
  "location",
  "identity",
  "availability",
  "crew",
  "complete",
] as const;

export const onboardingStepSchema = z.enum(onboardingStepValues);

export const onboardingStatusSchema = z.enum([
  "not_started",
  "in_progress",
  "ready_to_complete",
  "completed",
]);

export const gameIdSchema = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Game IDs must use lowercase kebab-case.");

export const selectedGamesSchema = z
  .array(gameIdSchema)
  .min(1, "Select at least one game.")
  .max(5, "Select no more than five games.")
  .refine((values) => new Set(values).size === values.length, "Each selected game must be unique.");

export const locationSchema = z.object({
  countryCode: z
    .string()
    .trim()
    .length(2, "Use a two-letter country code.")
    .transform((value) => value.toUpperCase()),
  region: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2).max(80),
  timezone: z.string().trim().min(1).max(80),
});

export const gamingPlatformSchema = z.enum(["playstation", "xbox", "pc", "mobile", "nintendo"]);

export const playerIdentitySchema = z.object({
  gamerTag: z.string().trim().min(3).max(24),
  platform: gamingPlatformSchema,
  platformHandle: z.string().trim().min(2).max(40),
});

export const dayOfWeekSchema = z.enum([
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]);

const timeValueSchema = z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, "Use 24-hour HH:mm time.");

function minutesFromMidnight(value: string): number {
  const [hours = "0", minutes = "0"] = value.split(":");

  return Number(hours) * 60 + Number(minutes);
}

export const availabilitySlotSchema = z
  .object({
    day: dayOfWeekSchema,
    startTime: timeValueSchema,
    endTime: timeValueSchema,
  })
  .refine((slot) => minutesFromMidnight(slot.endTime) > minutesFromMidnight(slot.startTime), {
    message: "End time must be later than start time.",
    path: ["endTime"],
  });

export const availabilitySchema = z
  .array(availabilitySlotSchema)
  .min(1, "Add at least one availability window.")
  .max(21, "Add no more than 21 availability windows.");

export const crewChoiceSchema = z.discriminatedUnion("decision", [
  z.object({
    decision: z.literal("skip"),
    crewId: z.null(),
  }),
  z.object({
    decision: z.literal("join"),
    crewId: z.string().trim().min(1).max(80),
  }),
]);

export const onboardingDraftSchema = z.object({
  version: z.literal(1),
  status: onboardingStatusSchema,
  currentStep: onboardingStepSchema,
  completedSteps: z.array(onboardingStepSchema),
  selectedGameIds: z.array(gameIdSchema),
  location: locationSchema.nullable(),
  playerIdentity: playerIdentitySchema.nullable(),
  availability: z.array(availabilitySlotSchema),
  crewChoice: crewChoiceSchema.nullable(),
  startedAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  completedAt: z.string().datetime().nullable(),
});

export const welcomeUpdateSchema = z.object({
  step: z.literal("welcome"),
  payload: z.object({
    acknowledged: z.literal(true),
  }),
});

export const gamesUpdateSchema = z.object({
  step: z.literal("games"),
  payload: z.object({
    selectedGameIds: selectedGamesSchema,
  }),
});

export const locationUpdateSchema = z.object({
  step: z.literal("location"),
  payload: locationSchema,
});

export const identityUpdateSchema = z.object({
  step: z.literal("identity"),
  payload: playerIdentitySchema,
});

export const availabilityUpdateSchema = z.object({
  step: z.literal("availability"),
  payload: z.object({
    slots: availabilitySchema,
  }),
});

export const crewUpdateSchema = z.object({
  step: z.literal("crew"),
  payload: crewChoiceSchema,
});

export const onboardingProgressUpdateSchema = z.discriminatedUnion("step", [
  welcomeUpdateSchema,
  gamesUpdateSchema,
  locationUpdateSchema,
  identityUpdateSchema,
  availabilityUpdateSchema,
  crewUpdateSchema,
]);

export type OnboardingStep = z.infer<typeof onboardingStepSchema>;
export type OnboardingStatus = z.infer<typeof onboardingStatusSchema>;
export type LocationInput = z.infer<typeof locationSchema>;
export type PlayerIdentityInput = z.infer<typeof playerIdentitySchema>;
export type AvailabilitySlot = z.infer<typeof availabilitySlotSchema>;
export type CrewChoice = z.infer<typeof crewChoiceSchema>;
export type OnboardingDraft = z.infer<typeof onboardingDraftSchema>;
export type OnboardingProgressUpdate = z.infer<typeof onboardingProgressUpdateSchema>;
