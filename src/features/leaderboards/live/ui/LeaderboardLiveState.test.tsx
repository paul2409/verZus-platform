// VERZUS M8.5 LIVE UPDATE PRESENTATION TESTS

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { leaderboardFoundationBoards } from "../../foundation/mocks/leaderboard-foundation.mock";
import { LeaderboardFoundationScreen } from "../../foundation/ui/LeaderboardFoundationScreen";
import { buildCurrentPositionInsight } from "../model/leaderboard-movement";

describe("M8.5 live leaderboard presentation", () => {
  it("shows revision, previous position and next-rank target", () => {
    const board = leaderboardFoundationBoards.weekly;
    render(
      <LeaderboardFoundationScreen
        liveUpdate={{
          scenario: "advance",
          revision: 13,
          hasChanges: true,
          changedEntryIds: [board.rows[0]!.id, board.currentEntry.id],
          currentPosition: buildCurrentPositionInsight(board.currentEntry),
          nextPollAt: "2026-07-17T10:00:30.000Z",
          isFetching: false,
        }}
      />,
    );

    expect(screen.getByText(/Revision 13 · stable update applied/i)).toBeVisible();
    expect(screen.getByText("Previous rank")).toBeVisible();
    expect(screen.getByText("Next target")).toBeVisible();
    expect(document.querySelector('[data-live-changed="true"]')).not.toBeNull();
    expect(document.querySelector('[data-m8-stage="8.5"]')).not.toBeNull();
  });
});
