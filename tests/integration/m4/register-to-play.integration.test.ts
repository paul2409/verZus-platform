// VERZUS M4 STEP 4.11

import { describe, expect, it } from "vitest";

import { decideAuthRouteAccess } from "../../../src/features/auth/server/auth-route-policy";
import {
  completeOnboarding,
  createInitialOnboardingDraft,
  saveOnboardingProgress,
  type OnboardingDraft,
} from "../../../src/features/onboarding/model";
import { mockOnboardingUpdates } from "../../../src/mocks/onboarding/onboarding.mock";

describe("M4 register-to-Play integration contract", () => {
  it("enforces every server-side identity gate before Play", () => {
    expect(decideAuthRouteAccess("/play", "anonymous")).toMatchObject({
      action: "redirect",
      destination: "/login?next=%2Fplay",
    });

    expect(decideAuthRouteAccess("/play", "email_unverified")).toMatchObject({
      action: "redirect",
      destination: "/verify-email",
    });

    expect(decideAuthRouteAccess("/play", "onboarding_incomplete")).toMatchObject({
      action: "redirect",
      destination: "/onboarding",
    });

    expect(decideAuthRouteAccess("/play", "authenticated")).toMatchObject({
      action: "allow",
    });
  });

  it("completes the resumable onboarding sequence before platform entry", () => {
    let draft: OnboardingDraft = createInitialOnboardingDraft(new Date("2026-07-13T12:00:00.000Z"));

    for (const update of [
      mockOnboardingUpdates.welcome,
      mockOnboardingUpdates.games,
      mockOnboardingUpdates.location,
      mockOnboardingUpdates.identity,
      mockOnboardingUpdates.availability,
      mockOnboardingUpdates.crew,
    ]) {
      const result = saveOnboardingProgress(draft, update);

      expect(result.ok).toBe(true);

      if (!result.ok) {
        throw new Error(result.message);
      }

      draft = result.draft;
    }

    expect(draft.status).toBe("ready_to_complete");

    const completed = completeOnboarding(draft, new Date("2026-07-13T13:00:00.000Z"));

    expect(completed.ok).toBe(true);

    if (!completed.ok) {
      throw new Error(completed.message);
    }

    expect(completed.draft.status).toBe("completed");
    expect(completed.draft.currentStep).toBe("complete");

    expect(decideAuthRouteAccess("/login", "authenticated", "?next=%2Fplay")).toMatchObject({
      action: "redirect",
      destination: "/play",
    });
  });
});
