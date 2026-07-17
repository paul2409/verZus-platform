// VERZUS M7.8 MATCH OPERATIONS TELEMETRY TESTS

import { describe, expect, it } from "vitest";

import { matchTelemetryEventSchema } from "./match-telemetry.schema";

describe("match telemetry schema", () => {
  it("accepts allowlisted, release-scoped events", () => {
    expect(
      matchTelemetryEventSchema.parse({
        name: "match.state_viewed",
        occurredAt: "2026-07-17T00:00:00.000Z",
        route: "/matches/m7-preview",
        matchId: "m7-preview",
        state: "check-in-open",
        environment: "preview",
        release: "abc123",
      }),
    ).toMatchObject({ name: "match.state_viewed", matchId: "m7-preview" });
  });

  it("rejects unknown event names and unexpected fields", () => {
    expect(() =>
      matchTelemetryEventSchema.parse({
        name: "match.secret_dump",
        occurredAt: "2026-07-17T00:00:00.000Z",
        route: "/matches/m7-preview",
        environment: "preview",
        release: "abc123",
        token: "not-allowed",
      }),
    ).toThrow();
  });
});
