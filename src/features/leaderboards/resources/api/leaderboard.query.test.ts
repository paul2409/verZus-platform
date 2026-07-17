// VERZUS M8.3 LEADERBOARD QUERY POLICY TESTS

import { describe, expect, it } from "vitest";

import { defaultLeaderboardQueryState } from "../../explorer/model/leaderboard-query-state";
import {
  leaderboardCurrentPositionQueryOptions,
  leaderboardEntriesQueryOptions,
  leaderboardQueryKeys,
  leaderboardStatusQueryOptions,
  leaderboardSummaryQueryOptions,
} from "./leaderboard.query";

describe("leaderboard query resources", () => {
  it("uses independent keys for independently failing resources", () => {
    const state = { ...defaultLeaderboardQueryState, mode: "crew" as const, page: 2 };

    expect(leaderboardQueryKeys.summary("crew", "normal")).toEqual([
      "leaderboards",
      "crew",
      "summary",
      "normal",
    ]);
    expect(leaderboardEntriesQueryOptions(state).queryKey).toEqual([
      "leaderboards",
      "crew",
      "entries",
      state,
      "normal",
    ]);
    expect(leaderboardCurrentPositionQueryOptions("crew").queryKey).not.toEqual(
      leaderboardSummaryQueryOptions("crew").queryKey,
    );
  });

  it("preserves previous entry data and refreshes status independently", () => {
    const entries = leaderboardEntriesQueryOptions(defaultLeaderboardQueryState);
    const status = leaderboardStatusQueryOptions("weekly");

    expect(entries.placeholderData).toBeDefined();
    expect(entries.staleTime).toBe(30_000);
    expect(status.refetchInterval).toBe(30_000);
  });
});
