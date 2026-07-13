// VERZUS M4 STEP 4.10

import { describe, expect, it } from "vitest";

import { createAppFailure } from "../../../shared/failures";
import {
  resolveOnboardingFailureDisplay,
  resolveOnboardingResourceState,
} from "./onboarding-failure.policy";

describe("onboarding failure policy", () => {
  it("recognizes partial option data without treating it as total failure", () => {
    expect(
      resolveOnboardingResourceState({
        loading: false,
        retrying: false,
        stale: false,
        itemCount: 2,
        meta: {
          status: "partial",
          warnings: [
            {
              source: "crew",
              message: "Some Crew suggestions are unavailable.",
              retryable: true,
            },
          ],
          generatedAt: "2026-07-13T12:00:00.000Z",
        },
        failure: null,
      }),
    ).toBe("partial_failure");
  });

  it("keeps empty and stale states distinct", () => {
    expect(
      resolveOnboardingResourceState({
        loading: false,
        retrying: false,
        stale: false,
        itemCount: 0,
        meta: null,
        failure: null,
      }),
    ).toBe("empty");

    expect(
      resolveOnboardingResourceState({
        loading: false,
        retrying: false,
        stale: true,
        itemCount: 3,
        meta: null,
        failure: null,
      }),
    ).toBe("stale");
  });

  it("preserves onboarding progress during offline and maintenance failures", () => {
    for (const code of ["offline", "maintenance"] as const) {
      const display = resolveOnboardingFailureDisplay(
        createAppFailure({
          code,
          source: "onboarding",
          message: `${code} failure`,
          retryable: true,
        }),
      );

      expect(display.preserveDraft).toBe(true);
      expect(display.retryable).toBe(true);
    }
  });

  it("does not remove the surviving action path during partial failure", () => {
    const display = resolveOnboardingFailureDisplay(
      createAppFailure({
        code: "partial_failure",
        source: "onboarding",
        message: "Crew discovery partially failed.",
        retryable: true,
      }),
    );

    expect(display.state).toBe("partial_failure");
    expect(display.survivingActions).toContain("Use available options");
  });

  it("maps suspended and banned access to forbidden onboarding state", () => {
    for (const code of ["suspended", "banned"] as const) {
      const display = resolveOnboardingFailureDisplay(
        createAppFailure({
          code,
          source: "auth",
          message: `${code} account`,
          httpStatus: 403,
        }),
      );

      expect(display.state).toBe("forbidden");
      expect(display.retryable).toBe(false);
    }
  });
});
