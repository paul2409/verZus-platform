// VERZUS M8.3 INDEPENDENT TANSTACK QUERY RESOURCES

import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import type { LeaderboardQueryState } from "../../explorer/model/leaderboard-query-state";
import type { LeaderboardMode } from "../../foundation/model/leaderboard-foundation.types";
import type { LeaderboardResourceScenario } from "../model/leaderboard-resource.types";
import { LeaderboardApiClientError } from "./leaderboard-api.adapter";
import {
  getLeaderboardComposition,
  getLeaderboardCurrentPosition,
  getLeaderboardEntries,
  getLeaderboardRewards,
  getLeaderboardStatus,
  getLeaderboardSummary,
  type LeaderboardReadRequest,
} from "./leaderboard-api.client";

export const leaderboardQueryKeys = {
  all: ["leaderboards"] as const,
  mode: (mode: LeaderboardMode) => ["leaderboards", mode] as const,
  composition: (mode: LeaderboardMode, scenario: LeaderboardResourceScenario) =>
    ["leaderboards", mode, "composition", scenario] as const,
  summary: (mode: LeaderboardMode, scenario: LeaderboardResourceScenario) =>
    ["leaderboards", mode, "summary", scenario] as const,
  entries: (state: LeaderboardQueryState, scenario: LeaderboardResourceScenario) =>
    ["leaderboards", state.mode, "entries", state, scenario] as const,
  currentPosition: (mode: LeaderboardMode, scenario: LeaderboardResourceScenario) =>
    ["leaderboards", mode, "current-position", scenario] as const,
  rewards: (mode: LeaderboardMode, scenario: LeaderboardResourceScenario) =>
    ["leaderboards", mode, "rewards", scenario] as const,
  status: (mode: LeaderboardMode, scenario: LeaderboardResourceScenario) =>
    ["leaderboards", mode, "status", scenario] as const,
};

function requestFor(
  scenario: LeaderboardResourceScenario,
  signal: AbortSignal,
): LeaderboardReadRequest {
  return scenario === "normal" ? { signal } : { scenario, signal };
}

function retryLeaderboardRead(failureCount: number, error: Error): boolean {
  if (failureCount >= 2) return false;
  return error instanceof LeaderboardApiClientError ? error.retryable : true;
}

// VERZUS M8.4 MODE COMPOSITION QUERY RESOURCE
export function leaderboardCompositionQueryOptions(
  mode: LeaderboardMode,
  scenario: LeaderboardResourceScenario = "normal",
) {
  return queryOptions({
    queryKey: leaderboardQueryKeys.composition(mode, scenario),
    queryFn: ({ signal }) => getLeaderboardComposition(mode, requestFor(scenario, signal)),
    staleTime: 30 * 60_000,
    placeholderData: keepPreviousData,
    gcTime: 60 * 60_000,
    retry: retryLeaderboardRead,
  });
}

export function leaderboardSummaryQueryOptions(
  mode: LeaderboardMode,
  scenario: LeaderboardResourceScenario = "normal",
) {
  return queryOptions({
    queryKey: leaderboardQueryKeys.summary(mode, scenario),
    queryFn: ({ signal }) => getLeaderboardSummary(mode, requestFor(scenario, signal)),
    staleTime: 5 * 60_000,
    placeholderData: keepPreviousData,
    gcTime: 30 * 60_000,
    retry: retryLeaderboardRead,
  });
}

export function leaderboardEntriesQueryOptions(
  state: LeaderboardQueryState,
  scenario: LeaderboardResourceScenario = "normal",
) {
  return queryOptions({
    queryKey: leaderboardQueryKeys.entries(state, scenario),
    queryFn: ({ signal }) => getLeaderboardEntries(state, requestFor(scenario, signal)),
    staleTime: 30_000,
    gcTime: 10 * 60_000,
    placeholderData: keepPreviousData,
    retry: retryLeaderboardRead,
  });
}

export function leaderboardCurrentPositionQueryOptions(
  mode: LeaderboardMode,
  scenario: LeaderboardResourceScenario = "normal",
) {
  return queryOptions({
    queryKey: leaderboardQueryKeys.currentPosition(mode, scenario),
    queryFn: ({ signal }) => getLeaderboardCurrentPosition(mode, requestFor(scenario, signal)),
    staleTime: 20_000,
    placeholderData: keepPreviousData,
    gcTime: 10 * 60_000,
    retry: retryLeaderboardRead,
  });
}

export function leaderboardRewardsQueryOptions(
  mode: LeaderboardMode,
  scenario: LeaderboardResourceScenario = "normal",
) {
  return queryOptions({
    queryKey: leaderboardQueryKeys.rewards(mode, scenario),
    queryFn: ({ signal }) => getLeaderboardRewards(mode, requestFor(scenario, signal)),
    staleTime: 10 * 60_000,
    placeholderData: keepPreviousData,
    gcTime: 30 * 60_000,
    retry: retryLeaderboardRead,
  });
}

export function leaderboardStatusQueryOptions(
  mode: LeaderboardMode,
  scenario: LeaderboardResourceScenario = "normal",
) {
  return queryOptions({
    queryKey: leaderboardQueryKeys.status(mode, scenario),
    queryFn: ({ signal }) => getLeaderboardStatus(mode, requestFor(scenario, signal)),
    staleTime: 15_000,
    placeholderData: keepPreviousData,
    gcTime: 5 * 60_000,
    refetchInterval: 30_000,
    retry: retryLeaderboardRead,
  });
}
