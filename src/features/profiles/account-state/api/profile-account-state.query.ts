// VERZUS M11.7 PROFILE ACCOUNT-STATE QUERY RESOURCE

import { queryOptions } from "@tanstack/react-query";

import type { ProfileAccountStateScenario } from "../model/profile-account-state.types";
import { fetchProfileAccountState } from "./profile-account-state.client";

export function profileAccountStateQueryOptions(scenario: ProfileAccountStateScenario) {
  return queryOptions({
    queryKey: ["profile", "account-state", scenario] as const,
    queryFn: ({ signal }) => fetchProfileAccountState({ scenario, signal }),
    staleTime: 15_000,
    gcTime: 5 * 60_000,
    retry: 1,
    refetchOnWindowFocus: true,
  });
}
