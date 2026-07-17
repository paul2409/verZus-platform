// VERZUS M8.9 PLAYER INTEL QUERY RESOURCE

import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import { getPlayerIntelResource } from "./player-intel-resource.client";
import type { PlayerIntelResourceScenario } from "./player-intel-resource.schema";
import { PlayerIntelResourceError } from "./player-intel-resource.adapter";

export const playerIntelQueryKeys = {
  all: ["player-intel"] as const,
  detail: (playerId: string, scenario: PlayerIntelResourceScenario) =>
    ["player-intel", playerId, scenario] as const,
};

export function playerIntelQueryOptions(
  playerId: string,
  scenario: PlayerIntelResourceScenario = "normal",
) {
  return queryOptions({
    queryKey: playerIntelQueryKeys.detail(playerId, scenario),
    queryFn: ({ signal }) => getPlayerIntelResource(playerId, { scenario, signal }),
    staleTime: 60_000,
    gcTime: 15 * 60_000,
    placeholderData: keepPreviousData,
    retry: (failureCount, error) => {
      if (failureCount >= 2) return false;
      return error instanceof PlayerIntelResourceError ? error.retryable : true;
    },
  });
}
