// VERZUS M4 STEP 4.8

import { describe, expect, it } from "vitest";

import { onboardingStepValues } from "../model";
import {
  canImplementFinalOnboardingScreen,
  getOnboardingReferenceGaps,
  onboardingReferenceAudit,
} from "./onboarding-reference.audit";

describe("onboarding reference audit", () => {
  it("audits every onboarding step", () => {
    expect(Object.keys(onboardingReferenceAudit).sort()).toEqual([...onboardingStepValues].sort());
  });

  it("records generated but unapproved mobile concepts", () => {
    expect(onboardingReferenceAudit.welcome.mobile390.status).toBe("generated_unapproved");
    expect(onboardingReferenceAudit.identity.mobile390.status).toBe("generated_unapproved");
  });

  it("records missing mobile references", () => {
    expect(onboardingReferenceAudit.availability.mobile390.status).toBe("missing");
    expect(onboardingReferenceAudit.crew.mobile390.status).toBe("missing");
    expect(onboardingReferenceAudit.complete.mobile390.status).toBe("missing");
  });

  it("blocks final screen implementation until approval", () => {
    for (const step of onboardingStepValues) {
      expect(canImplementFinalOnboardingScreen(step)).toBe(false);
    }
  });

  it("returns actionable unresolved reference gaps", () => {
    const gaps = getOnboardingReferenceGaps();

    expect(gaps.length).toBeGreaterThan(0);
    expect(
      gaps.some(
        (gap) =>
          gap.step === "availability" && gap.viewport === "mobile390" && gap.status === "missing",
      ),
    ).toBe(true);
  });
});
