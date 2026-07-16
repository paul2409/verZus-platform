import { describe, expect, it } from "vitest";

import { getMockCompetitionDetailResource } from "./mock-competition-detail.service";

describe("mock competition detail service", () => {
  it("isolates bracket failure during partial failure", () => {
    expect(
      getMockCompetitionDetailResource("verzus-championship-series", "summary", "partial_failure")
        .status,
    ).toBe(200);
    expect(
      getMockCompetitionDetailResource("verzus-championship-series", "bracket", "partial_failure")
        .status,
    ).toBe(503);
  });

  it("returns not found for an unknown competition", () => {
    expect(getMockCompetitionDetailResource("missing", "summary", "normal").status).toBe(404);
  });
});
