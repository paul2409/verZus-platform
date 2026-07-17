// VERZUS M8.4 MODE REGISTRY TESTS

import { describe, expect, it } from "vitest";

import type { LeaderboardQueryState } from "../../explorer/model/leaderboard-query-state";
import {
  getLeaderboardModeComposition,
  getLeaderboardModeSwitchPatch,
  hasActiveLeaderboardModeFilters,
  normalizeLeaderboardQueryForMode,
} from "./leaderboard-mode.registry";

describe("leaderboard mode registry", () => {
  it("defines distinct mode-owned table anatomy", () => {
    expect(
      getLeaderboardModeComposition("weekly").desktopColumns.map((item) => item.label),
    ).toContain("Weekly points");
    expect(getLeaderboardModeComposition("pools").entityType).toBe("pool");
    expect(getLeaderboardModeComposition("crew").entityType).toBe("crew");
    expect(getLeaderboardModeComposition("combine").rankingBasis).toMatch(/cross-game/i);
  });

  it("normalizes unsupported game and scope combinations", () => {
    const state: LeaderboardQueryState = {
      mode: "game",
      game: "all",
      scope: "friends",
      sort: "rank",
      direction: "asc",
      search: "",
      page: 1,
      pageSize: 5,
    };

    expect(normalizeLeaderboardQueryForMode(state)).toEqual(
      expect.objectContaining({ game: "ea-fc", scope: "friends" }),
    );

    expect(normalizeLeaderboardQueryForMode({ ...state, mode: "pools", scope: "friends" })).toEqual(
      expect.objectContaining({ game: "all", scope: "global" }),
    );
  });

  it("returns canonical switch defaults and mode-aware filter state", () => {
    expect(getLeaderboardModeSwitchPatch("crew")).toEqual(
      expect.objectContaining({ mode: "crew", game: "all", scope: "global", page: 1 }),
    );

    const gameDefaults: LeaderboardQueryState = {
      mode: "game",
      game: "ea-fc",
      scope: "global",
      sort: "rank",
      direction: "asc",
      search: "",
      page: 1,
      pageSize: 5,
    };
    expect(hasActiveLeaderboardModeFilters(gameDefaults)).toBe(false);
    expect(hasActiveLeaderboardModeFilters({ ...gameDefaults, game: "league" })).toBe(true);
  });
});
