// VERZUS M8.6 LEADERBOARD RELIABILITY POLICY TESTS

import { describe, expect, it } from "vitest";

import { LeaderboardApiClientError } from "../../resources/api/leaderboard-api.adapter";
import {
  createLeaderboardReliabilityView,
  createLeaderboardResourceHealth,
  parseLeaderboardReliabilitySelection,
} from "./leaderboard-reliability";
import type {
  LeaderboardReliabilityResourceName,
  LeaderboardResourceHealth,
} from "./leaderboard-reliability.types";

function ready(resource: LeaderboardReliabilityResourceName): LeaderboardResourceHealth {
  return {
    resource,
    state: "ready",
    hasData: true,
    isFetching: false,
    retryable: false,
    message: null,
    requestId: null,
  };
}

describe("leaderboard reliability policy", () => {
  it("builds deterministic per-resource scenario plans", () => {
    expect(
      parseLeaderboardReliabilitySelection({ reliability: "error", resource: "rewards" }).scenarios,
    ).toEqual(
      expect.objectContaining({
        entries: "normal",
        rewards: "error",
        status: "normal",
      }),
    );

    expect(parseLeaderboardReliabilitySelection({ reliability: "malformed-row" })).toEqual(
      expect.objectContaining({
        intent: "malformed-row",
        target: "entries",
        scenarios: expect.objectContaining({ entries: "malformed-row" }),
      }),
    );
  });

  it("retains cached data after a retryable refresh failure", () => {
    const health = createLeaderboardResourceHealth({
      resource: "entries",
      data: { items: [{ id: "row-1" }], meta: { freshness: "fresh" } },
      error: new LeaderboardApiClientError({
        code: "leaderboard_entries_unavailable",
        message: "Unavailable",
        requestId: "req-entries",
        retryable: true,
      }),
      isPending: false,
      isFetching: false,
    });

    expect(health).toEqual(
      expect.objectContaining({
        state: "stale",
        hasData: true,
        requestId: "req-entries",
      }),
    );
  });

  it("classifies one failed resource as a partial failure", () => {
    const resources = {
      composition: ready("composition"),
      summary: ready("summary"),
      entries: ready("entries"),
      "current-position": ready("current-position"),
      rewards: {
        ...ready("rewards"),
        state: "error" as const,
        hasData: false,
        retryable: true,
      },
      status: ready("status"),
    };

    expect(
      createLeaderboardReliabilityView({
        intent: "error",
        target: "rewards",
        resources,
      }).overall,
    ).toBe("partial-failure");
  });
});
