import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/errors/api-error";

import { retryDelay, shouldRetryQuery } from "./retry-policy";

describe("query retry policy", () => {
  it("does not retry non-retryable API errors", () => {
    const error = new ApiError({ code: "FORBIDDEN", message: "Forbidden", retryable: false });
    expect(shouldRetryQuery(0, error)).toBe(false);
  });

  it("retries retryable failures up to the limit", () => {
    const error = new ApiError({ code: "UPSTREAM_TIMEOUT", message: "Timeout", retryable: true });
    expect(shouldRetryQuery(0, error)).toBe(true);
    expect(shouldRetryQuery(2, error)).toBe(false);
  });

  it("caps exponential retry delay", () => {
    expect(retryDelay(0)).toBe(1_000);
    expect(retryDelay(10)).toBe(8_000);
  });
});
