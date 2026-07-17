// VERZUS M8.10 LEADERBOARD RELEASE INTEGRATION TESTS

import { describe, expect, it } from "vitest";

import { getLeaderboardReleaseConfig } from "@/features/leaderboards/release";
import { leaderboardTelemetrySchema } from "@/features/leaderboards/telemetry";

import { parseLeaderboardIntelSelection } from "@/features/leaderboards/interactions";

describe("M8 leaderboard release contract", () => {
  it("keeps deep-linked entity IDs validated through the release boundary", () => {
    expect(
      parseLeaderboardIntelSelection({ intel: "match", entityId: "match-player-prismo" }),
    ).toEqual({ kind: "match", entityId: "match-player-prismo" });
  });

  it("keeps feature flags and telemetry independent", () => {
    const config = getLeaderboardReleaseConfig({
      NEXT_PUBLIC_ENABLE_M8_LEADERBOARDS: "true",
      NEXT_PUBLIC_ENABLE_M8_ENTITY_INTEL: "false",
    });
    expect(config.leaderboardsEnabled).toBe(true);
    expect(config.entityIntelEnabled).toBe(false);

    expect(
      leaderboardTelemetrySchema.safeParse({
        eventName: "intel_load_failed",
        entityKind: "player",
        entityId: "player-prismo",
        route: "/leaderboards/weekly",
        scenario: "error",
        requestId: "req-1",
        occurredAt: "2026-07-17T12:00:00.000Z",
        releaseSha: "sha-1",
      }).success,
    ).toBe(true);
  });
});
