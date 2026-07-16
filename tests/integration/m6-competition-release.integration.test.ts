// VERZUS M6.7 COMPETITION INTEGRATION GATE

import { describe, expect, it } from "vitest";

import { resolveCompetitionLifecycle } from "@/features/competitions/lifecycle";
import { getMockCompetitionLifecycleInput } from "@/features/competitions/lifecycle/server/mock-competition-lifecycle.service";

describe("M6 competition lifecycle integration", () => {
  it("allows one eligible open competition to proceed to entry", () => {
    expect(
      resolveCompetitionLifecycle(getMockCompetitionLifecycleInput("competition-1", "normal"))
        .entryAllowed,
    ).toBe(true);
  });

  it.each(["registration_closed", "not_eligible", "full_capacity", "cancelled"] as const)(
    "blocks entry for %s",
    (scenario) => {
      expect(
        resolveCompetitionLifecycle(getMockCompetitionLifecycleInput("competition-1", scenario))
          .entryAllowed,
      ).toBe(false);
    },
  );

  it("keeps partial failure non-blocking while requiring local recovery", () => {
    const decision = resolveCompetitionLifecycle(
      getMockCompetitionLifecycleInput("competition-1", "partial_failure"),
    );
    expect(decision).toMatchObject({
      disposition: "partial_failure",
      blocking: false,
      retryable: true,
    });
  });
});
