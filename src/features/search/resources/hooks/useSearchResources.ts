// VERZUS M12.6 RELIABILITY EDGE STATES
// VERZUS M12.2 INDEPENDENT SEARCH RESOURCE HOOKS

"use client";

import { useQuery } from "@tanstack/react-query";

import type { SearchDomain, SearchEntityDomain } from "../../foundation";
import { SearchResourceError } from "../adapter/search-resource.adapter";
import { classifyResourceFailure } from "@/lib/reliability/resource-reliability";
import { searchResourceQueryOptions } from "../api/search-resource.query";
import type {
  SearchResourceHealth,
  SearchResourceResult,
  SearchResourceScenario,
} from "../model/search-resource.types";

const domains: readonly SearchEntityDomain[] = ["players", "crews", "competitions", "matches"];

type ScenarioMap = Record<SearchEntityDomain, SearchResourceScenario>;

function healthFor(
  domain: SearchEntityDomain,
  enabled: boolean,
  query: {
    isPending: boolean;
    isFetching: boolean;
    isError: boolean;
    error: Error | null;
    data:
      | {
          items: unknown[];
          meta: { requestId: string; freshness: "fresh" | "stale" };
        }
      | undefined;
  },
): SearchResourceHealth {
  if (!enabled) {
    return { domain, state: "idle", code: null, message: null, requestId: null, retryable: false };
  }
  if (query.isPending && !query.data) {
    return { domain, state: "loading", code: null, message: null, requestId: null, retryable: true };
  }
  if (query.isError) {
    const error = query.error;
    const known = error instanceof SearchResourceError ? error : null;
    const descriptor = classifyResourceFailure({
      resourceLabel: `${domain} Search`,
      code: known?.code,
      message: known?.message ?? error?.message,
      requestId: known?.requestId,
      retryable: known?.retryable,
      status: known?.status,
    });
    return {
      domain,
      state: descriptor.state,
      code: known?.code ?? "SEARCH_RESOURCE_UNKNOWN",
      message: descriptor.message,
      requestId: descriptor.requestId,
      retryable: descriptor.retryable,
    };
  }
  if (query.isFetching && query.data) {
    return {
      domain,
      state: "retrying",
      code: null,
      message: "Refreshing while confirmed results remain visible.",
      requestId: query.data.meta.requestId,
      retryable: false,
    };
  }
  if (!query.data?.items.length) {
    return {
      domain,
      state: "empty",
      code: null,
      message: null,
      requestId: query.data?.meta.requestId ?? null,
      retryable: true,
    };
  }
  return {
    domain,
    state: query.data.meta.freshness === "stale" ? "stale" : "success",
    code: null,
    message: null,
    requestId: query.data.meta.requestId,
    retryable: true,
  };
}

export function useSearchResources(input: {
  query: string;
  activeDomain: SearchDomain;
  scenarios: ScenarioMap;
  limit: number;
}) {
  const normalizedQuery = input.query.trim();
  const queryEnabled = normalizedQuery.length >= 2;
  const enabledFor = (domain: SearchEntityDomain) =>
    queryEnabled && (input.activeDomain === "all" || input.activeDomain === domain);

  const players = useQuery(
    searchResourceQueryOptions({
      domain: "players",
      query: normalizedQuery,
      limit: input.limit,
      scenario: input.scenarios.players,
      enabled: enabledFor("players"),
    }),
  );
  const crews = useQuery(
    searchResourceQueryOptions({
      domain: "crews",
      query: normalizedQuery,
      limit: input.limit,
      scenario: input.scenarios.crews,
      enabled: enabledFor("crews"),
    }),
  );
  const competitions = useQuery(
    searchResourceQueryOptions({
      domain: "competitions",
      query: normalizedQuery,
      limit: input.limit,
      scenario: input.scenarios.competitions,
      enabled: enabledFor("competitions"),
    }),
  );
  const matches = useQuery(
    searchResourceQueryOptions({
      domain: "matches",
      query: normalizedQuery,
      limit: input.limit,
      scenario: input.scenarios.matches,
      enabled: enabledFor("matches"),
    }),
  );

  const queryMap = { players, crews, competitions, matches } as const;
  const results = {} as Record<SearchEntityDomain, SearchResourceResult>;

  for (const domain of domains) {
    const resource = queryMap[domain];
    results[domain] = {
      domain,
      items: resource.data?.items ?? [],
      health: healthFor(domain, enabledFor(domain), resource),
      retry: async () => {
        await resource.refetch();
      },
    };
  }

  const enabledDomains = domains.filter(enabledFor);
  const items = enabledDomains.flatMap((domain) => results[domain].items);
  const hasFailure = enabledDomains.some((domain) =>
    ["error", "offline", "unauthorized", "forbidden", "not-found", "maintenance", "schema-invalid", "partial-failure"].includes(results[domain].health.state),
  );
  const isLoading = enabledDomains.some((domain) => results[domain].health.state === "loading");
  const isFetching = enabledDomains.some((domain) => results[domain].health.state === "retrying");
  const isSettled = enabledDomains.every((domain) =>
    ["success", "empty", "stale", "error", "offline", "unauthorized", "forbidden", "not-found", "maintenance", "schema-invalid", "partial-failure"].includes(results[domain].health.state),
  );

  return { results, enabledDomains, items, hasFailure, isLoading, isFetching, isSettled };
}
