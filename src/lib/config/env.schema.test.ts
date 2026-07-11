import { describe, expect, it } from "vitest";

import { parsePublicEnv, parseServerEnv } from "./env.schema";

describe("environment validation", () => {
  it("uses safe local defaults", () => {
    expect(parsePublicEnv({})).toMatchObject({
      appEnv: "local",
      enableMocks: true,
      releaseSha: "local",
    });
  });

  it("rejects mocks in production", () => {
    expect(() =>
      parsePublicEnv({
        NEXT_PUBLIC_APP_ENV: "production",
        NEXT_PUBLIC_ENABLE_MOCKS: "true",
      }),
    ).toThrow("Mocks must be disabled");
  });

  it("requires production infrastructure secrets", () => {
    expect(() =>
      parseServerEnv({
        NEXT_PUBLIC_APP_ENV: "production",
      }),
    ).toThrow("DATABASE_URL is required");
  });

  it("accepts valid production infrastructure values", () => {
    expect(
      parseServerEnv({
        NEXT_PUBLIC_APP_ENV: "production",
        DATABASE_URL: "https://database.internal.example/verzus",
        AUTH_SECRET: "a-production-secret-with-more-than-32-characters",
        REDIS_URL: "https://redis.internal.example",
      }),
    ).toMatchObject({
      databaseUrl: "https://database.internal.example/verzus",
    });
  });
});
