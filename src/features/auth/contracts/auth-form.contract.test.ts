// VERZUS M4 STEP 4.2

import { describe, expect, it } from "vitest";

import {
  authIdentifierSchema,
  emailVerificationFormSchema,
  registerFormSchema,
  resetPasswordFormSchema,
} from "./auth-form.schema";
import { canRetryAuthSubmission, createIdleAuthFormState, isAuthFormBusy } from "./auth-form.types";

describe("authentication form contracts", () => {
  it("accepts email and international phone identifiers", () => {
    expect(authIdentifierSchema.safeParse("player@example.com").success).toBe(true);
    expect(authIdentifierSchema.safeParse("+2348012345678").success).toBe(true);
    expect(authIdentifierSchema.safeParse("not-an-identifier").success).toBe(false);
  });

  it("rejects mismatched registration passwords", () => {
    const result = registerFormSchema.safeParse({
      gamerTag: "JayFlex",
      email: "player@example.com",
      phone: "",
      password: "StrongPass1!",
      confirmPassword: "DifferentPass1!",
      acceptedTerms: true,
    });

    expect(result.success).toBe(false);
  });

  it("requires an exact six-digit verification code", () => {
    expect(
      emailVerificationFormSchema.safeParse({
        verificationCode: "123456",
      }).success,
    ).toBe(true);
    expect(
      emailVerificationFormSchema.safeParse({
        verificationCode: "12345",
      }).success,
    ).toBe(false);
  });

  it("requires matching reset passwords and a valid token", () => {
    expect(
      resetPasswordFormSchema.safeParse({
        resetToken: "token-value-long-enough",
        password: "StrongPass1!",
        confirmPassword: "StrongPass1!",
      }).success,
    ).toBe(true);

    expect(
      resetPasswordFormSchema.safeParse({
        resetToken: "short",
        password: "StrongPass1!",
        confirmPassword: "DifferentPass1!",
      }).success,
    ).toBe(false);
  });

  it("defines deterministic busy and retry behaviour", () => {
    expect(createIdleAuthFormState()).toEqual({
      status: "idle",
      submitDisabled: false,
      error: null,
    });
    expect(isAuthFormBusy("submitting")).toBe(true);
    expect(isAuthFormBusy("idle")).toBe(false);
    expect(
      canRetryAuthSubmission({
        code: "service_unavailable",
        message: "Try again.",
        requestId: "request-001",
        retryable: true,
        fieldErrors: {},
        retryAfterSeconds: null,
      }),
    ).toBe(true);
  });
});
