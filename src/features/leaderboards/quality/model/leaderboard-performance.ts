// VERZUS M8.7 LEADERBOARD RENDER-BUDGET POLICY

export const leaderboardMaximumVisibleRows = 10;

export type LeaderboardRenderPlan<T> = {
  rows: readonly T[];
  requestedRowCount: number;
  renderedRowCount: number;
  omittedRowCount: number;
  withinBudget: boolean;
};

export function createLeaderboardRenderPlan<T>(
  rows: readonly T[],
  requestedLimit: number,
): LeaderboardRenderPlan<T> {
  const normalizedLimit = Math.max(
    1,
    Math.min(Math.floor(requestedLimit), leaderboardMaximumVisibleRows),
  );
  const visibleRows = rows.slice(0, normalizedLimit);

  return {
    rows: visibleRows,
    requestedRowCount: rows.length,
    renderedRowCount: visibleRows.length,
    omittedRowCount: Math.max(0, rows.length - visibleRows.length),
    withinBudget: rows.length <= normalizedLimit,
  };
}
