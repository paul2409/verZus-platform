// VERZUS M4 STEP 4.5

import { z } from "zod";

import {
  emailSchema,
  emailVerificationFormSchema,
  forgotPasswordFormSchema,
  loginFormSchema,
  registerFormSchema,
  resetPasswordFormSchema,
} from "../contracts";
import { authSessionResponseSchema, authStateSchema } from "../model";

export const loginRequestSchema = loginFormSchema;
export const registerRequestSchema = registerFormSchema;
export const verifyEmailRequestSchema = emailVerificationFormSchema;
export const forgotPasswordRequestSchema = forgotPasswordFormSchema;
export const resetPasswordRequestSchema = resetPasswordFormSchema;

export const resendVerificationRequestSchema = z.object({
  email: emailSchema,
});

export const authApiFieldErrorsSchema = z.record(z.string(), z.array(z.string()));

export const authApiErrorSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  requestId: z.string().min(1).nullable(),
  retryable: z.boolean(),
  fieldErrors: authApiFieldErrorsSchema,
  retryAfterSeconds: z.number().int().nonnegative().nullable(),
});

export const authApiFailureResponseSchema = z.object({
  ok: z.literal(false),
  error: authApiErrorSchema,
});

export const authApiSuccessResponseSchema = z.object({
  ok: z.literal(true),
  state: authStateSchema,
  message: z.string().min(1),
  requestId: z.string().min(1),
});

export const authApiResponseSchema = z.discriminatedUnion("ok", [
  authApiSuccessResponseSchema,
  authApiFailureResponseSchema,
]);

export const authSessionEnvelopeSchema = z.object({
  ok: z.literal(true),
  data: authSessionResponseSchema,
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type VerifyEmailRequest = z.infer<typeof verifyEmailRequestSchema>;
export type ResendVerificationRequest = z.infer<typeof resendVerificationRequestSchema>;
export type ForgotPasswordRequest = z.infer<typeof forgotPasswordRequestSchema>;
export type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>;
export type AuthApiError = z.infer<typeof authApiErrorSchema>;
export type AuthApiFailureResponse = z.infer<typeof authApiFailureResponseSchema>;
export type AuthApiSuccessResponse = z.infer<typeof authApiSuccessResponseSchema>;
export type AuthApiResponse = z.infer<typeof authApiResponseSchema>;
export type AuthSessionEnvelope = z.infer<typeof authSessionEnvelopeSchema>;
