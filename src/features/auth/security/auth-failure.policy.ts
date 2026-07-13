// VERZUS M4 STEP 4.10

import type { AuthState } from "../model/auth-state";
import { createAppFailure, type AppFailure } from "../../../shared/failures";

export type AuthFailureActionKind =
  "retry" | "navigate" | "resend_verification" | "request_password_reset" | "none";

export interface AuthFailureAction {
  kind: AuthFailureActionKind;
  label: string;
  target: string | null;
}

export interface AuthFailureDisplayModel {
  title: string;
  message: string;
  action: AuthFailureAction;
  preserveEnteredValues: boolean;
  announceAssertively: boolean;
}

export function createAccountRestrictionFailure(
  state: AuthState,
  reason: string | null = null,
): AppFailure | null {
  if (state === "suspended") {
    return createAppFailure({
      code: "suspended",
      source: "auth",
      message: reason ?? "This account is temporarily suspended.",
      httpStatus: 403,
      retryable: false,
    });
  }

  if (state === "banned") {
    return createAppFailure({
      code: "banned",
      source: "auth",
      message: reason ?? "This account has been banned.",
      httpStatus: 403,
      retryable: false,
    });
  }

  return null;
}

export function resolveAuthFailureDisplay(failure: AppFailure): AuthFailureDisplayModel {
  switch (failure.code) {
    case "invalid_credentials":
      return {
        title: "Sign-in failed",
        message: failure.message,
        action: {
          kind: "none",
          label: "",
          target: null,
        },
        preserveEnteredValues: true,
        announceAssertively: true,
      };

    case "duplicate_account":
      return {
        title: "Account already exists",
        message: failure.message,
        action: {
          kind: "navigate",
          label: "Go to login",
          target: "/login",
        },
        preserveEnteredValues: true,
        announceAssertively: true,
      };

    case "expired_verification_code":
      return {
        title: "Verification code expired",
        message: failure.message,
        action: {
          kind: "resend_verification",
          label: "Send a new code",
          target: null,
        },
        preserveEnteredValues: true,
        announceAssertively: true,
      };

    case "expired_reset_token":
      return {
        title: "Reset link expired",
        message: failure.message,
        action: {
          kind: "request_password_reset",
          label: "Request a new link",
          target: "/forgot-password",
        },
        preserveEnteredValues: false,
        announceAssertively: true,
      };

    case "rate_limited":
      return {
        title: "Too many attempts",
        message:
          failure.retryAfterSeconds === null
            ? failure.message
            : `${failure.message} Retry in ${failure.retryAfterSeconds} seconds.`,
        action: {
          kind: "none",
          label: "",
          target: null,
        },
        preserveEnteredValues: true,
        announceAssertively: true,
      };

    case "offline":
      return {
        title: "You are offline",
        message: failure.message,
        action: {
          kind: "retry",
          label: "Retry",
          target: null,
        },
        preserveEnteredValues: true,
        announceAssertively: false,
      };

    case "maintenance":
      return {
        title: "Authentication unavailable",
        message: failure.message,
        action: {
          kind: "retry",
          label: "Try again",
          target: null,
        },
        preserveEnteredValues: true,
        announceAssertively: false,
      };

    case "session_refresh_failed":
    case "unauthorized":
      return {
        title: "Session expired",
        message: failure.message,
        action: {
          kind: "navigate",
          label: "Sign in again",
          target: "/session-expired",
        },
        preserveEnteredValues: false,
        announceAssertively: true,
      };

    case "suspended":
      return {
        title: "Account suspended",
        message: failure.message,
        action: {
          kind: "navigate",
          label: "View account status",
          target: "/account/suspended",
        },
        preserveEnteredValues: false,
        announceAssertively: true,
      };

    case "banned":
      return {
        title: "Account banned",
        message: failure.message,
        action: {
          kind: "navigate",
          label: "View account status",
          target: "/account/banned",
        },
        preserveEnteredValues: false,
        announceAssertively: true,
      };

    default:
      return {
        title: "Authentication error",
        message: failure.message,
        action: {
          kind: failure.retryable ? "retry" : "none",
          label: failure.retryable ? "Retry" : "",
          target: null,
        },
        preserveEnteredValues: true,
        announceAssertively: true,
      };
  }
}
