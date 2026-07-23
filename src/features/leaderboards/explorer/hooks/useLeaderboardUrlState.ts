"use client";

// VERZUS M8.2 LEADERBOARD URL HISTORY SYNCHRONIZATION

import { useCallback, useEffect, useRef, useState } from "react";

import { readSmartDefaults, rememberSmartDefaults } from "@/shared/composition/smart-defaults";

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

function hasInputValue(input: LeaderboardQueryInput, key: string): boolean {
  if (input instanceof URLSearchParams) return input.has(key);
  const value = input[key];
  return Array.isArray(value) ? Boolean(value[0]) : Boolean(value);
}

export function useLeaderboardUrlState(initialInput: LeaderboardQueryInput) {
  const [state, setState] = useState<LeaderboardQueryState>(() =>
    parseLeaderboardQueryState(initialInput),
  );
  const explicitDefaults = useRef({
    mode: hasInputValue(initialInput, "mode"),
    game: hasInputValue(initialInput, "game"),
  });
  const requestedDefaults = useRef(false);

  useEffect(() => {
    if (requestedDefaults.current) return;
    requestedDefaults.current = true;

    void readSmartDefaults()
      .then((defaults) => {
        setState((current) => {
          const next = patchLeaderboardQueryState(current, {
            mode:
              !explicitDefaults.current.mode && current.mode === "weekly"
                ? defaults.leaderboard.mode
                : current.mode,
            game:
              !explicitDefaults.current.game && current.game === "all"
                ? defaults.leaderboard.game
                : current.game,
          });

          if (next.mode === current.mode && next.game === current.game) return current;
          updateBrowserUrl(next, "replace");
          return next;
        });
      })
      .catch(() => undefined);
  }, []);

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

      if (patch.mode !== undefined || patch.game !== undefined) {
        if (patch.mode !== undefined) explicitDefaults.current.mode = true;
        if (patch.game !== undefined) explicitDefaults.current.game = true;
        void rememberSmartDefaults({
          leaderboardMode: patch.mode,
          leaderboardGame: patch.game,
        }).catch(() => undefined);
      }
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
