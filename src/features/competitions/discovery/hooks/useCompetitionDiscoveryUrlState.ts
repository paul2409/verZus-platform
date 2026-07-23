"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { readSmartDefaults, rememberSmartDefaults } from "@/shared/composition/smart-defaults";

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
  CompetitionDiscoverySort,
  CompetitionDiscoveryTab,
  CompetitionDiscoveryTeamSize,
} from "../model/competition-discovery.types";

const SEARCH_DEBOUNCE_MS = 300;

export function useCompetitionDiscoveryUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialParams = useMemo(() => new URLSearchParams(searchParams.toString()), [searchParams]);
  const initialFilters = useMemo(
    () => parseCompetitionDiscoverySearchParams(initialParams),
    [initialParams],
  );
  const [filters, setFilters] = useState<CompetitionDiscoveryFilters>(initialFilters);
  const [searchInput, setSearchInput] = useState(initialFilters.search);
  const explicitDefaults = useRef({
    game: initialParams.has("game"),
    sort: initialParams.has("sort"),
  });
  const requestedDefaults = useRef(false);

  const replaceUrl = useCallback(
    (next: CompetitionDiscoveryFilters) => {
      const query = serializeCompetitionDiscoverySearchParams(next);
      router.replace(query.size > 0 ? `${pathname}?${query.toString()}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router],
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
    if (requestedDefaults.current) return;
    requestedDefaults.current = true;

    void readSmartDefaults()
      .then((defaults) => {
        setFilters((current) => {
          const next: CompetitionDiscoveryFilters = {
            ...current,
            game:
              !explicitDefaults.current.game && current.game === "all"
                ? defaults.competition.game
                : current.game,
            sort:
              !explicitDefaults.current.sort && current.sort === "starts-soon"
                ? defaults.competition.sort
                : current.sort,
            page: 1,
          };

          if (next.game === current.game && next.sort === current.sort) return current;
          replaceUrl(next);
          return next;
        });
      })
      .catch(() => undefined);
  }, [replaceUrl]);

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
    (game: CompetitionDiscoveryGame) => {
      explicitDefaults.current.game = true;
      commit({ game, page: 1 });
      void rememberSmartDefaults({ competitionGame: game }).catch(() => undefined);
    },
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
    (sort: CompetitionDiscoverySort) => {
      explicitDefaults.current.sort = true;
      commit({ sort, page: 1 });
      void rememberSmartDefaults({ competitionSort: sort }).catch(() => undefined);
    },
    [commit],
  );
  const setPage = useCallback((page: number) => commit({ page }), [commit]);

  const clearFilters = useCallback(() => {
    explicitDefaults.current.game = true;
    explicitDefaults.current.sort = true;
    setSearchInput("");
    setFilters(defaultCompetitionDiscoveryFilters);
    replaceUrl(defaultCompetitionDiscoveryFilters);
    void rememberSmartDefaults({
      competitionGame: "all",
      competitionSort: "starts-soon",
    }).catch(() => undefined);
  }, [replaceUrl]);

  return {
    filters,
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
