// VERZUS M5 STEPS 5.1-5.4

import { queryOptions } from "@tanstack/react-query";

import type { PlayScenario } from "../model";
import { PlayApiClientError } from "./play-api.adapter";
import {
  getCrewSummary,
  getCurrentCheckIn,
  getCurrentPosition,
  getNextMatch,
  getPlayerStatus,
  getRecentActivity,
  getRecommendedCompetitions,
  type PlayReadRequest,
} from "./play-api.client";

export const playQueryKeys = {
  all: ["play"] as const,
  playerStatus: (scenario: PlayScenario | undefined) =>
    ["play", "player-status", scenario ?? "live"] as const,
  nextMatch: (scenario: PlayScenario | undefined) =>
    ["play", "next-match", scenario ?? "live"] as const,
  currentCheckIn: (scenario: PlayScenario | undefined) =>
    ["play", "current-check-in", scenario ?? "live"] as const,
  currentPosition: (scenario: PlayScenario | undefined) =>
    ["play", "current-position", scenario ?? "live"] as const,
  crewSummary: (scenario: PlayScenario | undefined) =>
    ["play", "crew-summary", scenario ?? "live"] as const,
  recommendedCompetitions: (scenario: PlayScenario | undefined) =>
    ["play", "recommended-competitions", scenario ?? "live"] as const,
  recentActivity: (scenario: PlayScenario | undefined) =>
    ["play", "recent-activity", scenario ?? "live"] as const,
};

function requestFor(scenario: PlayScenario | undefined, signal: AbortSignal): PlayReadRequest {
  return scenario ? { scenario, signal } : { signal };
}

function retryPlayRead(failureCount: number, error: Error): boolean {
  if (failureCount >= 2) {
    return false;
  }

  if (error instanceof PlayApiClientError) {
    return error.retryable;
  }

  return true;
}

export function playerStatusQueryOptions(scenario?: PlayScenario) {
  return queryOptions({
    queryKey: playQueryKeys.playerStatus(scenario),
    queryFn: ({ signal }) => getPlayerStatus(requestFor(scenario, signal)),
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    retry: retryPlayRead,
  });
}

export function nextMatchQueryOptions(scenario?: PlayScenario) {
  return queryOptions({
    queryKey: playQueryKeys.nextMatch(scenario),
    queryFn: ({ signal }) => getNextMatch(requestFor(scenario, signal)),
    staleTime: 15_000,
    gcTime: 5 * 60_000,
    refetchInterval: 30_000,
    retry: retryPlayRead,
  });
}

export function currentCheckInQueryOptions(scenario?: PlayScenario) {
  return queryOptions({
    queryKey: playQueryKeys.currentCheckIn(scenario),
    queryFn: ({ signal }) => getCurrentCheckIn(requestFor(scenario, signal)),
    staleTime: 5_000,
    gcTime: 2 * 60_000,
    refetchInterval: 10_000,
    retry: retryPlayRead,
  });
}

export function currentPositionQueryOptions(scenario?: PlayScenario) {
  return queryOptions({
    queryKey: playQueryKeys.currentPosition(scenario),
    queryFn: ({ signal }) => getCurrentPosition(requestFor(scenario, signal)),
    staleTime: 60_000,
    gcTime: 15 * 60_000,
    retry: retryPlayRead,
  });
}

export function crewSummaryQueryOptions(scenario?: PlayScenario) {
  return queryOptions({
    queryKey: playQueryKeys.crewSummary(scenario),
    queryFn: ({ signal }) => getCrewSummary(requestFor(scenario, signal)),
    staleTime: 45_000,
    gcTime: 10 * 60_000,
    retry: retryPlayRead,
  });
}

export function recommendedCompetitionsQueryOptions(scenario?: PlayScenario) {
  return queryOptions({
    queryKey: playQueryKeys.recommendedCompetitions(scenario),
    queryFn: ({ signal }) => getRecommendedCompetitions(requestFor(scenario, signal)),
    staleTime: 2 * 60_000,
    gcTime: 20 * 60_000,
    retry: retryPlayRead,
  });
}

export function recentActivityQueryOptions(scenario?: PlayScenario) {
  return queryOptions({
    queryKey: playQueryKeys.recentActivity(scenario),
    queryFn: ({ signal }) => getRecentActivity(requestFor(scenario, signal)),
    staleTime: 60_000,
    gcTime: 15 * 60_000,
    retry: retryPlayRead,
  });
}
