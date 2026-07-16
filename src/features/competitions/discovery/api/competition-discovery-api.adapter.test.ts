import { describe, expect, it } from "vitest";

import { getMockCompetitionDiscoveryResource } from "../server";
import {
  adaptCompetitionDiscoveryListPayload,
  adaptFeaturedCompetitionPayload,
  CompetitionDiscoveryApiClientError,
} from "./competition-discovery-api.adapter";

describe("competition discovery API adapters", () => {
  it("validates and adapts the featured competition response", () => {
    const response = getMockCompetitionDiscoveryResource("featured", "normal");
    const adapted = adaptFeaturedCompetitionPayload(response.body);

    expect(adapted.competition?.name).toBe("VERZUS CHAMPIONSHIP SERIES");
    expect(adapted.meta.freshness).toBe("fresh");
  });

  it("validates list pagination and snake-case fields", () => {
    const response = getMockCompetitionDiscoveryResource(
      "list",
      "normal",
      new URLSearchParams("game=ea-fc"),
    );
    const adapted = adaptCompetitionDiscoveryListPayload(response.body);

    expect(adapted.items.every((item) => item.gameFilterValue === "ea-fc")).toBe(true);
    expect(adapted.total).toBeGreaterThan(0);
  });

  it("rejects malformed responses before they reach the UI", () => {
    const response = getMockCompetitionDiscoveryResource("list", "malformed");

    expect(() => adaptCompetitionDiscoveryListPayload(response.body)).toThrow(
      CompetitionDiscoveryApiClientError,
    );
  });
});
