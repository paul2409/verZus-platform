import { queryOptions } from "@tanstack/react-query";

import { readSmartDefaults } from "./smart-defaults.client";

export const smartDefaultsQueryKey = ["smart-defaults", "current-user"] as const;

export function smartDefaultsQueryOptions() {
  return queryOptions({
    queryKey: smartDefaultsQueryKey,
    queryFn: readSmartDefaults,
    staleTime: 5 * 60 * 1_000,
    gcTime: 30 * 60 * 1_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
