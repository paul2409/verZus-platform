// VERZUS M4 STEP 4.10

import { describe, expect, it } from "vitest";

import { createAppFailure } from "../../../shared/failures";
import { createAccountRestrictionFailure, resolveAuthFailureDisplay } from "./auth-failure.policy";

describe("authentication failure policy", () => {
  it("keeps invalid credentials on the form", () => {
    const display = resolveAuthFailureDisplay(
      createAppFailure({
        code: "invalid_credentials",
        source: "auth",
        message: "Credentials are invalid.",
        httpStatus: 401,
      }),
    );

    expect(display.action.kind).toBe("none");
    expect(display.preserveEnteredValues).toBe(true);
  });

  it("provides the correct recovery for expired codes and tokens", () => {
    expect(
      resolveAuthFailureDisplay(
        createAppFailure({
          code: "expired_verification_code",
          source: "auth",
          message: "Code expired.",
        }),
      ).action.kind,
    ).toBe("resend_verification");

    expect(
      resolveAuthFailureDisplay(
        createAppFailure({
          code: "expired_reset_token",
          source: "auth",
          message: "Token expired.",
        }),
      ).action.target,
    ).toBe("/forgot-password");
  });

  it("surfaces retry timing for rate limits", () => {
    const display = resolveAuthFailureDisplay(
      createAppFailure({
        code: "rate_limited",
        source: "auth",
        message: "Wait before retrying.",
        retryAfterSeconds: 60,
      }),
    );

    expect(display.message).toContain("60 seconds");
    expect(display.action.kind).toBe("none");
  });

  it("routes suspended and banned accounts to restriction screens", () => {
    const suspended = createAccountRestrictionFailure("suspended");
    const banned = createAccountRestrictionFailure("banned");

    expect(suspended?.code).toBe("suspended");
    expect(banned?.code).toBe("banned");

    if (suspended) {
      expect(resolveAuthFailureDisplay(suspended).action.target).toBe("/account/suspended");
    }

    if (banned) {
      expect(resolveAuthFailureDisplay(banned).action.target).toBe("/account/banned");
    }
  });

  it("does not create restriction failures for normal states", () => {
    expect(createAccountRestrictionFailure("authenticated")).toBeNull();
  });
});
