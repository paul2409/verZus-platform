// VERZUS M4 STEP 4.6

import type { AuthSubmitResult } from "../forms/auth-form.submitter";
import type { AuthSessionResponse } from "../model/auth-session.schema";
import { adaptAuthApiPayload, createNetworkAuthFailure } from "./auth-api.adapter";
import {
  authApiResponseSchema,
  authSessionEnvelopeSchema,
  type ForgotPasswordRequest,
  type LoginRequest,
  type RegisterRequest,
  type ResendVerificationRequest,
  type ResetPasswordRequest,
  type VerifyEmailRequest,
} from "./auth-api.schema";
import { redirectAfterAuthSuccess } from "./auth-redirect";

interface AuthRequestOptions {
  redirectOnSuccess?: boolean;
}

async function postAuthRequest<TInput>(
  path: string,
  input: TInput,
  options: AuthRequestOptions = {},
): Promise<AuthSubmitResult> {
  try {
    const response = await fetch(path, {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });

    const payload: unknown = await response.json();
    const result = adaptAuthApiPayload(payload);
    const envelope = authApiResponseSchema.safeParse(payload);

    if (result.ok && options.redirectOnSuccess === true && envelope.success && envelope.data.ok) {
      redirectAfterAuthSuccess(envelope.data.state);
    }

    return result;
  } catch {
    return createNetworkAuthFailure();
  }
}

export function login(input: LoginRequest): Promise<AuthSubmitResult> {
  return postAuthRequest("/api/auth/login", input, { redirectOnSuccess: true });
}

export function register(input: RegisterRequest): Promise<AuthSubmitResult> {
  return postAuthRequest("/api/auth/register", input, { redirectOnSuccess: true });
}

export function verifyEmail(input: VerifyEmailRequest): Promise<AuthSubmitResult> {
  return postAuthRequest("/api/auth/verify-email", input, { redirectOnSuccess: true });
}

export function resendVerification(input: ResendVerificationRequest): Promise<AuthSubmitResult> {
  return postAuthRequest("/api/auth/resend-verification", input);
}

export function forgotPassword(input: ForgotPasswordRequest): Promise<AuthSubmitResult> {
  return postAuthRequest("/api/auth/forgot-password", input);
}

export function resetPassword(input: ResetPasswordRequest): Promise<AuthSubmitResult> {
  return postAuthRequest("/api/auth/reset-password", input, { redirectOnSuccess: true });
}

export function logout(): Promise<AuthSubmitResult> {
  return postAuthRequest("/api/auth/logout", {}, { redirectOnSuccess: true });
}

export function refreshSession(): Promise<AuthSubmitResult> {
  return postAuthRequest("/api/auth/session/refresh", {});
}

export async function getCurrentSession(): Promise<AuthSessionResponse> {
  const response = await fetch("/api/me", {
    credentials: "same-origin",
    cache: "no-store",
  });
  const payload: unknown = await response.json();
  return authSessionEnvelopeSchema.parse(payload).data;
}
