// VERZUS M8.8 LEADERBOARD COLOR POLICY

import type { LeaderboardFoundationRow } from "../../foundation/model/leaderboard-foundation.types";

export const leaderboardRankZones = [
  "champion",
  "podium",
  "promotion",
  "contender",
  "current",
  "standard",
] as const;

export type LeaderboardRankZone = (typeof leaderboardRankZones)[number];

export type LeaderboardRowVisualState = {
  rankZone: LeaderboardRankZone;
  rankZoneLabel: string;
  accessibleLabel: string;
};

export function getLeaderboardRowVisualState(
  row: LeaderboardFoundationRow,
): LeaderboardRowVisualState {
  const rankZone: LeaderboardRankZone = row.isCurrentUser
    ? "current"
    : row.rank === 1
      ? "champion"
      : row.rank <= 3
        ? "podium"
        : row.rank <= 10
          ? "promotion"
          : row.rank <= 25
            ? "contender"
            : "standard";

  const rankZoneLabel: Record<LeaderboardRankZone, string> = {
    champion: "Champion",
    podium: "Podium",
    promotion: "Promotion zone",
    contender: "Contender zone",
    current: "Your position",
    standard: "Ranked",
  };

  return {
    rankZone,
    rankZoneLabel: rankZoneLabel[rankZone],
    accessibleLabel: `${rankZoneLabel[rankZone]}, ${row.tier} tier, ${row.game} lane`,
  };
}
