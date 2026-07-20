// VERZUS M11.7 PROFILE PRIVACY QUERY RESOURCE

import { queryOptions } from "@tanstack/react-query";

import type { ProfilePrivacyScenario } from "../model/profile-privacy.types";
import { fetchProfilePrivacy } from "./profile-privacy.client";

export const profilePrivacyQueryKey = (scenario: ProfilePrivacyScenario) =>
  ["profile", "privacy", scenario] as const;

export function profilePrivacyQueryOptions(scenario: ProfilePrivacyScenario) {
  return queryOptions({
    queryKey: profilePrivacyQueryKey(scenario),
    queryFn: ({ signal }) => fetchProfilePrivacy({ scenario, signal }),
    staleTime: 30_000,
    gcTime: 10 * 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
