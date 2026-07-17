// VERZUS M8.2 DETERMINISTIC FILTERING, SORTING AND PAGINATION

import type { LeaderboardFoundationRow } from "../../foundation/model/leaderboard-foundation.types";
import type { LeaderboardQueryState, LeaderboardSortDirection } from "./leaderboard-query-state";

export type LeaderboardPage = {
  rows: LeaderboardFoundationRow[];
  filteredCount: number;
  totalPages: number;
  page: number;
  startIndex: number;
  endIndex: number;
};

function searchText(row: LeaderboardFoundationRow): string {
  return [row.name, row.handle, row.crewName, row.countryCode, row.game, row.entityType]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("en");
}

function numericValue(row: LeaderboardFoundationRow, key: LeaderboardQueryState["sort"]): number {
  switch (key) {
    case "rank":
      return row.rank;
    case "points":
      return row.points;
    case "wins":
      return row.wins;
    case "win-rate":
      return row.winRate;
  }
}

function compareNumbers(left: number, right: number, direction: LeaderboardSortDirection): number {
  return direction === "asc" ? left - right : right - left;
}

export function compareLeaderboardRows(
  left: LeaderboardFoundationRow,
  right: LeaderboardFoundationRow,
  state: Pick<LeaderboardQueryState, "sort" | "direction">,
): number {
  const primary = compareNumbers(
    numericValue(left, state.sort),
    numericValue(right, state.sort),
    state.direction,
  );

  if (primary !== 0) return primary;

  const rankTieBreak = left.rank - right.rank;
  if (rankTieBreak !== 0) return rankTieBreak;

  return left.id.localeCompare(right.id, "en");
}

export function filterLeaderboardRows(
  rows: readonly LeaderboardFoundationRow[],
  state: Pick<LeaderboardQueryState, "game" | "scope" | "search">,
): LeaderboardFoundationRow[] {
  const query = state.search.trim().toLocaleLowerCase("en");

  return rows.filter((row) => {
    const gameMatches = state.game === "all" || row.game === state.game;
    const scopeMatches = state.scope === "global" || row.scope === "friends";
    const searchMatches = query.length === 0 || searchText(row).includes(query);
    return gameMatches && scopeMatches && searchMatches;
  });
}

export function buildLeaderboardPage(
  rows: readonly LeaderboardFoundationRow[],
  state: LeaderboardQueryState,
): LeaderboardPage {
  const filteredRows = filterLeaderboardRows(rows, state).sort((left, right) =>
    compareLeaderboardRows(left, right, state),
  );
  const filteredCount = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(filteredCount / state.pageSize));
  const page = Math.min(Math.max(1, state.page), totalPages);
  const startIndex = filteredCount === 0 ? 0 : (page - 1) * state.pageSize;
  const rowsOnPage = filteredRows.slice(startIndex, startIndex + state.pageSize);

  return {
    rows: rowsOnPage,
    filteredCount,
    totalPages,
    page,
    startIndex: filteredCount === 0 ? 0 : startIndex + 1,
    endIndex: filteredCount === 0 ? 0 : startIndex + rowsOnPage.length,
  };
}
