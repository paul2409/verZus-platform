// VERZUS M4 STEP 4.9

import { describe, expect, it } from "vitest";

import {
  adaptOnboardingProgressPayload,
  OnboardingApiClientError,
} from "./onboarding-progress.adapter";

describe("onboarding progress adapter", () => {
  it("validates and adapts a successful progress response", () => {
    const draft = adaptOnboardingProgressPayload({
      ok: true,
      data: {
        version: 1,
        status: "not_started",
        currentStep: "welcome",
        completedSteps: [],
        selectedGameIds: [],
        location: null,
        playerIdentity: null,
        availability: [],
        crewChoice: null,
        startedAt: "2026-07-13T12:00:00.000Z",
        updatedAt: "2026-07-13T12:00:00.000Z",
        completedAt: null,
      },
      requestId: "progress-request-1",
    });

    expect(draft.currentStep).toBe("welcome");
  });

  it("preserves structured server errors", () => {
    expect(() =>
      adaptOnboardingProgressPayload({
        ok: false,
        error: {
          code: "step_out_of_order",
          message: "Complete the current step first.",
          requestId: "progress-request-2",
          retryable: false,
          fieldErrors: {
            step: ["Continue from games."],
          },
        },
      }),
    ).toThrow(OnboardingApiClientError);
  });

  it("rejects malformed progress responses", () => {
    expect(() =>
      adaptOnboardingProgressPayload({
        success: true,
      }),
    ).toThrow(OnboardingApiClientError);
  });
});
