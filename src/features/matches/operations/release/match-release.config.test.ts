// VERZUS M7.8 MATCH OPERATIONS RELEASE CONFIG TESTS

import { afterEach, describe, expect, it } from "vitest";

import {
  getMatchOperationsReleaseMetadata,
  isMatchOperationsFeatureEnabled,
} from "./match-release.config";

const originalFlag = process.env.NEXT_PUBLIC_ENABLE_M7_MATCH_OPERATIONS;
const originalEnvironment = process.env.NEXT_PUBLIC_APP_ENV;
const originalRelease = process.env.NEXT_PUBLIC_RELEASE_SHA;

afterEach(() => {
  process.env.NEXT_PUBLIC_ENABLE_M7_MATCH_OPERATIONS = originalFlag;
  process.env.NEXT_PUBLIC_APP_ENV = originalEnvironment;
  process.env.NEXT_PUBLIC_RELEASE_SHA = originalRelease;
});

describe("M7.8 match release configuration", () => {
  it("is enabled unless explicitly disabled", () => {
    delete process.env.NEXT_PUBLIC_ENABLE_M7_MATCH_OPERATIONS;
    expect(isMatchOperationsFeatureEnabled()).toBe(true);

    process.env.NEXT_PUBLIC_ENABLE_M7_MATCH_OPERATIONS = "false";
    expect(isMatchOperationsFeatureEnabled()).toBe(false);
  });

  it("exposes traceable release metadata", () => {
    process.env.NEXT_PUBLIC_APP_ENV = "preview";
    process.env.NEXT_PUBLIC_RELEASE_SHA = "release-abc123";

    expect(getMatchOperationsReleaseMetadata()).toEqual({
      stage: "7.8",
      environment: "preview",
      release: "release-abc123",
      enabled: true,
    });
  });
});
