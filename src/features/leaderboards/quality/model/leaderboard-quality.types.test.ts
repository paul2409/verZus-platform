// VERZUS M8.7 QUALITY TYPE TESTS

import { describe, expect, it } from "vitest";

import { parseLeaderboardCrashTarget } from "./leaderboard-quality.types";

describe("leaderboard crash target parsing", () => {
  it("accepts allowlisted widget targets only", () => {
    expect(parseLeaderboardCrashTarget("ranking")).toBe("ranking");
    expect(parseLeaderboardCrashTarget(["rewards", "ranking"])).toBe("rewards");
    expect(parseLeaderboardCrashTarget("navigation")).toBeNull();
    expect(parseLeaderboardCrashTarget(undefined)).toBeNull();
  });
});
