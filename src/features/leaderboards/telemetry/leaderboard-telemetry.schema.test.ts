// VERZUS M8.10 LEADERBOARD TELEMETRY SCHEMA TESTS

import { describe, expect, it } from "vitest";

import { leaderboardTelemetrySchema } from "./leaderboard-telemetry.schema";

describe("leaderboard telemetry schema", () => {
  it("accepts allowlisted entity-intel events", () => {
    expect(
      leaderboardTelemetrySchema.parse({
        eventName: "intel_opened",
        entityKind: "player",
        entityId: "player-prismo",
        route: "/leaderboards/weekly",
        scenario: "normal",
        requestId: null,
        occurredAt: "2026-07-17T12:00:00.000Z",
        releaseSha: "sha-1",
      }),
    ).toEqual(expect.objectContaining({ eventName: "intel_opened" }));
  });

  it("rejects unknown events and routes outside leaderboards", () => {
    expect(() =>
      leaderboardTelemetrySchema.parse({
        eventName: "arbitrary_event",
        entityKind: "player",
        entityId: "player-prismo",
        route: "/admin",
        occurredAt: "2026-07-17T12:00:00.000Z",
        releaseSha: "sha-1",
      }),
    ).toThrow();
  });
});
