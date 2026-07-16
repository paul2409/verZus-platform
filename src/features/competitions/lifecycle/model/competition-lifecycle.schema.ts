import { z } from "zod";

import {
  competitionLifecycleScenarios,
  competitionLifecycleStates,
} from "./competition-lifecycle.types";

export const competitionLifecycleStateSchema = z.enum(competitionLifecycleStates);

export const competitionLifecycleScenarioSchema = z.enum(competitionLifecycleScenarios);

export const competitionLifecycleDispositionSchema = z.enum([
  "entry_open",
  "registration_closed",
  "waitlist_available",
  "not_eligible",
  "full_capacity",
  "cancelled",
  "offline",
  "partial_failure",
  "unauthorized",
  "forbidden",
  "not_found",
  "maintenance",
]);

export const competitionLifecycleActionSchema = z.enum([
  "none",
  "view_schedule",
  "review_eligibility",
  "view_waitlist",
  "retry",
  "sign_in",
  "back_to_discovery",
]);

export const competitionLifecyclePolicyInputSchema = z
  .object({
    competitionId: z.string().min(1),
    exists: z.boolean(),
    lifecycle: competitionLifecycleStateSchema,
    eligibility: z.enum(["eligible", "not_eligible"]),
    authorization: z.enum(["authorized", "unauthorized", "forbidden"]),
    system: z.enum(["available", "offline", "maintenance"]),
    registeredCount: z.number().int().nonnegative(),
    capacity: z.number().int().positive(),
    waitlistEnabled: z.boolean(),
    partialFailure: z.boolean(),
  })
  .superRefine((value, context) => {
    if (value.registeredCount > value.capacity) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["registeredCount"],
        message: "registeredCount cannot exceed capacity",
      });
    }
  });
