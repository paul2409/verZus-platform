"use client";

import { useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  crewSummaryQueryOptions,
  currentCheckInQueryOptions,
  currentPositionQueryOptions,
  nextMatchQueryOptions,
  playerStatusQueryOptions,
  recentActivityQueryOptions,
  recommendedCompetitionsQueryOptions,
} from "../api";
import { buildPlayCommandCenterViewModel, type PlayCommandCenterViewModel } from "../view-model";
import { playResourceFromQuery } from "./play-query-resource";

function subscribeToOnlineStatus(onStoreChange: () => void): () => void {
  window.addEventListener("online", onStoreChange);
  window.addEventListener("offline", onStoreChange);
  return () => {
    window.removeEventListener("online", onStoreChange);
    window.removeEventListener("offline", onStoreChange);
  };
}

function getOnlineSnapshot(): boolean {
  return navigator.onLine;
}

function getServerOnlineSnapshot(): boolean {
  return true;
}

export interface PlayCommandCenterController {
  viewModel: PlayCommandCenterViewModel;
  refreshing: boolean;
  retry: {
    playerStatus: () => void;
    nextMatch: () => void;
    currentCheckIn: () => void;
    currentPosition: () => void;
    crewSummary: () => void;
    recommendedCompetitions: () => void;
    recentActivity: () => void;
    all: () => void;
  };
}

export function usePlayCommandCenter(): PlayCommandCenterController {
  const playerStatusQuery = useQuery(playerStatusQueryOptions());
  const nextMatchQuery = useQuery(nextMatchQueryOptions());
  const currentCheckInQuery = useQuery(currentCheckInQueryOptions());
  const currentPositionQuery = useQuery(currentPositionQueryOptions());
  const crewSummaryQuery = useQuery(crewSummaryQueryOptions());
  const recommendedCompetitionsQuery = useQuery(recommendedCompetitionsQueryOptions());
  const recentActivityQuery = useQuery(recentActivityQueryOptions());
  const online = useSyncExternalStore(subscribeToOnlineStatus, getOnlineSnapshot, getServerOnlineSnapshot);

  const viewModel = buildPlayCommandCenterViewModel(
    {
      playerStatus: playResourceFromQuery(playerStatusQuery),
      nextMatch: playResourceFromQuery(nextMatchQuery),
      currentCheckIn: playResourceFromQuery(currentCheckInQuery),
      currentPosition: playResourceFromQuery(currentPositionQuery),
      crewSummary: playResourceFromQuery(crewSummaryQuery),
      recommendedCompetitions: playResourceFromQuery(
        recommendedCompetitionsQuery,
        (items) => items.length === 0,
      ),
      recentActivity: playResourceFromQuery(recentActivityQuery, (items) => items.length === 0),
    },
    online,
  );

  const retry = {
    playerStatus: () => void playerStatusQuery.refetch(),
    nextMatch: () => void nextMatchQuery.refetch(),
    currentCheckIn: () => void currentCheckInQuery.refetch(),
    currentPosition: () => void currentPositionQuery.refetch(),
    crewSummary: () => void crewSummaryQuery.refetch(),
    recommendedCompetitions: () => void recommendedCompetitionsQuery.refetch(),
    recentActivity: () => void recentActivityQuery.refetch(),
    all: () => {
      void Promise.all([
        playerStatusQuery.refetch(),
        nextMatchQuery.refetch(),
        currentCheckInQuery.refetch(),
        currentPositionQuery.refetch(),
        crewSummaryQuery.refetch(),
        recommendedCompetitionsQuery.refetch(),
        recentActivityQuery.refetch(),
      ]);
    },
  };

  return {
    viewModel,
    refreshing: [
      playerStatusQuery,
      nextMatchQuery,
      currentCheckInQuery,
      currentPositionQuery,
      crewSummaryQuery,
      recommendedCompetitionsQuery,
      recentActivityQuery,
    ].some((query) => query.isFetching),
    retry,
  };
}
