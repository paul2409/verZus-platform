// VERZUS M7.3 MATCH RESOURCE FIXTURE TESTS

import { describe, expect, it } from "vitest";

import { buildMatchResourceFixtures } from "./match-resource.fixture";

describe("match resource fixtures", () => {
  const now = new Date("2026-07-16T20:00:00.000Z");

  it("builds independent resources from one authoritative state snapshot", () => {
    const resources = buildMatchResourceFixtures("m7-preview", "check-in-open", now);

    expect(resources.summary.state).toBe("check-in-open");
    expect(resources.summary.match_version).toBe(resources.clock.matchVersion);
    expect(resources["check-in"].visible).toBe(true);
    expect(resources.lobby.visible).toBe(false);
    expect(resources.support.match_id).toBe("m7-preview");
  });

  it("does not expose a requested preview state for ordinary match IDs", () => {
    const resources = buildMatchResourceFixtures("match-production-1", "disputed", now);

    expect(resources.summary.state).toBe("scheduled");
    expect(resources.dispute.visible).toBe(false);
  });
});
