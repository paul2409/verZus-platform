// VERZUS M8.2 DETERMINISTIC RANKING TESTS

import { describe, expect, it } from "vitest";

import { leaderboardFoundationBoards } from "../../foundation/mocks/leaderboard-foundation.mock";
import { defaultLeaderboardQueryState } from "./leaderboard-query-state";
import {
  buildLeaderboardPage,
  compareLeaderboardRows,
  filterLeaderboardRows,
} from "./leaderboard-ranking";

describe("leaderboard ranking explorer", () => {
  const rows = leaderboardFoundationBoards.weekly.rows;

  it("filters across identity and Crew text", () => {
    expect(
      filterLeaderboardRows(rows, {
        game: "all",
        scope: "global",
        search: "xenon",
      }).map((row) => row.name),
    ).toEqual(["Prismo", "Ghosty"]);
  });

  it("sorts deterministically with rank and ID tie-breakers", () => {
    const tied = [
      { ...rows[0]!, id: "b", points: 1000, rank: 2 },
      { ...rows[1]!, id: "a", points: 1000, rank: 2 },
      { ...rows[2]!, id: "c", points: 1000, rank: 1 },
    ];

    expect(
      [...tied]
        .sort((left, right) =>
          compareLeaderboardRows(left, right, { sort: "points", direction: "desc" }),
        )
        .map((row) => row.id),
    ).toEqual(["c", "a", "b"]);
  });

  it("paginates and clamps an out-of-range page", () => {
    const page = buildLeaderboardPage(rows, {
      ...defaultLeaderboardQueryState,
      page: 99,
      pageSize: 3,
    });

    expect(page.page).toBe(2);
    expect(page.totalPages).toBe(2);
    expect(page.rows).toHaveLength(3);
    expect(page.startIndex).toBe(4);
    expect(page.endIndex).toBe(6);
  });
});
