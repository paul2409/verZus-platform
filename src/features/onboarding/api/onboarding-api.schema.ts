// VERZUS M4 STEP 4.7

import { z } from "zod";

import { onboardingDraftSchema, onboardingProgressUpdateSchema } from "../model";

export const onboardingApiErrorSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  requestId: z.string().min(1),
  retryable: z.boolean(),
  fieldErrors: z.record(z.string(), z.array(z.string())),
});

export const onboardingProgressSuccessSchema = z.object({
  ok: z.literal(true),
  data: onboardingDraftSchema,
  requestId: z.string().min(1),
});

export const onboardingApiFailureSchema = z.object({
  ok: z.literal(false),
  error: onboardingApiErrorSchema,
});

export const onboardingApiResponseSchema = z.discriminatedUnion("ok", [
  onboardingProgressSuccessSchema,
  onboardingApiFailureSchema,
]);

export const onboardingProgressRequestSchema = onboardingProgressUpdateSchema;

export type OnboardingApiError = z.infer<typeof onboardingApiErrorSchema>;
export type OnboardingProgressSuccess = z.infer<typeof onboardingProgressSuccessSchema>;
export type OnboardingApiFailure = z.infer<typeof onboardingApiFailureSchema>;
export type OnboardingApiResponse = z.infer<typeof onboardingApiResponseSchema>;
