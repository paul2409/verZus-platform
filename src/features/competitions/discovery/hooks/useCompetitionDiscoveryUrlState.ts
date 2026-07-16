"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { competitionDiscoveryScenarioSchema } from "../model/competition-discovery.schema";
import {
  defaultCompetitionDiscoveryFilters,
  hasActiveCompetitionDiscoveryFilters,
  parseCompetitionDiscoverySearchParams,
  serializeCompetitionDiscoverySearchParams,
} from "../model/competition-discovery.query";
import type {
  CompetitionDiscoveryEntryFee,
  CompetitionDiscoveryFilters,
  CompetitionDiscoveryGame,
  CompetitionDiscoveryScenario,
  CompetitionDiscoverySort,
  CompetitionDiscoveryTab,
  CompetitionDiscoveryTeamSize,
} from "../model/competition-discovery.types";

const SEARCH_DEBOUNCE_MS = 300;

function readScenario(params: URLSearchParams): CompetitionDiscoveryScenario {
  const parsed = competitionDiscoveryScenarioSchema.safeParse(params.get("scenario"));
  return parsed.success ? parsed.data : "normal";
}

export function useCompetitionDiscoveryUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialParams = useMemo(() => new URLSearchParams(searchParams.toString()), [searchParams]);
  const initialFilters = useMemo(
    () => parseCompetitionDiscoverySearchParams(initialParams),
    [initialParams],
  );
  const scenario = useMemo(() => readScenario(initialParams), [initialParams]);
  const [filters, setFilters] = useState<CompetitionDiscoveryFilters>(initialFilters);
  const [searchInput, setSearchInput] = useState(initialFilters.search);

  const replaceUrl = useCallback(
    (next: CompetitionDiscoveryFilters) => {
      const query = serializeCompetitionDiscoverySearchParams(next);
      if (scenario !== "normal") query.set("scenario", scenario);
      router.replace(query.size > 0 ? `${pathname}?${query.toString()}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, scenario],
  );

  const commit = useCallback(
    (patch: Partial<CompetitionDiscoveryFilters>) => {
      setFilters((current) => {
        const next = { ...current, ...patch };
        replaceUrl(next);
        return next;
      });
    },
    [replaceUrl],
  );

  useEffect(() => {
    const restoreFromBrowserHistory = () => {
      const next = parseCompetitionDiscoverySearchParams(
        new URLSearchParams(window.location.search),
      );
      setFilters(next);
      setSearchInput(next.search);
    };

    window.addEventListener("popstate", restoreFromBrowserHistory);
    return () => window.removeEventListener("popstate", restoreFromBrowserHistory);
  }, []);

  useEffect(() => {
    if (searchInput.trim() === filters.search.trim()) return;
    const timer = window.setTimeout(() => {
      commit({ search: searchInput.trim(), page: 1 });
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [commit, filters.search, searchInput]);

  const setTab = useCallback((tab: CompetitionDiscoveryTab) => commit({ tab, page: 1 }), [commit]);
  const setGame = useCallback(
    (game: CompetitionDiscoveryGame) => commit({ game, page: 1 }),
    [commit],
  );
  const setTeamSize = useCallback(
    (teamSize: CompetitionDiscoveryTeamSize) => commit({ teamSize, page: 1 }),
    [commit],
  );
  const setEntryFee = useCallback(
    (entryFee: CompetitionDiscoveryEntryFee) => commit({ entryFee, page: 1 }),
    [commit],
  );
  const setSort = useCallback(
    (sort: CompetitionDiscoverySort) => commit({ sort, page: 1 }),
    [commit],
  );
  const setPage = useCallback((page: number) => commit({ page }), [commit]);

  const clearFilters = useCallback(() => {
    setSearchInput("");
    setFilters(defaultCompetitionDiscoveryFilters);
    replaceUrl(defaultCompetitionDiscoveryFilters);
  }, [replaceUrl]);

  return {
    filters,
    scenario,
    searchInput,
    isSearchPending: searchInput.trim() !== filters.search.trim(),
    isFiltered: hasActiveCompetitionDiscoveryFilters(filters),
    setSearchInput,
    setTab,
    setGame,
    setTeamSize,
    setEntryFee,
    setSort,
    setPage,
    clearFilters,
  };
}
