// VERZUS M12.5 PERSONALIZED ACTIVITY FEED QUERY OPTIONS

import { infiniteQueryOptions } from "@tanstack/react-query";

import type {
  ActivityFeedDomain,
  ActivityFeedScenario,
} from "../model/activity-feed.types";
import { getActivityFeed } from "./activity-feed.client";

export const activityFeedKeys = {
  all: ["activity", "feed"] as const,
  list: (input: {
    domain: ActivityFeedDomain;
    pageSize: number;
    scenario: ActivityFeedScenario;
  }) => [...activityFeedKeys.all, input] as const,
};

export function activityFeedInfiniteQueryOptions(input: {
  domain: ActivityFeedDomain;
  pageSize: number;
  scenario: ActivityFeedScenario;
}) {
  return infiniteQueryOptions({
    queryKey: activityFeedKeys.list(input),
    queryFn: ({ pageParam, signal }) =>
      getActivityFeed({
        ...input,
        cursor: pageParam,
        signal,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.meta.nextCursor,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
