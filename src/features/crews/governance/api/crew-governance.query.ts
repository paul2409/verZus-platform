// VERZUS M9.6 CREW GOVERNANCE QUERY RESOURCE

import { queryOptions } from "@tanstack/react-query";

import { getCrewGovernance } from "./crew-governance.client";

export const crewGovernanceQueryKeys = {
  all: ["crew-governance"] as const,
  detail: (crewId: string) => [...crewGovernanceQueryKeys.all, crewId] as const,
};

export function crewGovernanceQueryOptions(crewId: string) {
  return queryOptions({
    queryKey: crewGovernanceQueryKeys.detail(crewId),
    queryFn: ({ signal }) => getCrewGovernance(crewId, signal),
    staleTime: 20_000,
    gcTime: 10 * 60_000,
    retry: 1,
  });
}
