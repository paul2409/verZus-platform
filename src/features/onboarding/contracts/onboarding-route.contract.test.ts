// VERZUS M4 STEP 4.8

import { describe, expect, it } from "vitest";

import { createInitialOnboardingDraft } from "../model";
import {
  getOnboardingRoute,
  getOnboardingStepFromPath,
  isKnownOnboardingRoute,
  resolveOnboardingResumeRoute,
} from "./onboarding-route.contract";

describe("onboarding route contract", () => {
  it("maps every step to its canonical route", () => {
    expect(getOnboardingRoute("welcome")).toBe("/onboarding");
    expect(getOnboardingRoute("crew")).toBe("/onboarding/crew");
    expect(getOnboardingRoute("complete")).toBe("/onboarding/complete");
  });

  it("resolves a route back to its step", () => {
    expect(getOnboardingStepFromPath("/onboarding/availability")).toBe("availability");
    expect(getOnboardingStepFromPath("/onboarding/not-a-step")).toBeNull();
  });

  it("resumes at the current validated step", () => {
    const draft = {
      ...createInitialOnboardingDraft(),
      currentStep: "identity" as const,
      status: "in_progress" as const,
    };

    expect(resolveOnboardingResumeRoute(draft)).toBe("/onboarding/identity");
  });

  it("sends completed onboarding to the platform", () => {
    const timestamp = new Date().toISOString();
    const draft = {
      ...createInitialOnboardingDraft(),
      currentStep: "complete" as const,
      status: "completed" as const,
      completedAt: timestamp,
      updatedAt: timestamp,
    };

    expect(resolveOnboardingResumeRoute(draft)).toBe("/play");
  });

  it("recognizes only canonical onboarding routes", () => {
    expect(isKnownOnboardingRoute("/onboarding/games")).toBe(true);
    expect(isKnownOnboardingRoute("/onboarding/games/extra")).toBe(false);
  });
});
