import { describe, expect, it } from "vitest";

import { getMockCompetitionDiscoveryResource } from "./mock-competition-discovery.service";

describe("mock competition discovery service", () => {
  it("filters and paginates list requests deterministically", () => {
    const result = getMockCompetitionDiscoveryResource(
      "list",
      "normal",
      new URLSearchParams("game=league-of-legends&page=1"),
    );
    const body = result.body as { ok: true; data: { items: Array<{ game_filter_value: string }> } };

    expect(result.status).toBe(200);
    expect(body.data.items.every((item) => item.game_filter_value === "league-of-legends")).toBe(
      true,
    );
  });

  it("isolates a partial entry-service failure", () => {
    const entry = getMockCompetitionDiscoveryResource("current-entry", "partial_failure");
    const list = getMockCompetitionDiscoveryResource("list", "partial_failure");

    expect(entry.status).toBe(503);
    expect((entry.body as { ok: false }).ok).toBe(false);
    expect((list.body as { ok: true }).ok).toBe(true);
  });

  it("marks stale data without blanking the response", () => {
    const result = getMockCompetitionDiscoveryResource("featured", "stale");
    const body = result.body as { ok: true; meta: { freshness: string }; data: unknown };

    expect(body.meta.freshness).toBe("stale");
    expect(body.data).not.toBeNull();
  });
});
