import { queryOptions } from "@tanstack/react-query";
import { fetchProfilePrivacy } from "./profile-privacy.client";

export const profilePrivacyQueryKey = ["profile", "privacy"] as const;
export function profilePrivacyQueryOptions() {
  return queryOptions({
    queryKey: profilePrivacyQueryKey,
    queryFn: ({ signal }) => fetchProfilePrivacy({ signal }),
    staleTime: 30_000,
    gcTime: 10 * 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
