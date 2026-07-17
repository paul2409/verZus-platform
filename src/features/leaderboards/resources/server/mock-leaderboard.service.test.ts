// VERZUS M8.3 MOCK LEADERBOARD SERVICE TESTS

import { describe, expect, it } from "vitest";

import { adaptLeaderboardEntriesPayload } from "../api/leaderboard-api.adapter";
import { getMockLeaderboardResource } from "./mock-leaderboard.service";

describe("mock leaderboard resource service", () => {
  const now = new Date("2026-07-17T10:00:00.000Z");

  it("applies the M8.2 query contract before returning paginated entries", () => {
    const result = getMockLeaderboardResource(
      "weekly",
      "entries",
      new URLSearchParams("game=ea-fc&sort=points&direction=desc&size=3"),
      "normal",
      now,
    );
    const data = adaptLeaderboardEntriesPayload(result.body);

    expect(result.status).toBe(200);
    expect(data.items).toHaveLength(2);
    expect(data.items.every((row) => row.game === "ea-fc")).toBe(true);
    expect(data.items[0]!.points).toBeGreaterThanOrEqual(data.items[1]!.points);
    expect(data.page).toBe(1);
  });

  it("keeps resources independent and exposes stale metadata intentionally", () => {
    const summary = getMockLeaderboardResource(
      "crew",
      "summary",
      new URLSearchParams(),
      "normal",
      now,
    );
    const status = getMockLeaderboardResource(
      "crew",
      "status",
      new URLSearchParams(),
      "stale",
      now,
    );
    const failedRewards = getMockLeaderboardResource(
      "crew",
      "rewards",
      new URLSearchParams(),
      "error",
      now,
    );

    expect(summary.status).toBe(200);
    expect(status.body).toEqual(
      expect.objectContaining({
        ok: true,
        data: expect.objectContaining({ freshness: "stale" }),
      }),
    );
    expect(failedRewards.status).toBe(503);
  });
});
