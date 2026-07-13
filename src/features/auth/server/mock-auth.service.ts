// VERZUS M4 STEP 4.5

import type { AuthState } from "../model";
import {
  authStateFromMockSession,
  MOCK_SESSION_COOKIE,
  mockSessionValues,
} from "../../../shared/session/mock-session";
import type {
  AuthApiFailureResponse,
  AuthApiResponse,
  AuthApiSuccessResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResendVerificationRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from "../api/auth-api.schema";
import { mockAuthScenarios } from "../../../mocks/auth/auth-scenarios";

export { authStateFromMockSession, MOCK_SESSION_COOKIE, mockSessionValues };

export type MockSessionCookieMutation =
  | {
      action: "set";
      value: string;
    }
  | {
      action: "clear";
    };

export interface MockAuthMutationResult {
  status: number;
  body: AuthApiResponse;
  sessionCookie: MockSessionCookieMutation | null;
}

function requestId(): string {
  return `mock-auth-${globalThis.crypto.randomUUID()}`;
}

function success(
  state: AuthState,
  message: string,
  sessionCookie: MockSessionCookieMutation | null = null,
): MockAuthMutationResult {
  const body: AuthApiSuccessResponse = {
    ok: true,
    state,
    message,
    requestId: requestId(),
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
  },
): MockAuthMutationResult {
  const body: AuthApiFailureResponse = {
    ok: false,
    error: {
      code,
      message,
      requestId: requestId(),
      retryable: options?.retryable ?? false,
      fieldErrors: options?.fieldErrors ?? {},
      retryAfterSeconds: options?.retryAfterSeconds ?? null,
    },
  };

  return {
    status,
    body,
    sessionCookie: null,
  };
}

function stateForIdentifier(identifier: string): AuthState {
  const normalized = identifier.trim().toLowerCase();

  if (normalized === mockAuthScenarios.emailUnverified.identifier) {
    return "email_unverified";
  }

  if (normalized === mockAuthScenarios.onboardingIncomplete.identifier) {
    return "onboarding_incomplete";
  }

  if (normalized === mockAuthScenarios.suspended.identifier) {
    return "suspended";
  }

  if (normalized === mockAuthScenarios.banned.identifier) {
    return "banned";
  }

  return "authenticated";
}

function sessionCookieForState(state: AuthState): MockSessionCookieMutation | null {
  if (state === "anonymous" || state === "authenticating" || state === "session_expired") {
    return null;
  }

  return {
    action: "set",
    value: mockSessionValues[state],
  };
}

export function mockLogin(input: LoginRequest): MockAuthMutationResult {
  const identifier = input.identifier.trim().toLowerCase();

  if (identifier === mockAuthScenarios.rateLimited.identifier) {
    return failure(429, "rate_limited", "Too many sign-in attempts. Wait before retrying.", {
      retryable: true,
      retryAfterSeconds: 30,
    });
  }

  if (input.password === mockAuthScenarios.invalidCredentials.password) {
    return failure(
      401,
      "invalid_credentials",
      "The email, phone number, or password is incorrect.",
    );
  }

  const state = stateForIdentifier(identifier);

  if (state === "suspended") {
    return success(
      state,
      "This account is suspended and requires review.",
      sessionCookieForState(state),
    );
  }

  if (state === "banned") {
    return success(
      state,
      "This account is banned and cannot access VERZUS.",
      sessionCookieForState(state),
    );
  }

  return success(
    state,
    "Mock session created. Server-side routing is added in M4 Step 4.6.",
    sessionCookieForState(state),
  );
}

export function mockRegister(input: RegisterRequest): MockAuthMutationResult {
  if (input.email.trim().toLowerCase() === mockAuthScenarios.duplicateRegistrationEmail) {
    return failure(409, "duplicate_account", "An account already exists for this email address.", {
      fieldErrors: {
        email: ["Use another email address or sign in."],
      },
    });
  }

  return success("email_unverified", "Mock account created. Verify your email to continue.", {
    action: "set",
    value: mockSessionValues.email_unverified,
  });
}

export function mockVerifyEmail(input: VerifyEmailRequest): MockAuthMutationResult {
  if (input.verificationCode === mockAuthScenarios.expiredVerificationCode) {
    return failure(410, "expired_verification_code", "This verification code has expired.", {
      retryable: true,
    });
  }

  if (input.verificationCode === mockAuthScenarios.rateLimitedVerificationCode) {
    return failure(429, "rate_limited", "Too many verification attempts. Wait before retrying.", {
      retryable: true,
      retryAfterSeconds: 45,
    });
  }

  if (input.verificationCode !== mockAuthScenarios.validVerificationCode) {
    return failure(400, "invalid_verification_code", "The verification code is incorrect.", {
      fieldErrors: {
        verificationCode: ["Enter the current six-digit code."],
      },
    });
  }

  return success("onboarding_incomplete", "Email verified. Continue to onboarding.", {
    action: "set",
    value: mockSessionValues.onboarding_incomplete,
  });
}

export function mockResendVerification(_input: ResendVerificationRequest): MockAuthMutationResult {
  void _input;
  return success("email_unverified", "A new verification code was requested.", {
    action: "set",
    value: mockSessionValues.email_unverified,
  });
}

export function mockForgotPassword(_input: ForgotPasswordRequest): MockAuthMutationResult {
  void _input;
  return success(
    "anonymous",
    "If an account matches those details, recovery instructions will be sent.",
  );
}

export function mockResetPassword(input: ResetPasswordRequest): MockAuthMutationResult {
  if (
    input.resetToken === mockAuthScenarios.expiredResetToken ||
    input.resetToken.toLowerCase().includes("expired")
  ) {
    return failure(410, "expired_reset_token", "This password-reset link has expired.");
  }

  return success("anonymous", "Password updated. Sign in with your new password.", {
    action: "clear",
  });
}

export function mockLogout(): MockAuthMutationResult {
  return success("anonymous", "Signed out safely.", {
    action: "clear",
  });
}

export function mockRefreshSession(cookieValue: string | null): MockAuthMutationResult {
  const state = authStateFromMockSession(cookieValue);

  if (state === "anonymous") {
    return failure(401, "session_expired", "The session is missing or expired.");
  }

  return success(state, "Mock session refreshed.", sessionCookieForState(state));
}
