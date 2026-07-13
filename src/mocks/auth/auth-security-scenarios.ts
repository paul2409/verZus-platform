// VERZUS M4 STEP 4.10

import type { AppFailureCode } from "../../shared/failures";

export interface AuthSecurityScenario {
  id: string;
  code: AppFailureCode;
  httpStatus: number;
  retryable: boolean;
  trigger: string;
}

export const authSecurityScenarios = [
  {
    id: "invalid-credentials",
    code: "invalid_credentials",
    httpStatus: 401,
    retryable: false,
    trigger: "Use an incorrect password during mock login.",
  },
  {
    id: "duplicate-account",
    code: "duplicate_account",
    httpStatus: 409,
    retryable: false,
    trigger: "Register with the configured duplicate mock email.",
  },
  {
    id: "expired-verification-code",
    code: "expired_verification_code",
    httpStatus: 410,
    retryable: false,
    trigger: "Submit the configured expired verification code.",
  },
  {
    id: "expired-reset-token",
    code: "expired_reset_token",
    httpStatus: 410,
    retryable: false,
    trigger: "Submit the configured expired reset token.",
  },
  {
    id: "rate-limited",
    code: "rate_limited",
    httpStatus: 429,
    retryable: true,
    trigger: "Use the configured rate-limit mock identity.",
  },
  {
    id: "session-refresh-failure",
    code: "session_refresh_failed",
    httpStatus: 401,
    retryable: false,
    trigger: "Refresh with an absent or expired mock session.",
  },
  {
    id: "suspended-account",
    code: "suspended",
    httpStatus: 403,
    retryable: false,
    trigger: "Sign in with the suspended mock account.",
  },
  {
    id: "banned-account",
    code: "banned",
    httpStatus: 403,
    retryable: false,
    trigger: "Sign in with the banned mock account.",
  },
] as const satisfies readonly AuthSecurityScenario[];
