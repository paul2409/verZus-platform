// VERZUS M8.8 LEADERBOARD COLOR POLICY TESTS

import { describe, expect, it } from "vitest";

import { leaderboardFoundationBoards } from "../../foundation/mocks/leaderboard-foundation.mock";
import { getLeaderboardRowVisualState } from "./leaderboard-color-policy";

describe("leaderboard color policy", () => {
  it("derives semantic rank zones without relying on color alone", () => {
    const champion = getLeaderboardRowVisualState(leaderboardFoundationBoards.weekly.rows[0]!);
    const current = getLeaderboardRowVisualState(leaderboardFoundationBoards.weekly.currentEntry);

    expect(champion).toEqual(expect.objectContaining({ rankZone: "champion" }));
    expect(champion.accessibleLabel).toMatch(/Champion/);
    expect(current).toEqual(expect.objectContaining({ rankZone: "current" }));
  });
});
