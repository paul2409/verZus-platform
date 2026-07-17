// VERZUS M8.5 RANK MOVEMENT POLICY

import type {
  LeaderboardFoundationRow,
  LeaderboardMovement,
} from "../../foundation/model/leaderboard-foundation.types";
import type { LeaderboardCurrentPositionInsight } from "./leaderboard-live.types";

export type DerivedLeaderboardMovement = {
  movement: LeaderboardMovement;
  movementDelta: number | null;
};

export function deriveLeaderboardMovement(
  rank: number,
  previousRank: number | null,
): DerivedLeaderboardMovement {
  if (previousRank === null) return { movement: "new", movementDelta: null };
  if (previousRank === rank) return { movement: "same", movementDelta: null };
  if (previousRank > rank) {
    return { movement: "up", movementDelta: previousRank - rank };
  }
  return { movement: "down", movementDelta: rank - previousRank };
}

export function normalizeLeaderboardMovement(
  row: LeaderboardFoundationRow,
  previousRank: number | null = row.previousRank,
): LeaderboardFoundationRow {
  return {
    ...row,
    previousRank,
    ...deriveLeaderboardMovement(row.rank, previousRank),
  };
}

export function buildCurrentPositionInsight(
  entry: LeaderboardFoundationRow | null,
): LeaderboardCurrentPositionInsight {
  if (!entry) {
    return {
      entry: null,
      previousRank: null,
      movement: "new",
      movementDelta: null,
      nextRank: null,
      pointsToNextRank: null,
    };
  }

  const normalized = normalizeLeaderboardMovement(entry);
  const nextRank = normalized.rank > 1 ? normalized.rank - 1 : null;
  const pointsToNextRank =
    nextRank === null ? 0 : Math.max(50, Math.round(normalized.points * 0.035));

  return {
    entry: normalized,
    previousRank: normalized.previousRank,
    movement: normalized.movement,
    movementDelta: normalized.movementDelta,
    nextRank,
    pointsToNextRank,
  };
}
