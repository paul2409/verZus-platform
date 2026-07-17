// VERZUS M8.4 MODE READ MODEL TESTS

import { describe, expect, it } from "vitest";

import { leaderboardModes } from "../../foundation/model/leaderboard-foundation.types";
import { getLeaderboardModeReadModel } from "./leaderboard-mode-read-model";

describe("leaderboard mode read models", () => {
  it.each(leaderboardModes)("composes the %s board with its owned entry type", (mode) => {
    const readModel = getLeaderboardModeReadModel(mode);

    expect(readModel.mode).toBe(mode);
    expect(readModel.board.mode).toBe(mode);
    expect(readModel.board.rows.length).toBeGreaterThan(0);
    expect(
      readModel.board.rows.every((row) => row.entityType === readModel.composition.entityType),
    ).toBe(true);
    expect(readModel.board.currentEntry.entityType).toBe(readModel.composition.entityType);
  });

  it("keeps mode read models independent", () => {
    expect(getLeaderboardModeReadModel("weekly").board).not.toBe(
      getLeaderboardModeReadModel("crew").board,
    );
    expect(getLeaderboardModeReadModel("pools").composition.currentPositionLabel).toMatch(/pool/i);
  });
});
