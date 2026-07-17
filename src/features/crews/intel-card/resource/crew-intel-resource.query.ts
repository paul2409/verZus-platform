// VERZUS M8.9 CREW INTEL QUERY RESOURCE

import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import { CrewIntelResourceError } from "./crew-intel-resource.adapter";
import { getCrewIntelResource } from "./crew-intel-resource.client";
import type { CrewIntelResourceScenario } from "./crew-intel-resource.schema";

export const crewIntelQueryKeys = {
  all: ["crew-intel"] as const,
  detail: (crewId: string, scenario: CrewIntelResourceScenario) =>
    ["crew-intel", crewId, scenario] as const,
};

export function crewIntelQueryOptions(
  crewId: string,
  scenario: CrewIntelResourceScenario = "normal",
) {
  return queryOptions({
    queryKey: crewIntelQueryKeys.detail(crewId, scenario),
    queryFn: ({ signal }) => getCrewIntelResource(crewId, { scenario, signal }),
    staleTime: 90_000,
    gcTime: 20 * 60_000,
    placeholderData: keepPreviousData,
    retry: (failureCount, error) => {
      if (failureCount >= 2) return false;
      return error instanceof CrewIntelResourceError ? error.retryable : true;
    },
  });
}
