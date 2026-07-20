// VERZUS M11.4 PROFILE QUERY OPTIONS

import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import {
  getProfileAvailabilityResource,
  getProfileCompetitiveSummaryResource,
  getProfileCrewResource,
  getProfileIdentityResource,
} from "./profile-resource.client";
import type { ProfileResourceScenario } from "../model/profile-resource.types";

export const profileResourceKeys = {
  all: ["profile", "resources"] as const,
  identity: (scenario: ProfileResourceScenario) =>
    [...profileResourceKeys.all, "identity", scenario] as const,
  competitiveSummary: (scenario: ProfileResourceScenario) =>
    [...profileResourceKeys.all, "competitive-summary", scenario] as const,
  crew: (scenario: ProfileResourceScenario) =>
    [...profileResourceKeys.all, "crew", scenario] as const,
  availability: (scenario: ProfileResourceScenario) =>
    [...profileResourceKeys.all, "availability", scenario] as const,
};

const shared = {
  staleTime: 30_000,
  gcTime: 10 * 60_000,
  retry: 1,
  refetchOnWindowFocus: false,
  placeholderData: keepPreviousData,
};

export function profileIdentityQueryOptions(scenario: ProfileResourceScenario) {
  return queryOptions({
    ...shared,
    queryKey: profileResourceKeys.identity(scenario),
    queryFn: ({ signal }) => getProfileIdentityResource({ scenario, signal }),
  });
}

export function profileCompetitiveSummaryQueryOptions(scenario: ProfileResourceScenario) {
  return queryOptions({
    ...shared,
    queryKey: profileResourceKeys.competitiveSummary(scenario),
    queryFn: ({ signal }) => getProfileCompetitiveSummaryResource({ scenario, signal }),
  });
}

export function profileCrewQueryOptions(scenario: ProfileResourceScenario) {
  return queryOptions({
    ...shared,
    queryKey: profileResourceKeys.crew(scenario),
    queryFn: ({ signal }) => getProfileCrewResource({ scenario, signal }),
  });
}

export function profileAvailabilityQueryOptions(scenario: ProfileResourceScenario) {
  return queryOptions({
    ...shared,
    queryKey: profileResourceKeys.availability(scenario),
    queryFn: ({ signal }) => getProfileAvailabilityResource({ scenario, signal }),
  });
}
