// VERZUS M4 STEP 4.10

import { z } from "zod";

export const appFailureCodeValues = [
  "invalid_credentials",
  "duplicate_account",
  "expired_verification_code",
  "expired_reset_token",
  "rate_limited",
  "offline",
  "maintenance",
  "session_refresh_failed",
  "suspended",
  "banned",
  "partial_failure",
  "unauthorized",
  "forbidden",
  "validation_failed",
  "unknown",
] as const;

export const appFailureCodeSchema = z.enum(appFailureCodeValues);

export const appFailureSourceSchema = z.enum(["auth", "onboarding", "network", "platform"]);

export const appFailureSchema = z.object({
  code: appFailureCodeSchema,
  source: appFailureSourceSchema,
  message: z.string().min(1),
  httpStatus: z.number().int().nullable(),
  retryable: z.boolean(),
  fieldErrors: z.record(z.string(), z.array(z.string())),
  retryAfterSeconds: z.number().int().nonnegative().nullable(),
  requestId: z.string().min(1).nullable(),
});

export type AppFailureCode = z.infer<typeof appFailureCodeSchema>;
export type AppFailureSource = z.infer<typeof appFailureSourceSchema>;
export type AppFailure = z.infer<typeof appFailureSchema>;
