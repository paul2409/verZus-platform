import "server-only";

import { randomInt, randomUUID } from "node:crypto";

import type {
  AuthApiResponse,
  ForgotPasswordRequest,
  ResendVerificationRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from "../api/auth-api.schema";
import type { AuthState } from "../model/auth-state";
import {
  createSessionToken,
  hashOpaqueToken,
  hashPassword,
  normalizeIdentifier,
} from "./auth.crypto";
import { sendPasswordReset, sendVerificationCode } from "./auth.delivery";
import {
  claimActionWindow,
  consumePasswordReset,
  findIdentityUserById,
  findIdentityUserByIdentifier,
  replacePasswordResetToken,
  replaceVerificationCode,
  verifyEmailCode,
} from "./auth.identity.repository";
import type { AuthMutationResult } from "./auth.service";
import { readAccountSession, registerAccount } from "./auth.service";

function requestId(): string {
  return `auth-${randomUUID()}`;
}

function result(
  status: number,
  body: AuthApiResponse,
  sessionCookie: AuthMutationResult["sessionCookie"] = null,
): AuthMutationResult {
  return { status, body, sessionCookie };
}

function success(state: AuthState, message: string, id = requestId()): AuthMutationResult {
  return result(200, { ok: true, state, message, requestId: id });
}

function failure(
  status: number,
  code: string,
  message: string,
  options: { retryAfterSeconds?: number | null; fieldErrors?: Record<string, string[]> } = {},
): AuthMutationResult {
  return result(status, {
    ok: false,
    error: {
      code,
      message,
      requestId: requestId(),
      retryable: status >= 500 || status === 429,
      fieldErrors: options.fieldErrors ?? {},
      retryAfterSeconds: options.retryAfterSeconds ?? null,
    },
  });
}

function createVerificationCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

async function issueVerification(userId: string): Promise<void> {
  const user = await findIdentityUserById(userId);
  if (!user || user.emailVerifiedAt) return;

  const code = createVerificationCode();
  await replaceVerificationCode({
    userId,
    codeHash: hashOpaqueToken(code),
    expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    requestId: requestId(),
  });
  await sendVerificationCode({ email: user.email, gamerTag: user.gamerTag, code });
}

export async function registerAccountWithVerification(
  input: Parameters<typeof registerAccount>[0],
  deviceId: string | null,
): Promise<AuthMutationResult> {
  const registration = await registerAccount(input, deviceId);
  if (!registration.body.ok || registration.sessionCookie?.action !== "set") return registration;

  const session = await readAccountSession(registration.sessionCookie.value);
  if (session.user) await issueVerification(session.user.id);
  return registration;
}

export async function verifyCurrentEmail(
  rawToken: string | null,
  input: VerifyEmailRequest,
): Promise<AuthMutationResult> {
  const session = await readAccountSession(rawToken);
  if (!session.user) return failure(401, "unauthorized", "Sign in to verify your email.");

  const outcome = await verifyEmailCode({
    userId: session.user.id,
    codeHash: hashOpaqueToken(input.verificationCode),
    requestId: requestId(),
  });

  if (outcome === "verified" || outcome === "already_verified") {
    return success(
      session.user.onboardingComplete ? "authenticated" : "onboarding_incomplete",
      outcome === "verified" ? "Email verified." : "Email is already verified.",
    );
  }
  if (outcome === "expired")
    return failure(410, "expired_verification_code", "The code expired. Request another code.");
  if (outcome === "rate_limited")
    return failure(429, "rate_limited", "Too many incorrect codes. Request another code.", {
      retryAfterSeconds: 60,
    });
  return failure(400, "invalid_verification_code", "The verification code is incorrect.", {
    fieldErrors: { verificationCode: ["Enter the latest six-digit code."] },
  });
}

export async function resendCurrentVerification(
  rawToken: string | null,
  input: ResendVerificationRequest,
): Promise<AuthMutationResult> {
  const session = await readAccountSession(rawToken);
  if (!session.user?.email) return failure(401, "unauthorized", "Sign in to request another code.");
  if (session.user.email.toLowerCase() !== input.email.trim().toLowerCase()) {
    return failure(403, "forbidden", "The email does not match the signed-in account.");
  }

  const retry = await claimActionWindow({
    action: "verification_resend",
    keyHash: hashOpaqueToken(session.user.id),
    windowSeconds: 60,
  });
  if (retry !== null)
    return failure(429, "rate_limited", "Wait before requesting another code.", {
      retryAfterSeconds: retry,
    });

  await issueVerification(session.user.id);
  return success("email_unverified", "A new verification code was sent.");
}

export async function requestPasswordReset(
  input: ForgotPasswordRequest,
): Promise<AuthMutationResult> {
  const identifier = normalizeIdentifier(input.identifier);
  const user = await findIdentityUserByIdentifier(identifier);
  const generic = () => success("anonymous", "If the account exists, a reset link has been sent.");
  if (!user) return generic();

  const retry = await claimActionWindow({
    action: "password_reset",
    keyHash: hashOpaqueToken(user.id),
    windowSeconds: 60,
  });
  if (retry !== null) return generic();

  const { token, tokenHash } = createSessionToken();
  await replacePasswordResetToken({
    userId: user.id,
    tokenHash,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    requestId: requestId(),
  });
  await sendPasswordReset({ email: user.email, gamerTag: user.gamerTag, token }).catch(
    () => undefined,
  );
  return generic();
}

export async function resetAccountPassword(
  input: ResetPasswordRequest,
): Promise<AuthMutationResult> {
  const outcome = await consumePasswordReset({
    tokenHash: hashOpaqueToken(input.resetToken),
    passwordHash: await hashPassword(input.password),
    requestId: requestId(),
  });
  if (outcome === "reset")
    return success("anonymous", "Password updated. Sign in with your new password.");
  if (outcome === "expired")
    return failure(410, "expired_reset_token", "The reset link expired. Request another one.");
  return failure(
    400,
    "invalid_reset_token",
    "The reset link is invalid or has already been used.",
    { fieldErrors: { resetToken: ["Request a new password reset link."] } },
  );
}
