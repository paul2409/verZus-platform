// VERZUS M8.5 STABLE LIVE UPDATE TESTS

import { describe, expect, it } from "vitest";

import { leaderboardFoundationBoards } from "../../foundation/mocks/leaderboard-foundation.mock";
import { applyStableLeaderboardRows } from "./leaderboard-stable-update";

describe("stable leaderboard update merge", () => {
  const base = leaderboardFoundationBoards.weekly.rows.slice(0, 3);

  it("preserves prior order when incoming rows share the same rank", () => {
    const incoming = [{ ...base[1]!, rank: 1 }, { ...base[0]!, rank: 1 }, base[2]!];

    expect(applyStableLeaderboardRows(base, incoming).map((row) => row.id)).toEqual([
      base[0]!.id,
      base[1]!.id,
      base[2]!.id,
    ]);
  });

  it("derives movement from the previous snapshot during reordering", () => {
    const incoming = [{ ...base[0]!, rank: 2 }, { ...base[1]!, rank: 1 }, base[2]!];
    const merged = applyStableLeaderboardRows(base, incoming);

    expect(merged[0]).toEqual(expect.objectContaining({ id: base[1]!.id, movement: "up" }));
    expect(merged[1]).toEqual(expect.objectContaining({ id: base[0]!.id, movement: "down" }));
  });
});
