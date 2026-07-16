import { describe, expect, it } from "vitest";

import { getMockCompetitionLifecycleResponse } from "./mock-competition-lifecycle.service";

const rejectedScenarios = [
  "registration_closed",
  "waitlist",
  "not_eligible",
  "full_capacity",
  "cancelled",
] as const;

describe("competition entry lifecycle guard contract", () => {
  it.each(rejectedScenarios)("marks %s as server-authoritatively blocked", (scenario) => {
    const response = getMockCompetitionLifecycleResponse("ea-fc-rookie-cup", scenario);

    expect(response.body.ok).toBe(true);
    if (response.body.ok) {
      expect(response.body.data.entry_allowed).toBe(false);
    }
  });

  it("keeps partial failure independent from entry eligibility", () => {
    const response = getMockCompetitionLifecycleResponse("ea-fc-rookie-cup", "partial_failure");

    expect(response.body.ok).toBe(true);
    if (response.body.ok) {
      expect(response.body.data.entry_allowed).toBe(true);
      expect(response.body.data.blocking).toBe(false);
    }
  });
});
