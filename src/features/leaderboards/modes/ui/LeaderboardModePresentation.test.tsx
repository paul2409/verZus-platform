// VERZUS M8.4 MODE PRESENTATION TESTS

import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { leaderboardFoundationBoards } from "../../foundation/mocks/leaderboard-foundation.mock";
import { getLeaderboardModeComposition } from "../model/leaderboard-mode.registry";
import {
  LeaderboardModeDesktopTable,
  LeaderboardModeMobileList,
} from "./LeaderboardModePresentation";

describe("mode-specific leaderboard presentations", () => {
  it("renders pool-owned desktop columns instead of player columns", () => {
    const board = leaderboardFoundationBoards.pools;
    render(
      <LeaderboardModeDesktopTable
        boardTitle={board.title}
        composition={getLeaderboardModeComposition("pools")}
        currentEntry={board.currentEntry}
        rows={board.rows.slice(0, 2)}
      />,
    );

    const table = screen.getByRole("table");
    expect(within(table).getByRole("columnheader", { name: "Pool" })).toBeVisible();
    expect(within(table).getByRole("columnheader", { name: "Players" })).toBeVisible();
    expect(within(table).queryByRole("columnheader", { name: "Crew" })).not.toBeInTheDocument();
  });

  it("renders a dedicated compact Crew row anatomy", () => {
    const board = leaderboardFoundationBoards.crew;
    render(
      <LeaderboardModeMobileList
        composition={getLeaderboardModeComposition("crew")}
        currentEntry={board.currentEntry}
        rows={board.rows.slice(0, 1)}
        startIndex={1}
      />,
    );

    expect(screen.getByText("Your Crew rank")).toBeVisible();
    expect(screen.getAllByText(/members/).length).toBeGreaterThan(0);
    expect(screen.getByText("98,450")).toBeVisible();
  });
});
