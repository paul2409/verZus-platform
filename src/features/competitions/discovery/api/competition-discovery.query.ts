import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import type {
  CompetitionDiscoveryFilters,
  CompetitionDiscoveryScenario,
} from "../model/competition-discovery.types";
import { CompetitionDiscoveryApiClientError } from "./competition-discovery-api.adapter";
import {
  getCompetitionDiscoveryList,
  getCompetitionDiscoveryMetadata,
  getCurrentCompetitionEntry,
  getFeaturedCompetition,
  type CompetitionDiscoveryReadRequest,
} from "./competition-discovery-api.client";

export const competitionDiscoveryQueryKeys = {
  all: ["competitions", "discovery"] as const,
  featured: (scenario: CompetitionDiscoveryScenario) =>
    ["competitions", "discovery", "featured", scenario] as const,
  list: (filters: CompetitionDiscoveryFilters, scenario: CompetitionDiscoveryScenario) =>
    ["competitions", "discovery", "list", filters, scenario] as const,
  metadata: (scenario: CompetitionDiscoveryScenario) =>
    ["competitions", "discovery", "metadata", scenario] as const,
  currentEntry: (scenario: CompetitionDiscoveryScenario) =>
    ["competitions", "discovery", "current-entry", scenario] as const,
};

function requestFor(
  scenario: CompetitionDiscoveryScenario,
  signal: AbortSignal,
): CompetitionDiscoveryReadRequest {
  return scenario === "normal" ? { signal } : { scenario, signal };
}

function retryCompetitionRead(failureCount: number, error: Error): boolean {
  if (failureCount >= 2) return false;
  return error instanceof CompetitionDiscoveryApiClientError ? error.retryable : true;
}

export function featuredCompetitionQueryOptions(scenario: CompetitionDiscoveryScenario = "normal") {
  return queryOptions({
    queryKey: competitionDiscoveryQueryKeys.featured(scenario),
    queryFn: ({ signal }) => getFeaturedCompetition(requestFor(scenario, signal)),
    staleTime: 2 * 60_000,
    gcTime: 20 * 60_000,
    retry: retryCompetitionRead,
  });
}

export function competitionDiscoveryListQueryOptions(
  filters: CompetitionDiscoveryFilters,
  scenario: CompetitionDiscoveryScenario = "normal",
) {
  return queryOptions({
    queryKey: competitionDiscoveryQueryKeys.list(filters, scenario),
    queryFn: ({ signal }) => getCompetitionDiscoveryList(filters, requestFor(scenario, signal)),
    staleTime: 30_000,
    gcTime: 10 * 60_000,
    placeholderData: keepPreviousData,
    retry: retryCompetitionRead,
  });
}

export function competitionDiscoveryMetadataQueryOptions(
  scenario: CompetitionDiscoveryScenario = "normal",
) {
  return queryOptions({
    queryKey: competitionDiscoveryQueryKeys.metadata(scenario),
    queryFn: ({ signal }) => getCompetitionDiscoveryMetadata(requestFor(scenario, signal)),
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
    retry: retryCompetitionRead,
  });
}

export function currentCompetitionEntryQueryOptions(
  scenario: CompetitionDiscoveryScenario = "normal",
) {
  return queryOptions({
    queryKey: competitionDiscoveryQueryKeys.currentEntry(scenario),
    queryFn: ({ signal }) => getCurrentCompetitionEntry(requestFor(scenario, signal)),
    staleTime: 30_000,
    gcTime: 10 * 60_000,
    retry: retryCompetitionRead,
  });
}
