// VERZUS M4 STEP 4.7

import { afterEach, describe, expect, it, vi } from "vitest";

import { getOnboardingProgress, OnboardingApiClientError } from "./onboarding-api.client";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("onboarding API client", () => {
  it("validates and returns a progress response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
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
              requestId: "onboarding-request-1",
            }),
          ),
      ),
    );

    const draft = await getOnboardingProgress();

    expect(draft.currentStep).toBe("welcome");
  });

  it("rejects a malformed service response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              success: true,
            }),
          ),
      ),
    );

    await expect(getOnboardingProgress()).rejects.toBeInstanceOf(OnboardingApiClientError);
  });
});
