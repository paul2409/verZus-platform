// VERZUS M6.7 COMPETITION RELEASE GATE

import { afterEach, describe, expect, it } from "vitest";

import {
  getCompetitionReleaseMetadata,
  isCompetitionFeatureEnabled,
} from "./competition-release.config";

const original = { ...process.env };

afterEach(() => {
  process.env = { ...original };
});

describe("competition release configuration", () => {
  it("keeps competitions enabled by default", () => {
    delete process.env.NEXT_PUBLIC_ENABLE_M6_COMPETITIONS;
    expect(isCompetitionFeatureEnabled()).toBe(true);
  });

  it("supports an independent safe-disable flag", () => {
    process.env.NEXT_PUBLIC_ENABLE_M6_COMPETITIONS = "false";
    expect(isCompetitionFeatureEnabled()).toBe(false);
  });

  it("exposes traceable release metadata", () => {
    process.env.NEXT_PUBLIC_APP_ENV = "preview";
    process.env.NEXT_PUBLIC_RELEASE_SHA = "abc123";
    expect(getCompetitionReleaseMetadata()).toMatchObject({
      stage: "6.7",
      environment: "preview",
      release: "abc123",
    });
  });
});
