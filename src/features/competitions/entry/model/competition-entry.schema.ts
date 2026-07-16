import { z } from "zod";

export const competitionEntryLifecycleStateSchema = z.enum([
  "scheduled",
  "registration_open",
  "registration_closed",
  "check_in_open",
  "in_progress",
  "completed",
  "cancelled",
]);

export const competitionEntryRecordSchema = z.object({
  entryId: z.string().min(1),
  competitionId: z.string().min(1),
  competitionName: z.string().min(1),
  state: z.literal("confirmed"),
  stateLabel: z.string().min(1),
  entrantLabel: z.string().min(1),
  teamLabel: z.string().min(1),
  registeredAt: z.string().datetime({ offset: true }),
  registeredAtLabel: z.string().min(1),
  registrationCode: z.string().min(1),
  entryFeeLabel: z.string().min(1),
  checkInLabel: z.string().min(1),
});

export const competitionEntryControlSchema = z.object({
  competitionId: z.string().min(1),
  competitionName: z.string().min(1),
  lifecycleState: competitionEntryLifecycleStateSchema,
  lifecycleLabel: z.string().min(1),
  stateVersion: z.string().min(1),
  canEnter: z.boolean(),
  eligibilityState: z.enum(["eligible", "not_eligible", "pending"]),
  eligibilityLabel: z.string().min(1),
  eligibilitySummary: z.string().min(1),
  entrantLabel: z.string().min(1),
  teamLabel: z.string().min(1),
  gameLabel: z.string().min(1),
  formatLabel: z.string().min(1),
  entryFeeLabel: z.string().min(1),
  rosterLockLabel: z.string().min(1),
  checkInLabel: z.string().min(1),
  existingEntry: competitionEntryRecordSchema.nullable(),
});

export const competitionEntryCommandSchema = z.object({
  competitionId: z.string().min(1),
  expectedStateVersion: z.string().min(1),
  idempotencyKey: z.string().uuid(),
  acceptedTerms: z.literal(true),
});

export const competitionEntryControlResourceDataSchema = z.object({
  value: competitionEntryControlSchema,
  meta: z.object({
    requestId: z.string().min(1),
    serverNow: z.string().datetime({ offset: true }),
    lastUpdatedAt: z.string().datetime({ offset: true }),
    freshness: z.enum(["fresh", "stale"]),
  }),
});
