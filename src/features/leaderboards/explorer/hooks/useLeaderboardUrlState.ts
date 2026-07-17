"use client";

// VERZUS M8.2 LEADERBOARD URL HISTORY SYNCHRONIZATION

import { useCallback, useEffect, useState } from "react";

import {
  parseLeaderboardQueryState,
  patchLeaderboardQueryState,
  serializeLeaderboardQueryState,
  type LeaderboardQueryInput,
  type LeaderboardQueryState,
} from "../model/leaderboard-query-state";

export type LeaderboardHistoryMode = "push" | "replace";

function updateBrowserUrl(state: LeaderboardQueryState, historyMode: LeaderboardHistoryMode): void {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  url.search = serializeLeaderboardQueryState(state).toString();
  const nextUrl = `${url.pathname}${url.search}${url.hash}`;

  if (historyMode === "push") {
    window.history.pushState(null, "", nextUrl);
  } else {
    window.history.replaceState(null, "", nextUrl);
  }
}

export function useLeaderboardUrlState(initialInput: LeaderboardQueryInput) {
  const [state, setState] = useState<LeaderboardQueryState>(() =>
    parseLeaderboardQueryState(initialInput),
  );

  useEffect(() => {
    const handlePopState = () => {
      setState(parseLeaderboardQueryState(new URLSearchParams(window.location.search)));
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const update = useCallback(
    (patch: Partial<LeaderboardQueryState>, historyMode: LeaderboardHistoryMode = "push") => {
      setState((current) => {
        const next = patchLeaderboardQueryState(current, patch);
        updateBrowserUrl(next, historyMode);
        return next;
      });
    },
    [],
  );

  const replace = useCallback((next: LeaderboardQueryState) => {
    const normalized = parseLeaderboardQueryState(serializeLeaderboardQueryState(next));
    updateBrowserUrl(normalized, "replace");
    setState(normalized);
  }, []);

  return { state, update, replace };
}

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [delayMs, value]);

  return debounced;
}
