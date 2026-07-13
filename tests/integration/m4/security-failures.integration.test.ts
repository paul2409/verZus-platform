// VERZUS M4 STEP 4.11

import { describe, expect, it } from "vitest";

import { resolveAuthFailureDisplay } from "../../../src/features/auth/security/auth-failure.policy";
import { resolveOnboardingFailureDisplay } from "../../../src/features/onboarding/security/onboarding-failure.policy";
import { adaptHttpFailure, createAppFailure } from "../../../src/shared/failures";

describe("M4 security and failure integration", () => {
  it.each([
    ["invalid_credentials", 401, "Sign-in failed"],
    ["duplicate_account", 409, "Account already exists"],
    ["expired_verification_code", 410, "Verification code expired"],
    ["expired_reset_token", 410, "Reset link expired"],
  ] as const)(
    "normalizes %s into its authentication recovery model",
    (code, status, expectedTitle) => {
      const failure = adaptHttpFailure({
        source: "auth",
        status,
        online: true,
        payload: {
          ok: false,
          error: {
            code,
            message: `${code} message`,
            retryable: false,
            fieldErrors: {},
            requestId: `request-${code}`,
          },
        },
      });

      expect(resolveAuthFailureDisplay(failure).title).toBe(expectedTitle);
    },
  );

  it("preserves retry timing for rate limits", () => {
    const failure = adaptHttpFailure({
      source: "auth",
      status: 429,
      online: true,
      retryAfterHeader: "90",
      payload: {
        error: {
          code: "rate_limited",
          message: "Wait before retrying.",
          retryable: true,
        },
      },
    });

    expect(failure.retryAfterSeconds).toBe(90);
    expect(resolveAuthFailureDisplay(failure).message).toContain("90 seconds");
  });

  it("keeps partial onboarding data usable", () => {
    const display = resolveOnboardingFailureDisplay(
      createAppFailure({
        code: "partial_failure",
        source: "onboarding",
        message: "Crew discovery returned partial results.",
        retryable: true,
      }),
    );

    expect(display.state).toBe("partial_failure");
    expect(display.preserveDraft).toBe(true);
    expect(display.survivingActions).toContain("Use available options");
  });

  it.each(["suspended", "banned"] as const)("blocks onboarding for a %s account", (code) => {
    const display = resolveOnboardingFailureDisplay(
      createAppFailure({
        code,
        source: "auth",
        message: `${code} account`,
        httpStatus: 403,
      }),
    );

    expect(display.state).toBe("forbidden");
    expect(display.retryable).toBe(false);
    expect(display.preserveDraft).toBe(true);
  });
});
