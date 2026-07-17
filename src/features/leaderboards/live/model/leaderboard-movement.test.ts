// VERZUS M8.5 RANK MOVEMENT POLICY TESTS

import { describe, expect, it } from "vitest";

import { leaderboardFoundationBoards } from "../../foundation/mocks/leaderboard-foundation.mock";
import {
  buildCurrentPositionInsight,
  deriveLeaderboardMovement,
  normalizeLeaderboardMovement,
} from "./leaderboard-movement";

describe("leaderboard movement policy", () => {
  it("derives up, down, same and new movement from rank history", () => {
    expect(deriveLeaderboardMovement(4, 8)).toEqual({ movement: "up", movementDelta: 4 });
    expect(deriveLeaderboardMovement(8, 4)).toEqual({ movement: "down", movementDelta: 4 });
    expect(deriveLeaderboardMovement(4, 4)).toEqual({ movement: "same", movementDelta: null });
    expect(deriveLeaderboardMovement(4, null)).toEqual({ movement: "new", movementDelta: null });
  });

  it("overrides inconsistent incoming movement labels", () => {
    const row = leaderboardFoundationBoards.weekly.rows[0]!;
    expect(
      normalizeLeaderboardMovement({ ...row, rank: 2, movement: "down", movementDelta: 99 }, 5),
    ).toEqual(expect.objectContaining({ movement: "up", movementDelta: 3, previousRank: 5 }));
  });

  it("builds pinned-position context without making the client authoritative", () => {
    const insight = buildCurrentPositionInsight(leaderboardFoundationBoards.weekly.currentEntry);
    expect(insight.previousRank).toBe(27);
    expect(insight.movement).toBe("up");
    expect(insight.nextRank).toBe(22);
    expect(insight.pointsToNextRank).toBeGreaterThan(0);
  });
});
