// VERZUS M8.5 LIVE UPDATE SERVICE TESTS

import { describe, expect, it } from "vitest";

import { adaptLeaderboardLiveUpdatePayload } from "../api/leaderboard-live.adapter";
import { getMockLeaderboardLiveUpdate } from "./leaderboard-live.service";

describe("leaderboard live update service", () => {
  const now = new Date("2026-07-17T10:00:00.000Z");

  it("returns a no-change revision for normal polling", () => {
    const update = adaptLeaderboardLiveUpdatePayload(
      getMockLeaderboardLiveUpdate("weekly", new URLSearchParams(), "normal", now).body,
    );
    expect(update.revision).toBe(12);
    expect(update.hasChanges).toBe(false);
    expect(update.changedEntryIds).toEqual([]);
  });

  it("returns deterministic rank movement for the advance scenario", () => {
    const update = adaptLeaderboardLiveUpdatePayload(
      getMockLeaderboardLiveUpdate("weekly", new URLSearchParams(), "advance", now).body,
    );
    expect(update.revision).toBe(13);
    expect(update.items[0]?.rank).toBe(1);
    expect(update.currentPosition.entry?.rank).toBe(21);
    expect(update.currentPosition.movement).toBe("up");
  });

  it("keeps prior order for equal-rank updates", () => {
    const update = adaptLeaderboardLiveUpdatePayload(
      getMockLeaderboardLiveUpdate("weekly", new URLSearchParams(), "tie", now).body,
    );
    expect(update.items.slice(0, 2).map((row) => row.id)).toEqual([
      "player-prismo",
      "player-rival-king",
    ]);
  });
});
