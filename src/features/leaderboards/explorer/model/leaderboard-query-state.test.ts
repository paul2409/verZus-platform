// VERZUS M8.2 LEADERBOARD QUERY-STRING STATE TESTS

import { describe, expect, it } from "vitest";

import {
  defaultLeaderboardQueryState,
  hasActiveLeaderboardFilters,
  parseLeaderboardQueryState,
  patchLeaderboardQueryState,
  serializeLeaderboardQueryState,
} from "./leaderboard-query-state";

describe("leaderboard query state", () => {
  it("parses valid URL state and normalizes search", () => {
    const state = parseLeaderboardQueryState(
      new URLSearchParams(
        "mode=crew&game=ea-fc&scope=friends&sort=points&direction=desc&q=%20Xenon%20%20crew%20&page=2&size=3",
      ),
    );

    expect(state).toEqual({
      mode: "crew",
      game: "ea-fc",
      scope: "friends",
      sort: "points",
      direction: "desc",
      search: "Xenon crew",
      page: 2,
      pageSize: 3,
    });
  });

  it("rejects unsupported values and unsafe page numbers", () => {
    expect(
      parseLeaderboardQueryState(
        new URLSearchParams(
          "mode=unknown&game=chess&scope=local&sort=random&direction=sideways&page=-4&size=999",
        ),
      ),
    ).toEqual(defaultLeaderboardQueryState);
  });

  it("serializes only non-default values", () => {
    expect(serializeLeaderboardQueryState(defaultLeaderboardQueryState).toString()).toBe("");

    const serialized = serializeLeaderboardQueryState({
      ...defaultLeaderboardQueryState,
      mode: "game",
      search: "Prismo",
      page: 3,
    });

    expect(serialized.toString()).toBe("mode=game&q=Prismo&page=3");
  });

  it("patches state through the same validation boundary", () => {
    const next = patchLeaderboardQueryState(defaultLeaderboardQueryState, {
      search: "  Rival   King  ",
      page: 2,
      pageSize: 3,
    });

    expect(next.search).toBe("Rival King");
    expect(next.page).toBe(2);
    expect(next.pageSize).toBe(3);
    expect(hasActiveLeaderboardFilters(next)).toBe(true);
  });
});
