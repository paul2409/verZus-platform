// VERZUS M7.8 MATCH OPERATIONS RELEASE INTEGRATION

import { describe, expect, it } from "vitest";

import { getMatchOperationsReleaseMetadata } from "../../src/features/matches/operations/release/match-release.config";
import { matchTelemetryEventSchema } from "../../src/features/matches/operations/telemetry/match-telemetry.schema";

describe("M7.8 release integration", () => {
  it("binds stage, release and telemetry to one contract", () => {
    const release = getMatchOperationsReleaseMetadata();
    const event = matchTelemetryEventSchema.parse({
      name: "match.route_viewed",
      occurredAt: new Date().toISOString(),
      route: "/matches/m7-preview",
      matchId: "m7-preview",
      environment: release.environment,
      release: release.release,
    });

    expect(release.stage).toBe("7.8");
    expect(event.environment).toBe(release.environment);
    expect(event.release).toBe(release.release);
  });
});
