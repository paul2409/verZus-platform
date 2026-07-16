import { describe, expect, it } from "vitest";

import { competitionDetailMockById } from "../mocks/competition-detail.mock";
import { getMockCompetitionDetailResource } from "../server/mock-competition-detail.service";
import { adaptCompetitionSummary } from "./competition-detail-api.adapter";

describe("competition detail adapter", () => {
  it("validates and adapts the summary resource", () => {
    const response = getMockCompetitionDetailResource(
      "verzus-championship-series",
      "summary",
      "normal",
    );
    const adapted = adaptCompetitionSummary(response.body);
    expect(adapted.value.name).toBe(
      competitionDetailMockById["verzus-championship-series"]?.summary.name,
    );
    expect(adapted.meta.requestId).toContain("mock-competition-detail-summary");
  });
});
