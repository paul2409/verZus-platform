// VERZUS M4 STEP 4.10

import { describe, expect, it } from "vitest";

import { adaptHttpFailure, parseRetryAfterSeconds } from "./http-failure.adapter";

describe("HTTP failure adapter", () => {
  it("creates an offline failure before inspecting HTTP data", () => {
    const failure = adaptHttpFailure({
      source: "auth",
      status: null,
      payload: null,
      online: false,
    });

    expect(failure.code).toBe("offline");
    expect(failure.retryable).toBe(true);
  });

  it("preserves structured invalid-credential errors", () => {
    const failure = adaptHttpFailure({
      source: "auth",
      status: 401,
      online: true,
      payload: {
        ok: false,
        error: {
          code: "invalid_credentials",
          message: "The supplied credentials are invalid.",
          retryable: false,
          requestId: "auth-request-1",
          fieldErrors: {
            password: ["Check your password."],
          },
        },
      },
    });

    expect(failure.code).toBe("invalid_credentials");
    expect(failure.fieldErrors.password).toEqual(["Check your password."]);
  });

  it("normalizes verification and reset expiry aliases", () => {
    expect(
      adaptHttpFailure({
        source: "auth",
        status: 410,
        online: true,
        payload: {
          error: {
            code: "verification_code_expired",
          },
        },
      }).code,
    ).toBe("expired_verification_code");

    expect(
      adaptHttpFailure({
        source: "auth",
        status: 410,
        online: true,
        payload: {
          error: {
            code: "reset_token_expired",
          },
        },
      }).code,
    ).toBe("expired_reset_token");
  });

  it("maps maintenance and rate limits from status codes", () => {
    expect(
      adaptHttpFailure({
        source: "platform",
        status: 503,
        online: true,
        payload: {},
      }).code,
    ).toBe("maintenance");

    expect(
      adaptHttpFailure({
        source: "auth",
        status: 429,
        online: true,
        payload: {},
        retryAfterHeader: "120",
      }).retryAfterSeconds,
    ).toBe(120);
  });

  it("rejects malformed retry-after values", () => {
    expect(parseRetryAfterSeconds("not-a-date")).toBeNull();
  });
});
