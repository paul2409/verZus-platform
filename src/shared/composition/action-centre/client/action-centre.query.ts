import { queryOptions } from "@tanstack/react-query";

import { ActionCentreClientError, getActionCentre } from "./action-centre.client";

export const actionCentreQueryKey = ["action-centre"] as const;

export function actionCentreQueryOptions() {
  return queryOptions({
    queryKey: actionCentreQueryKey,
    queryFn: ({ signal }) => getActionCentre(signal),
    staleTime: 15_000,
    gcTime: 5 * 60_000,
    refetchInterval: 30_000,
    retry: (failureCount, error) => {
      if (failureCount >= 2) return false;
      return !(error instanceof ActionCentreClientError) || error.retryable;
    },
  });
}
