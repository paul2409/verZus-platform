// VERZUS M4 STEP 4.5

import { describe, expect, it } from "vitest";

import { adaptAuthApiPayload, createNetworkAuthFailure } from "./auth-api.adapter";

describe("authentication API adapter", () => {
  it("adapts a valid success envelope", () => {
    expect(
      adaptAuthApiPayload({
        ok: true,
        state: "authenticated",
        message: "Signed in.",
        requestId: "request-001",
      }),
    ).toEqual({
      ok: true,
      message: "Signed in.",
    });
  });

  it("adapts a structured API failure", () => {
    expect(
      adaptAuthApiPayload({
        ok: false,
        error: {
          code: "invalid_credentials",
          message: "Credentials are incorrect.",
          requestId: "request-002",
          retryable: false,
          fieldErrors: {},
          retryAfterSeconds: null,
        },
      }),
    ).toEqual({
      ok: false,
      error: {
        code: "invalid_credentials",
        message: "Credentials are incorrect.",
        requestId: "request-002",
        retryable: false,
        fieldErrors: {},
        retryAfterSeconds: null,
      },
    });
  });

  it("rejects malformed API payloads safely", () => {
    const result = adaptAuthApiPayload({
      success: true,
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.code).toBe("unknown");
      expect(result.error.retryable).toBe(true);
    }
  });

  it("creates a retryable network failure", () => {
    const result = createNetworkAuthFailure();

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.retryable).toBe(true);
    }
  });
});
