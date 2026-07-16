"use client";

import { useQuery } from "@tanstack/react-query";

import {
  competitionDiscoveryListQueryOptions,
  competitionDiscoveryMetadataQueryOptions,
  currentCompetitionEntryQueryOptions,
  featuredCompetitionQueryOptions,
} from "../api";
import type {
  CompetitionDiscoveryFilters,
  CompetitionDiscoveryScenario,
} from "../model/competition-discovery.types";
import { competitionResourceFromQuery } from "../ui/competition-discovery-resource";

export function useCompetitionDiscoveryData(
  filters: CompetitionDiscoveryFilters,
  scenario: CompetitionDiscoveryScenario,
) {
  const featuredQuery = useQuery(featuredCompetitionQueryOptions(scenario));
  const listQuery = useQuery(competitionDiscoveryListQueryOptions(filters, scenario));
  const metadataQuery = useQuery(competitionDiscoveryMetadataQueryOptions(scenario));
  const entryQuery = useQuery(currentCompetitionEntryQueryOptions(scenario));

  return {
    featured: competitionResourceFromQuery(featuredQuery, (data) => data.competition === null),
    list: competitionResourceFromQuery(listQuery, (data) => data.items.length === 0),
    metadata: competitionResourceFromQuery(metadataQuery),
    entry: competitionResourceFromQuery(entryQuery, (data) => data.entry === null),
    retryFeatured: () => void featuredQuery.refetch(),
    retryList: () => void listQuery.refetch(),
    retryMetadata: () => void metadataQuery.refetch(),
    retryEntry: () => void entryQuery.refetch(),
  };
}
