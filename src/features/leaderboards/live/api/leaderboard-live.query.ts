// VERZUS M8.5 LIVE UPDATE TANSTACK QUERY

import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import type { LeaderboardQueryState } from "../../explorer";
import type { LeaderboardLiveUpdateScenario } from "../model/leaderboard-live.types";
import { getLeaderboardLiveUpdate } from "./leaderboard-live.client";

export const leaderboardLiveQueryKeys = {
  update: (state: LeaderboardQueryState, scenario: LeaderboardLiveUpdateScenario) =>
    ["leaderboards", state.mode, "updates", state, scenario] as const,
};

export function leaderboardLiveUpdateQueryOptions(
  state: LeaderboardQueryState,
  scenario: LeaderboardLiveUpdateScenario = "normal",
  enabled = true,
) {
  return queryOptions({
    queryKey: leaderboardLiveQueryKeys.update(state, scenario),
    queryFn: ({ signal }) => getLeaderboardLiveUpdate(state, scenario, signal),
    enabled,
    staleTime: 15_000,
    gcTime: 10 * 60_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    placeholderData: keepPreviousData,
    retry: 2,
  });
}
