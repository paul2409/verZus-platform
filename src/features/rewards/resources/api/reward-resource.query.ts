// VERZUS M10.3 INDEPENDENT REWARD QUERY RESOURCES

import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import { RewardResourceError } from "../adapter/reward-resource.adapter";
import type { RewardResourceName, RewardResourceScenario } from "../model/reward-resource.types";
import {
  getRewardAchievementsResource,
  getRewardHistoryResource,
  getRewardInventoryResource,
  getRewardProgressResource,
  getRewardSeasonResource,
} from "./reward-resource.client";

export const rewardResourceQueryKeys = {
  all: ["reward-resources"] as const,
  resource: (resource: RewardResourceName, scenario: RewardResourceScenario) =>
    ["reward-resources", resource, scenario] as const,
};

function retryResource(failureCount: number, error: Error): boolean {
  if (failureCount >= 2) return false;
  return error instanceof RewardResourceError ? error.retryable : true;
}

const shared = {
  gcTime: 15 * 60_000,
  placeholderData: keepPreviousData,
  retry: retryResource,
  refetchOnWindowFocus: false,
};

export const rewardProgressQueryOptions = (scenario: RewardResourceScenario) =>
  queryOptions({
    queryKey: rewardResourceQueryKeys.resource("progress", scenario),
    queryFn: ({ signal }) => getRewardProgressResource({ scenario, signal }),
    staleTime: 60_000,
    ...shared,
  });

export const rewardSeasonQueryOptions = (scenario: RewardResourceScenario) =>
  queryOptions({
    queryKey: rewardResourceQueryKeys.resource("season", scenario),
    queryFn: ({ signal }) => getRewardSeasonResource({ scenario, signal }),
    staleTime: 2 * 60_000,
    ...shared,
  });

export const rewardInventoryQueryOptions = (scenario: RewardResourceScenario) =>
  queryOptions({
    queryKey: rewardResourceQueryKeys.resource("inventory", scenario),
    queryFn: ({ signal }) => getRewardInventoryResource({ scenario, signal }),
    staleTime: 30_000,
    ...shared,
  });

export const rewardHistoryQueryOptions = (scenario: RewardResourceScenario) =>
  queryOptions({
    queryKey: rewardResourceQueryKeys.resource("history", scenario),
    queryFn: ({ signal }) => getRewardHistoryResource({ scenario, signal }),
    staleTime: 2 * 60_000,
    ...shared,
  });

export const rewardAchievementsQueryOptions = (scenario: RewardResourceScenario) =>
  queryOptions({
    queryKey: rewardResourceQueryKeys.resource("achievements", scenario),
    queryFn: ({ signal }) => getRewardAchievementsResource({ scenario, signal }),
    staleTime: 5 * 60_000,
    ...shared,
  });
