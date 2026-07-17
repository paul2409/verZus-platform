// VERZUS M8.7 LEADERBOARD RENDER-BUDGET TESTS

import { describe, expect, it } from "vitest";

import {
  createLeaderboardRenderPlan,
  leaderboardMaximumVisibleRows,
} from "./leaderboard-performance";

describe("leaderboard render budget", () => {
  it("never sends an unbounded collection to both responsive presentations", () => {
    const rows = Array.from({ length: 5_000 }, (_, index) => ({ id: `row-${index}` }));
    const plan = createLeaderboardRenderPlan(rows, 500);

    expect(plan.renderedRowCount).toBe(leaderboardMaximumVisibleRows);
    expect(plan.omittedRowCount).toBe(4_990);
    expect(plan.withinBudget).toBe(false);
    expect(plan.rows.at(-1)).toEqual({ id: "row-9" });
  });

  it("preserves a normal paginated result without truncation", () => {
    const rows = [{ id: "one" }, { id: "two" }, { id: "three" }];
    const plan = createLeaderboardRenderPlan(rows, 5);

    expect(plan.rows).toEqual(rows);
    expect(plan.omittedRowCount).toBe(0);
    expect(plan.withinBudget).toBe(true);
  });
});
