// VERZUS M4 PRODUCTION ONBOARDING ROUTES

import { describe, expect, it } from "vitest";

import { createInitialOnboardingDraft, saveOnboardingProgress } from "@/features/onboarding";

import { resolveOnboardingRouteRedirect } from "./onboarding-route-access";

describe("resolveOnboardingRouteRedirect", () => {
  it("keeps the player on the current onboarding step", () => {
    const draft = createInitialOnboardingDraft();

    expect(resolveOnboardingRouteRedirect(draft, "welcome")).toBeNull();
  });

  it("blocks a future step and returns the resumable route", () => {
    const draft = createInitialOnboardingDraft();

    expect(resolveOnboardingRouteRedirect(draft, "identity")).toBe("/onboarding");
  });

  it("allows a previously completed step to be revisited", () => {
    const initial = createInitialOnboardingDraft();
    const saved = saveOnboardingProgress(initial, {
      step: "welcome",
      payload: { acknowledged: true },
    });

    expect(saved.ok).toBe(true);

    if (!saved.ok) {
      return;
    }

    expect(resolveOnboardingRouteRedirect(saved.draft, "welcome")).toBeNull();
  });

  it("blocks completion until the draft is ready", () => {
    const draft = createInitialOnboardingDraft();

    expect(resolveOnboardingRouteRedirect(draft, "complete")).toBe("/onboarding");
  });

  it("sends completed players to Play", () => {
    const draft = {
      ...createInitialOnboardingDraft(),
      status: "completed" as const,
      currentStep: "complete" as const,
      completedAt: "2026-07-14T00:00:00.000Z",
    };

    expect(resolveOnboardingRouteRedirect(draft, "complete")).toBe("/play");
  });
});
