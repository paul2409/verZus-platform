// VERZUS M4 STEP 4.7

import { describe, expect, it } from "vitest";
import type { OnboardingDraft } from "./onboarding.schema";

import {
  completeOnboarding,
  createInitialOnboardingDraft,
  getFirstIncompleteStep,
  getOnboardingProgressPercent,
  saveOnboardingProgress,
} from "./onboarding.state-machine";

describe("onboarding state machine", () => {
  it("starts at welcome with zero progress", () => {
    const draft = createInitialOnboardingDraft(new Date("2026-07-13T12:00:00.000Z"));

    expect(draft.currentStep).toBe("welcome");
    expect(draft.status).toBe("not_started");
    expect(getOnboardingProgressPercent(draft)).toBe(0);
  });

  it("advances one validated step at a time", () => {
    const initial = createInitialOnboardingDraft();
    const result = saveOnboardingProgress(initial, {
      step: "welcome",
      payload: {
        acknowledged: true,
      },
    });

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.draft.currentStep).toBe("games");
      expect(result.draft.completedSteps).toEqual(["welcome"]);
    }
  });

  it("rejects skipped required steps", () => {
    const result = saveOnboardingProgress(createInitialOnboardingDraft(), {
      step: "identity",
      payload: {
        gamerTag: "JayFlex",
        platform: "playstation",
        platformHandle: "JayFlexPSN",
      },
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.code).toBe("step_out_of_order");
      expect(result.fieldErrors.step).toEqual(["Continue from welcome."]);
    }
  });

  it("allows a completed step to be edited while preserving progress", () => {
    const welcome = saveOnboardingProgress(createInitialOnboardingDraft(), {
      step: "welcome",
      payload: {
        acknowledged: true,
      },
    });

    expect(welcome.ok).toBe(true);

    if (!welcome.ok) {
      return;
    }

    const games = saveOnboardingProgress(welcome.draft, {
      step: "games",
      payload: {
        selectedGameIds: ["ea-fc"],
      },
    });

    expect(games.ok).toBe(true);

    if (!games.ok) {
      return;
    }

    const editedGames = saveOnboardingProgress(games.draft, {
      step: "games",
      payload: {
        selectedGameIds: ["ea-fc", "efootball"],
      },
    });

    expect(editedGames.ok).toBe(true);

    if (editedGames.ok) {
      expect(editedGames.draft.currentStep).toBe("location");
      expect(editedGames.draft.selectedGameIds).toEqual(["ea-fc", "efootball"]);
    }
  });

  it("calculates resumable progress from completed steps", () => {
    const draft: OnboardingDraft = {
      ...createInitialOnboardingDraft(),
      completedSteps: ["welcome", "games", "location"],
      currentStep: "identity",
      status: "in_progress",
    };

    expect(getFirstIncompleteStep(draft)).toBe("identity");
    expect(getOnboardingProgressPercent(draft)).toBe(50);
  });

  it("refuses completion while steps are missing", () => {
    const result = completeOnboarding(createInitialOnboardingDraft());

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.code).toBe("onboarding_incomplete");
      expect(result.fieldErrors.steps).toContain("crew");
    }
  });
});
