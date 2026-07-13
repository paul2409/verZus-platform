// VERZUS M4 STEP 4.8

import { describe, expect, it } from "vitest";

import { onboardingStepValues } from "../model";
import {
  getOnboardingScreenContract,
  onboardingScreenContracts,
} from "./onboarding-screen.contract";

describe("onboarding screen contracts", () => {
  it("defines one contract for every onboarding step", () => {
    expect(Object.keys(onboardingScreenContracts).sort()).toEqual([...onboardingStepValues].sort());
  });

  it("keeps routes unique", () => {
    const routes = Object.values(onboardingScreenContracts).map((contract) => contract.route);

    expect(new Set(routes).size).toBe(routes.length);
  });

  it("defines explicit mobile, tablet, and desktop behavior", () => {
    for (const contract of Object.values(onboardingScreenContracts)) {
      expect(contract.responsive.mobile390.length).toBeGreaterThan(20);
      expect(contract.responsive.tablet768.length).toBeGreaterThan(20);
      expect(contract.responsive.desktop1440.length).toBeGreaterThan(20);
    }
  });

  it("defines isolated failure behavior for every screen", () => {
    for (const contract of Object.values(onboardingScreenContracts)) {
      expect(contract.failureIsolation.length).toBeGreaterThan(0);
      expect(contract.failureIsolation[0]?.survivingActions.length).toBeGreaterThan(0);
    }
  });

  it("returns a screen contract by step", () => {
    expect(getOnboardingScreenContract("availability")).toMatchObject({
      route: "/onboarding/availability",
      nextStep: "crew",
    });
  });
});
