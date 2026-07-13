// VERZUS M4 STEP 4.11

import { describe, expect, it } from "vitest";

import {
  canImplementFinalOnboardingScreen,
  getOnboardingReferenceGaps,
} from "../../../src/features/onboarding/contracts";

describe("M4 visual approval contract", () => {
  it("keeps final onboarding implementation blocked while reference gaps exist", () => {
    const gaps = getOnboardingReferenceGaps();

    expect(gaps.length).toBeGreaterThan(0);
  });

  it("does not report any onboarding step as implementation-ready yet", () => {
    for (const step of [
      "welcome",
      "games",
      "location",
      "identity",
      "availability",
      "crew",
      "complete",
    ] as const) {
      expect(canImplementFinalOnboardingScreen(step)).toBe(false);
    }
  });
});
