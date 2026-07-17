// VERZUS M8.5 STABLE LIVE UPDATE MERGE

import type { LeaderboardFoundationRow } from "../../foundation/model/leaderboard-foundation.types";
import type { LeaderboardResourceSnapshot } from "../../resources/model/leaderboard-resource.types";
import type { LeaderboardLiveUpdateData } from "./leaderboard-live.types";
import { normalizeLeaderboardMovement } from "./leaderboard-movement";

export function applyStableLeaderboardRows(
  previousRows: readonly LeaderboardFoundationRow[],
  incomingRows: readonly LeaderboardFoundationRow[],
): LeaderboardFoundationRow[] {
  const previousById = new Map(previousRows.map((row) => [row.id, row]));
  const previousOrder = new Map(previousRows.map((row, index) => [row.id, index]));

  return incomingRows
    .map((row) => {
      const previous = previousById.get(row.id);
      return normalizeLeaderboardMovement(row, previous?.rank ?? row.previousRank);
    })
    .sort((left, right) => {
      const rankDifference = left.rank - right.rank;
      if (rankDifference !== 0) return rankDifference;

      const leftOrder = previousOrder.get(left.id) ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = previousOrder.get(right.id) ?? Number.MAX_SAFE_INTEGER;
      const previousDifference = leftOrder - rightOrder;
      if (previousDifference !== 0) return previousDifference;

      return left.id.localeCompare(right.id, "en");
    });
}

export function mergeLeaderboardLiveSnapshot(
  snapshot: LeaderboardResourceSnapshot,
  update: LeaderboardLiveUpdateData | undefined,
): LeaderboardResourceSnapshot {
  if (!update) return snapshot;

  const previousRows = snapshot.entries?.items ?? [];
  const items = applyStableLeaderboardRows(previousRows, update.items);

  return {
    ...snapshot,
    ...(snapshot.entries
      ? {
          entries: {
            ...snapshot.entries,
            items,
            meta: update.meta,
          },
        }
      : {}),
    ...(snapshot.currentPosition
      ? {
          currentPosition: {
            entry: update.currentPosition.entry,
            meta: update.meta,
          },
        }
      : {}),
    ...(snapshot.status
      ? {
          status: {
            ...snapshot.status,
            lastUpdatedAt: update.meta.lastUpdatedAt,
            nextRefreshAt: update.nextPollAt,
            freshness: update.meta.freshness,
            meta: update.meta,
          },
        }
      : {}),
  };
}
