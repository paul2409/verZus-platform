// VERZUS M4 STEP 4.5

import { describe, expect, it } from "vitest";

import { mockAuthScenarios } from "../../../mocks/auth/auth-scenarios";
import {
  authStateFromMockSession,
  mockForgotPassword,
  mockLogin,
  mockRefreshSession,
  mockRegister,
  mockResetPassword,
  mockSessionValues,
  mockVerifyEmail,
} from "./mock-auth.service";

describe("mock authentication service", () => {
  it("creates deterministic login states", () => {
    const authenticated = mockLogin(
      mockAuthScenarios.authenticated,
    );
    const onboarding = mockLogin(
      mockAuthScenarios.onboardingIncomplete,
    );
    const suspended = mockLogin(mockAuthScenarios.suspended);

    expect(authenticated.body.ok).toBe(true);
    expect(
      authenticated.body.ok && authenticated.body.state,
    ).toBe("authenticated");
    expect(onboarding.body.ok && onboarding.body.state).toBe(
      "onboarding_incomplete",
    );
    expect(suspended.body.ok && suspended.body.state).toBe(
      "suspended",
    );
  });

  it("rejects invalid credentials and rate-limits scenarios", () => {
    const invalid = mockLogin(
      mockAuthScenarios.invalidCredentials,
    );
    const limited = mockLogin(mockAuthScenarios.rateLimited);

    expect(invalid.status).toBe(401);
    expect(!invalid.body.ok && invalid.body.error.code).toBe(
      "invalid_credentials",
    );
    expect(limited.status).toBe(429);
    expect(!limited.body.ok && limited.body.error.code).toBe(
      "rate_limited",
    );
  });

  it("rejects duplicate registration without losing field context", () => {
    const result = mockRegister({
      gamerTag: "JayFlex",
      email: mockAuthScenarios.duplicateRegistrationEmail,
      phone: "",
      password: "StrongPass1!",
      confirmPassword: "StrongPass1!",
      acceptedTerms: true,
    });

    expect(result.status).toBe(409);
    expect(
      !result.body.ok && result.body.error.fieldErrors.email,
    ).toEqual(["Use another email address or sign in."]);
  });

  it("verifies only the deterministic current code", () => {
    const valid = mockVerifyEmail({
      verificationCode:
        mockAuthScenarios.validVerificationCode,
    });
    const expired = mockVerifyEmail({
      verificationCode:
        mockAuthScenarios.expiredVerificationCode,
    });

    expect(valid.body.ok && valid.body.state).toBe(
      "onboarding_incomplete",
    );
    expect(expired.status).toBe(410);
  });

  it("does not reveal account existence during recovery", () => {
    const result = mockForgotPassword({
      identifier: "unknown@example.com",
    });

    expect(result.status).toBe(200);
    expect(result.body.ok).toBe(true);
  });

  it("rejects expired reset tokens and clears valid sessions", () => {
    const expired = mockResetPassword({
      resetToken: mockAuthScenarios.expiredResetToken,
      password: "StrongPass1!",
      confirmPassword: "StrongPass1!",
    });
    const valid = mockResetPassword({
      resetToken: "valid-reset-token-value",
      password: "StrongPass1!",
      confirmPassword: "StrongPass1!",
    });

    expect(expired.status).toBe(410);
    expect(valid.sessionCookie).toEqual({
      action: "clear",
    });
  });

  it("maps and refreshes mock session cookies", () => {
    expect(
      authStateFromMockSession(
        mockSessionValues.onboarding_incomplete,
      ),
    ).toBe("onboarding_incomplete");

    const refreshed = mockRefreshSession(
      mockSessionValues.authenticated,
    );
    const missing = mockRefreshSession(null);

    expect(refreshed.status).toBe(200);
    expect(missing.status).toBe(401);
  });
});
