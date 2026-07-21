// VERZUS M12.2 SEARCH QUERY OPTIONS

import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import type { SearchEntityDomain } from "../../foundation";
import type { SearchResourceScenario } from "../model/search-resource.types";
import { getSearchResource } from "./search-resource.client";

export const searchResourceKeys = {
  all: ["search", "resources"] as const,
  domain: (
    domain: SearchEntityDomain,
    query: string,
    limit: number,
    scenario: SearchResourceScenario,
  ) => [...searchResourceKeys.all, domain, query, limit, scenario] as const,
};

export function searchResourceQueryOptions(input: {
  domain: SearchEntityDomain;
  query: string;
  limit: number;
  scenario: SearchResourceScenario;
  enabled: boolean;
}) {
  return queryOptions({
    queryKey: searchResourceKeys.domain(input.domain, input.query, input.limit, input.scenario),
    queryFn: ({ signal }) => getSearchResource({ ...input, signal }),
    enabled: input.enabled,
    staleTime: 15_000,
    gcTime: 5 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
}
