"use client";

// VERZUS M8.3 INDEPENDENT LEADERBOARD QUERY HOOKS
// VERZUS M8.6 PER-RESOURCE RELIABILITY HEALTH

import { useQuery } from "@tanstack/react-query";

import type { LeaderboardQueryState } from "../../explorer/model/leaderboard-query-state";
import {
  createLeaderboardReliabilityView,
  createLeaderboardResourceHealth,
  type LeaderboardReliabilityIntent,
  type LeaderboardReliabilityTarget,
  type LeaderboardResourceScenarioPlan,
} from "../../reliability";
import {
  leaderboardCompositionQueryOptions,
  leaderboardCurrentPositionQueryOptions,
  leaderboardEntriesQueryOptions,
  leaderboardRewardsQueryOptions,
  leaderboardStatusQueryOptions,
  leaderboardSummaryQueryOptions,
} from "../api/leaderboard.query";
import type { LeaderboardResourceSnapshot } from "../model/leaderboard-resource.types";

const normalScenarioPlan: LeaderboardResourceScenarioPlan = {
  composition: "normal",
  summary: "normal",
  entries: "normal",
  "current-position": "normal",
  rewards: "normal",
  status: "normal",
};

export function useLeaderboardResources(
  state: LeaderboardQueryState,
  options: {
    intent?: LeaderboardReliabilityIntent;
    target?: LeaderboardReliabilityTarget;
    scenarios?: LeaderboardResourceScenarioPlan;
  } = {},
) {
  const scenarios = options.scenarios ?? normalScenarioPlan;
  const composition = useQuery(
    leaderboardCompositionQueryOptions(state.mode, scenarios.composition),
  );
  const summary = useQuery(leaderboardSummaryQueryOptions(state.mode, scenarios.summary));
  const entries = useQuery(leaderboardEntriesQueryOptions(state, scenarios.entries));
  const currentPosition = useQuery(
    leaderboardCurrentPositionQueryOptions(state.mode, scenarios["current-position"]),
  );
  const rewards = useQuery(leaderboardRewardsQueryOptions(state.mode, scenarios.rewards));
  const status = useQuery(leaderboardStatusQueryOptions(state.mode, scenarios.status));

  const snapshot: LeaderboardResourceSnapshot = {
    ...(composition.data ? { composition: composition.data } : {}),
    ...(summary.data ? { summary: summary.data } : {}),
    ...(entries.data ? { entries: entries.data } : {}),
    ...(currentPosition.data ? { currentPosition: currentPosition.data } : {}),
    ...(rewards.data ? { rewards: rewards.data } : {}),
    ...(status.data ? { status: status.data } : {}),
  };

  const health = {
    composition: createLeaderboardResourceHealth({
      resource: "composition",
      data: composition.data,
      error: composition.error,
      isPending: composition.isPending,
      isFetching: composition.isFetching,
    }),
    summary: createLeaderboardResourceHealth({
      resource: "summary",
      data: summary.data,
      error: summary.error,
      isPending: summary.isPending,
      isFetching: summary.isFetching,
    }),
    entries: createLeaderboardResourceHealth({
      resource: "entries",
      data: entries.data,
      error: entries.error,
      isPending: entries.isPending,
      isFetching: entries.isFetching,
    }),
    "current-position": createLeaderboardResourceHealth({
      resource: "current-position",
      data: currentPosition.data,
      error: currentPosition.error,
      isPending: currentPosition.isPending,
      isFetching: currentPosition.isFetching,
    }),
    rewards: createLeaderboardResourceHealth({
      resource: "rewards",
      data: rewards.data,
      error: rewards.error,
      isPending: rewards.isPending,
      isFetching: rewards.isFetching,
    }),
    status: createLeaderboardResourceHealth({
      resource: "status",
      data: status.data,
      error: status.error,
      isPending: status.isPending,
      isFetching: status.isFetching,
    }),
  };

  const reliability = createLeaderboardReliabilityView({
    intent: options.intent ?? "normal",
    target: options.target ?? "all",
    resources: health,
    ...(entries.data ? { entries: entries.data } : {}),
  });

  const retryAll = async () => {
    await Promise.all([
      composition.refetch(),
      summary.refetch(),
      entries.refetch(),
      currentPosition.refetch(),
      rewards.refetch(),
      status.refetch(),
    ]);
  };

  return {
    composition,
    summary,
    entries,
    currentPosition,
    rewards,
    status,
    snapshot,
    health,
    reliability,
    retryAll,
  };
}
