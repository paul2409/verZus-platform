// VERZUS M8.9 MATCH INTEL QUERY RESOURCE

import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import { MatchIntelResourceError } from "./match-intel-resource.adapter";
import { getMatchIntelResource } from "./match-intel-resource.client";
import type { MatchIntelResourceScenario } from "./match-intel-resource.schema";

export const matchIntelQueryKeys = {
  all: ["match-intel"] as const,
  detail: (matchId: string, scenario: MatchIntelResourceScenario) =>
    ["match-intel", matchId, scenario] as const,
};

export function matchIntelQueryOptions(
  matchId: string,
  scenario: MatchIntelResourceScenario = "normal",
) {
  return queryOptions({
    queryKey: matchIntelQueryKeys.detail(matchId, scenario),
    queryFn: ({ signal }) => getMatchIntelResource(matchId, { scenario, signal }),
    staleTime: 30_000,
    gcTime: 10 * 60_000,
    placeholderData: keepPreviousData,
    retry: (failureCount, error) => {
      if (failureCount >= 2) return false;
      return error instanceof MatchIntelResourceError ? error.retryable : true;
    },
  });
}
