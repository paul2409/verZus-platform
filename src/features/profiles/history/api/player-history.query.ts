// VERZUS M11.5 PLAYER HISTORY QUERY OPTIONS

import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import type {
  PlayerHistoryGameFilter,
  PlayerHistoryResultFilter,
  PlayerHistoryScenario,
  PlayerStatisticsWindow,
} from "../model/player-history.types";
import { getPlayerDetailedStatistics, getPlayerMatchHistory } from "./player-history.client";

export const playerHistoryKeys = {
  all: ["profile", "history"] as const,
  matches: (input: {
    game: PlayerHistoryGameFilter;
    result: PlayerHistoryResultFilter;
    page: number;
    scenario: PlayerHistoryScenario;
  }) => [...playerHistoryKeys.all, "matches", input] as const,
  statistics: (input: {
    game: PlayerHistoryGameFilter;
    window: PlayerStatisticsWindow;
    scenario: PlayerHistoryScenario;
  }) => [...playerHistoryKeys.all, "statistics", input] as const,
};

export function playerMatchHistoryQueryOptions(input: {
  game: PlayerHistoryGameFilter;
  result: PlayerHistoryResultFilter;
  page: number;
  scenario: PlayerHistoryScenario;
}) {
  return queryOptions({
    queryKey: playerHistoryKeys.matches(input),
    queryFn: ({ signal }) => getPlayerMatchHistory({ ...input, signal }),
    staleTime: 30_000,
    gcTime: 10 * 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
}

export function playerDetailedStatisticsQueryOptions(input: {
  game: PlayerHistoryGameFilter;
  window: PlayerStatisticsWindow;
  scenario: PlayerHistoryScenario;
}) {
  return queryOptions({
    queryKey: playerHistoryKeys.statistics(input),
    queryFn: ({ signal }) => getPlayerDetailedStatistics({ ...input, signal }),
    staleTime: 60_000,
    gcTime: 15 * 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
}
