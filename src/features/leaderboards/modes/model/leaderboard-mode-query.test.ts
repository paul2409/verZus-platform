// VERZUS M8.4 MODE COMPOSITION QUERY TESTS

import { describe, expect, it } from "vitest";

import {
  leaderboardCompositionQueryOptions,
  leaderboardQueryKeys,
} from "../../resources/api/leaderboard.query";

describe("leaderboard mode composition query", () => {
  it("uses an independent cache key per mode and scenario", () => {
    expect(leaderboardQueryKeys.composition("weekly", "normal")).toEqual([
      "leaderboards",
      "weekly",
      "composition",
      "normal",
    ]);
    expect(leaderboardCompositionQueryOptions("crew", "stale").queryKey).toEqual([
      "leaderboards",
      "crew",
      "composition",
      "stale",
    ]);
  });

  it("keeps the mode contract cached longer than live entries", () => {
    const options = leaderboardCompositionQueryOptions("combine");
    expect(options.staleTime).toBe(30 * 60_000);
    expect(options.gcTime).toBe(60 * 60_000);
  });
});
