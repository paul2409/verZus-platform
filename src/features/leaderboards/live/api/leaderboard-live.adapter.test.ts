// VERZUS M8.5 LIVE UPDATE ADAPTER TESTS

import { describe, expect, it } from "vitest";

import { getMockLeaderboardLiveUpdate } from "../server/leaderboard-live.service";
import { adaptLeaderboardLiveUpdatePayload } from "./leaderboard-live.adapter";

describe("leaderboard live update adapter", () => {
  it("adapts revisions, changed IDs and current-position insight", () => {
    const result = getMockLeaderboardLiveUpdate(
      "weekly",
      new URLSearchParams("live=advance"),
      "advance",
      new Date("2026-07-17T10:00:00.000Z"),
    );
    const adapted = adaptLeaderboardLiveUpdatePayload(result.body);

    expect(adapted.revision).toBe(13);
    expect(adapted.hasChanges).toBe(true);
    expect(adapted.changedEntryIds.length).toBeGreaterThan(0);
    expect(adapted.currentPosition.movement).toBe("up");
  });

  it("rejects malformed payloads", () => {
    expect(() => adaptLeaderboardLiveUpdatePayload({ ok: true })).toThrowError(
      expect.objectContaining({ code: "invalid_response" }),
    );
  });
});
