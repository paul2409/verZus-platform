// VERZUS M9.5 CREW MEMBERSHIP QUERY RESOURCES

import { queryOptions } from "@tanstack/react-query";

import { CrewMembershipClientError, getCrewMembership } from "./crew-membership.client";

export const crewMembershipQueryKeys = {
  all: ["crew-membership"] as const,
  detail: (crewId: string) => ["crew-membership", crewId] as const,
};

export const crewMembershipQueryOptions = (crewId: string) =>
  queryOptions({
    queryKey: crewMembershipQueryKeys.detail(crewId),
    queryFn: ({ signal }) => getCrewMembership(crewId, signal),
    staleTime: 30_000,
    gcTime: 10 * 60_000,
    retry: (failureCount, error) =>
      failureCount < 2 && (error instanceof CrewMembershipClientError ? error.retryable : true),
  });
