import { describe, expect, it } from "vitest";

import { resolveCompetitionLifecycle } from "./competition-lifecycle.policy";
import type { CompetitionLifecyclePolicyInput } from "./competition-lifecycle.types";

const base: CompetitionLifecyclePolicyInput = {
  competitionId: "ea-fc-rookie-cup",
  exists: true,
  lifecycle: "registration_open",
  eligibility: "eligible",
  authorization: "authorized",
  system: "available",
  registeredCount: 128,
  capacity: 256,
  waitlistEnabled: true,
  partialFailure: false,
};

describe("resolveCompetitionLifecycle", () => {
  it("allows entry only for an eligible open competition with capacity", () => {
    expect(resolveCompetitionLifecycle(base)).toMatchObject({
      disposition: "entry_open",
      entryAllowed: true,
    });
  });

  it.each([
    ["registration_closed", { lifecycle: "registration_closed" }],
    ["not_eligible", { eligibility: "not_eligible" }],
    ["full_capacity", { registeredCount: 256, waitlistEnabled: false }],
    ["cancelled", { lifecycle: "cancelled" }],
  ] as const)("rejects entry for %s", (disposition, patch) => {
    expect(resolveCompetitionLifecycle({ ...base, ...patch })).toMatchObject({
      disposition,
      entryAllowed: false,
    });
  });

  it("offers a waitlist without allowing direct entry", () => {
    expect(
      resolveCompetitionLifecycle({
        ...base,
        registeredCount: 256,
        waitlistEnabled: true,
      }),
    ).toMatchObject({
      disposition: "waitlist_available",
      entryAllowed: false,
      waitlistAllowed: true,
    });
  });

  it("keeps partial failure non-blocking", () => {
    expect(resolveCompetitionLifecycle({ ...base, partialFailure: true })).toMatchObject({
      disposition: "partial_failure",
      blocking: false,
      retryable: true,
    });
  });
});
