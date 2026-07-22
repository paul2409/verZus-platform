import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import { PlayerIntelResourceError } from "./player-intel-resource.adapter";
import { getPlayerIntelResource } from "./player-intel-resource.client";

export const playerIntelQueryKeys = {
  all: ["player-intel"] as const,
  detail: (playerId: string) => ["player-intel", playerId] as const,
};

export function playerIntelQueryOptions(playerId: string) {
  return queryOptions({
    queryKey: playerIntelQueryKeys.detail(playerId),
    queryFn: ({ signal }) => getPlayerIntelResource(playerId, { signal }),
    staleTime: 60_000,
    gcTime: 15 * 60_000,
    placeholderData: keepPreviousData,
    retry: (failureCount, error) => {
      if (failureCount >= 2) return false;
      return error instanceof PlayerIntelResourceError ? error.retryable : true;
    },
  });
}
