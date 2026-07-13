// VERZUS M4 STEP 4.7

import { describe, expect, it } from "vitest";

import { mockOnboardingUpdates } from "../../../mocks/onboarding/onboarding.mock";
import {
  completeMockOnboardingProgress,
  getMockOnboardingProgress,
  updateMockOnboardingProgress,
} from "./mock-onboarding.service";

describe("mock onboarding service", () => {
  it("creates a new resumable draft when no cookie exists", () => {
    const result = getMockOnboardingProgress(null);

    expect(result.status).toBe(200);

    if (result.body.ok) {
      expect(result.body.data.currentStep).toBe("welcome");
    }
  });

  it("persists and resumes validated progress", () => {
    const welcome = updateMockOnboardingProgress(null, mockOnboardingUpdates.welcome);

    expect(welcome.cookieValue).not.toBeNull();

    const resumed = getMockOnboardingProgress(welcome.cookieValue);

    if (resumed.body.ok) {
      expect(resumed.body.data.currentStep).toBe("games");
      expect(resumed.body.data.completedSteps).toContain("welcome");
    }
  });

  it("rejects an out-of-order update", () => {
    const result = updateMockOnboardingProgress(null, mockOnboardingUpdates.identity);

    expect(result.status).toBe(409);

    if (!result.body.ok) {
      expect(result.body.error.code).toBe("step_out_of_order");
    }
  });

  it("completes after every required step is saved", () => {
    let cookieValue: string | null = null;

    for (const update of [
      mockOnboardingUpdates.welcome,
      mockOnboardingUpdates.games,
      mockOnboardingUpdates.location,
      mockOnboardingUpdates.identity,
      mockOnboardingUpdates.availability,
      mockOnboardingUpdates.crew,
    ]) {
      const result = updateMockOnboardingProgress(cookieValue, update);

      expect(result.cookieValue).not.toBeNull();
      cookieValue = result.cookieValue;
    }

    const completed = completeMockOnboardingProgress(cookieValue);

    expect(completed.status).toBe(200);
    expect(completed.completed).toBe(true);

    if (completed.body.ok) {
      expect(completed.body.data.status).toBe("completed");
      expect(completed.body.data.completedAt).not.toBeNull();
    }
  });
});
