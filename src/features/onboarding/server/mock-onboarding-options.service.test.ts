// VERZUS M4 STEP 4.9

import { describe, expect, it } from "vitest";

import {
  getMockOnboardingAvailabilityOptions,
  getMockOnboardingCrewOptions,
  getMockOnboardingGameOptions,
  getMockOnboardingLocationOptions,
} from "./mock-onboarding-options.service";

describe("mock onboarding options service", () => {
  it("returns successful game options", () => {
    const result = getMockOnboardingGameOptions("success");

    expect(result.status).toBe(200);

    if (result.body.ok) {
      expect(result.body.data.games.length).toBeGreaterThan(0);
    }
  });

  it("supports an explicit empty game catalog", () => {
    const result = getMockOnboardingGameOptions("empty");

    expect(result.status).toBe(200);

    if (result.body.ok) {
      expect(result.body.data.games).toEqual([]);
    }
  });

  it("supports partial location data without failing the route", () => {
    const result = getMockOnboardingLocationOptions("partial_failure", "NG", null);

    expect(result.status).toBe(200);

    if (result.body.ok) {
      expect(result.body.data.meta.status).toBe("partial");
      expect(result.body.data.meta.warnings.length).toBeGreaterThan(0);
    }
  });

  it("keeps Crew skip available when no suggestions exist", () => {
    const result = getMockOnboardingCrewOptions("empty", "ea-fc");

    expect(result.status).toBe(200);

    if (result.body.ok) {
      expect(result.body.data.crews).toEqual([]);
      expect(result.body.data.canSkip).toBe(true);
    }
  });

  it("returns structured maintenance and rate-limit failures", () => {
    const maintenance = getMockOnboardingAvailabilityOptions("maintenance", "Africa/Lagos");
    const rateLimited = getMockOnboardingGameOptions("rate_limited");

    expect(maintenance.status).toBe(503);
    expect(rateLimited.status).toBe(429);

    if (!maintenance.body.ok) {
      expect(maintenance.body.error.code).toBe("maintenance");
    }

    if (!rateLimited.body.ok) {
      expect(rateLimited.body.error.code).toBe("rate_limited");
    }
  });
});
