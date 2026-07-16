// VERZUS M6.7 COMPETITION TELEMETRY

import { describe, expect, it } from "vitest";

import { competitionTelemetryEventSchema } from "./competition-telemetry.schema";

const validEvent = {
  name: "competition.route_viewed",
  occurredAt: "2026-07-16T20:30:00.000Z",
  route: "/compete",
  environment: "test",
  release: "m6-test",
} as const;

describe("competition telemetry schema", () => {
  it("accepts the allowlisted operational envelope", () => {
    expect(competitionTelemetryEventSchema.parse(validEvent)).toEqual(validEvent);
  });

  it("rejects arbitrary and potentially sensitive fields", () => {
    expect(() =>
      competitionTelemetryEventSchema.parse({
        ...validEvent,
        email: "player@example.com",
      }),
    ).toThrow();
  });
});
