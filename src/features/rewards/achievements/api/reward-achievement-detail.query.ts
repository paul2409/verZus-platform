// VERZUS M10.6 ACHIEVEMENT DETAIL QUERY RESOURCE

import { queryOptions } from "@tanstack/react-query";

import { RewardAchievementDetailError } from "../adapter/reward-achievement-detail.adapter";
import { getRewardAchievementDetail } from "./reward-achievement-detail.client";

export const rewardAchievementDetailQueryKey = (achievementId: string) =>
  ["reward-achievement-detail", achievementId] as const;

export const rewardAchievementDetailQueryOptions = (achievementId: string) =>
  queryOptions({
    queryKey: rewardAchievementDetailQueryKey(achievementId),
    queryFn: ({ signal }) => getRewardAchievementDetail(achievementId, signal),
    enabled: achievementId.length > 0,
    staleTime: 5 * 60_000,
    gcTime: 15 * 60_000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) =>
      failureCount < 2 && (!(error instanceof RewardAchievementDetailError) || error.retryable),
  });
