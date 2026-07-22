import "server-only";

import { randomUUID } from "node:crypto";

import type {
  AuthApiFailureResponse,
  AuthApiResponse,
  AuthApiSuccessResponse,
  LoginRequest,
  RegisterRequest,
} from "../api/auth-api.schema";
import type { AuthSessionResponse } from "../model/auth-session.schema";
import type { AuthState } from "../model/auth-state";
import {
  AUTH_LOGIN_BLOCK_SECONDS,
  AUTH_LOGIN_MAX_FAILURES,
  AUTH_LOGIN_WINDOW_SECONDS,
  AUTH_SESSION_MAX_AGE_SECONDS,
} from "./auth.constants";
import {
  createSessionToken,
  hashOpaqueToken,
  hashPassword,
  normalizeEmail,
  normalizeGamerTag,
  normalizeIdentifier,
  normalizePhone,
  verifyPassword,
} from "./auth.crypto";
import {
  clearLoginThrottle,
  createSession,
  createUserAndSession,
  findActiveSession,
  findRegistrationConflicts,
  findUserByIdentifier,
  getLoginThrottle,
  recordLoginFailure,
  revokeSession,
  rotateSession,
  type AuthSessionRecord,
  type AuthUserRecord,
} from "./auth.repository";

export type AuthSessionCookieMutation =
  | {
      action: "set";
      value: string;
      maxAgeSeconds: number;
    }
  | {
      action: "clear";
    };

export interface AuthMutationResult {
  status: number;
  body: AuthApiResponse;
  sessionCookie: AuthSessionCookieMutation | null;
}

function requestId(): string {
  return `auth-${randomUUID()}`;
}

function success(
  state: AuthState,
  message: string,
  sessionCookie: AuthSessionCookieMutation | null = null,
  id = requestId(),
): AuthMutationResult {
  const body: AuthApiSuccessResponse = {
    ok: true,
    state,
    message,
    requestId: id,
  };

  return {
    status: 200,
    body,
    sessionCookie,
  };
}

function failure(
  status: number,
  code: string,
  message: string,
  options?: {
    retryable?: boolean;
    fieldErrors?: Record<string, string[]>;
    retryAfterSeconds?: number | null;
    requestId?: string;
    clearSession?: boolean;
  },
): AuthMutationResult {
  const body: AuthApiFailureResponse = {
    ok: false,
    error: {
      code,
      message,
      requestId: options?.requestId ?? requestId(),
      retryable: options?.retryable ?? false,
      fieldErrors: options?.fieldErrors ?? {},
      retryAfterSeconds: options?.retryAfterSeconds ?? null,
    },
  };

  return {
    status,
    body,
    sessionCookie: options?.clearSession ? { action: "clear" } : null,
  };
}

function sessionExpiry(): Date {
  return new Date(Date.now() + AUTH_SESSION_MAX_AGE_SECONDS * 1000);
}

function stateForUser(user: AuthUserRecord): AuthState {
  if (user.status === "suspended") return "suspended";
  if (user.status === "banned") return "banned";
  if (!user.emailVerifiedAt) return "email_unverified";
  if (!user.onboardingCompletedAt) return "onboarding_incomplete";
  return "authenticated";
}

function retryAfterSeconds(blockedUntil: Date | null): number | null {
  if (!blockedUntil) return null;
  return Math.max(1, Math.ceil((blockedUntil.getTime() - Date.now()) / 1000));
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "23505"
  );
}

function createCookieMutation(token: string): AuthSessionCookieMutation {
  return {
    action: "set",
    value: token,
    maxAgeSeconds: AUTH_SESSION_MAX_AGE_SECONDS,
  };
}

export async function registerAccount(
  input: RegisterRequest,
  deviceId: string | null,
): Promise<AuthMutationResult> {
  const normalizedEmail = normalizeEmail(input.email);
  const normalizedPhone = input.phone ? normalizePhone(input.phone) : null;
  const normalizedGamerTag = normalizeGamerTag(input.gamerTag);
  const conflicts = await findRegistrationConflicts({
    normalizedEmail,
    normalizedPhone,
    normalizedGamerTag,
  });

  const fieldErrors: Record<string, string[]> = {};
  if (conflicts.email) fieldErrors.email = ["Use another email address or sign in."];
  if (conflicts.phone) fieldErrors.phone = ["This phone number is already linked to an account."];
  if (conflicts.gamerTag) fieldErrors.gamerTag = ["This gamer tag is already taken."];

  if (Object.keys(fieldErrors).length > 0) {
    return failure(409, "duplicate_account", "An account already uses these details.", {
      fieldErrors,
    });
  }

  const id = requestId();
  const userId = randomUUID();
  const sessionId = randomUUID();
  const { token, tokenHash } = createSessionToken();
  const passwordHash = await hashPassword(input.password);

  try {
    await createUserAndSession({
      userId,
      email: input.email.trim(),
      normalizedEmail,
      phone: input.phone ? input.phone.trim() : null,
      normalizedPhone,
      gamerTag: input.gamerTag.trim(),
      normalizedGamerTag,
      passwordHash,
      sessionId,
      tokenHash,
      deviceId,
      expiresAt: sessionExpiry(),
      requestId: id,
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return failure(409, "duplicate_account", "An account already uses these details.", {
        fieldErrors: {
          email: ["Review the email, phone number, and gamer tag, then try again."],
        },
        requestId: id,
      });
    }

    throw error;
  }

  return success(
    "email_unverified",
    "Account created. Verify your email to continue.",
    createCookieMutation(token),
    id,
  );
}

export async function loginAccount(
  input: LoginRequest,
  deviceId: string | null,
): Promise<AuthMutationResult> {
  const identifier = normalizeIdentifier(input.identifier);
  const identifierHash = hashOpaqueToken(identifier);
  const throttle = await getLoginThrottle(identifierHash);
  const blockedSeconds = retryAfterSeconds(throttle?.blockedUntil ?? null);

  if (blockedSeconds !== null) {
    return failure(429, "rate_limited", "Too many sign-in attempts. Wait before retrying.", {
      retryable: true,
      retryAfterSeconds: blockedSeconds,
    });
  }

  const user = await findUserByIdentifier(identifier);
  const passwordMatches = user ? await verifyPassword(input.password, user.passwordHash) : false;

  if (!user || !passwordMatches) {
    const nextThrottle = await recordLoginFailure({
      identifierHash,
      maxFailures: AUTH_LOGIN_MAX_FAILURES,
      windowSeconds: AUTH_LOGIN_WINDOW_SECONDS,
      blockSeconds: AUTH_LOGIN_BLOCK_SECONDS,
    });
    const nextBlockedSeconds = retryAfterSeconds(nextThrottle.blockedUntil);

    if (nextBlockedSeconds !== null) {
      return failure(429, "rate_limited", "Too many sign-in attempts. Wait before retrying.", {
        retryable: true,
        retryAfterSeconds: nextBlockedSeconds,
      });
    }

    return failure(
      401,
      "invalid_credentials",
      "The email, phone number, or password is incorrect.",
    );
  }

  await clearLoginThrottle(identifierHash);

  const id = requestId();
  const sessionId = randomUUID();
  const { token, tokenHash } = createSessionToken();
  await createSession({
    sessionId,
    userId: user.id,
    tokenHash,
    deviceId,
    expiresAt: sessionExpiry(),
    requestId: id,
  });

  return success(stateForUser(user), "Signed in securely.", createCookieMutation(token), id);
}

export async function logoutAccount(rawToken: string | null): Promise<AuthMutationResult> {
  if (rawToken) {
    await revokeSession(hashOpaqueToken(rawToken));
  }

  return success("anonymous", "Signed out safely.", { action: "clear" });
}

export async function refreshAccountSession(rawToken: string | null): Promise<AuthMutationResult> {
  if (!rawToken) {
    return failure(401, "session_missing", "Sign in again to continue.", {
      clearSession: true,
    });
  }

  const { token, tokenHash } = createSessionToken();
  const session = await rotateSession({
    currentTokenHash: hashOpaqueToken(rawToken),
    nextTokenHash: tokenHash,
    nextExpiresAt: sessionExpiry(),
  });

  if (!session) {
    return failure(401, "session_expired", "Your session has expired. Sign in again.", {
      clearSession: true,
    });
  }

  return success(stateForUser(session.user), "Session refreshed.", createCookieMutation(token));
}

function sessionResponse(
  state: AuthState,
  session: AuthSessionRecord | null,
  id = requestId(),
): AuthSessionResponse {
  return {
    state,
    user: session
      ? {
          id: session.user.id,
          email: session.user.email,
          phone: session.user.phone,
          role: session.user.role,
          emailVerified: session.user.emailVerifiedAt !== null,
          onboardingComplete: session.user.onboardingCompletedAt !== null,
        }
      : null,
    session: session
      ? {
          id: session.id,
          expiresAt: session.expiresAt.toISOString(),
          refreshable: true,
          deviceId: session.deviceId,
        }
      : null,
    restrictionReason: session?.user.restrictionReason ?? null,
    requestId: id,
  };
}

export async function readAccountSession(rawToken: string | null): Promise<AuthSessionResponse> {
  if (!rawToken) {
    return sessionResponse("anonymous", null);
  }

  const session = await findActiveSession(hashOpaqueToken(rawToken));
  if (!session) {
    return sessionResponse("session_expired", null);
  }

  return sessionResponse(stateForUser(session.user), session);
}
