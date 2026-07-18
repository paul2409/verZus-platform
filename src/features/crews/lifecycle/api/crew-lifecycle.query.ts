// VERZUS M9.7 CREW LIFECYCLE QUERY RESOURCE

import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import type { CrewLifecycleScenario } from "../model/crew-lifecycle.types";
import { CrewLifecycleClientError, getCrewLifecycle } from "./crew-lifecycle.client";

export const crewLifecycleQueryKeys = {
  all: ["crew-lifecycle"] as const,
  detail: (crewId: string, scenario: CrewLifecycleScenario) =>
    [...crewLifecycleQueryKeys.all, crewId, scenario] as const,
};

export function crewLifecycleQueryOptions(
  crewId: string,
  scenario: CrewLifecycleScenario = "normal",
) {
  return queryOptions({
    queryKey: crewLifecycleQueryKeys.detail(crewId, scenario),
    queryFn: ({ signal }) => getCrewLifecycle(crewId, scenario, signal),
    staleTime: 20_000,
    gcTime: 10 * 60_000,
    placeholderData: keepPreviousData,
    retry: (failureCount, error) =>
      failureCount < 1 && (!(error instanceof CrewLifecycleClientError) || error.retryable),
  });
}
