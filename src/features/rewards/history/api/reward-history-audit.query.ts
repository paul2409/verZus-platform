// VERZUS M10.6 AUDITABLE REWARD HISTORY QUERY RESOURCE

import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import { RewardHistoryAuditError } from "../adapter/reward-history-audit.adapter";
import { getRewardHistoryAudit } from "./reward-history-audit.client";

export const rewardHistoryAuditQueryKey = (page: number) => ["reward-history-audit", page] as const;

export const rewardHistoryAuditQueryOptions = (page: number) =>
  queryOptions({
    queryKey: rewardHistoryAuditQueryKey(page),
    queryFn: ({ signal }) => getRewardHistoryAudit(page, signal),
    staleTime: 2 * 60_000,
    gcTime: 15 * 60_000,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) =>
      failureCount < 2 && (!(error instanceof RewardHistoryAuditError) || error.retryable),
  });
