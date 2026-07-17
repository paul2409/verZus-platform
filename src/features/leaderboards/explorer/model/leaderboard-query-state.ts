// VERZUS M8.2 LEADERBOARD QUERY-STRING STATE
// VERZUS M8.10.2 TEN-ROW DEFAULT

import {
  leaderboardModes,
  type LeaderboardGame,
  type LeaderboardMode,
  type LeaderboardScope,
  type LeaderboardSortKey,
} from "../../foundation/model/leaderboard-foundation.types";

export const leaderboardSortDirections = ["asc", "desc"] as const;
export const leaderboardPageSizes = [3, 5, 10] as const;

export type LeaderboardSortDirection = (typeof leaderboardSortDirections)[number];
export type LeaderboardPageSize = (typeof leaderboardPageSizes)[number];

export type LeaderboardQueryState = {
  mode: LeaderboardMode;
  game: LeaderboardGame;
  scope: LeaderboardScope;
  sort: LeaderboardSortKey;
  direction: LeaderboardSortDirection;
  search: string;
  page: number;
  pageSize: LeaderboardPageSize;
};

export type LeaderboardQueryInput =
  URLSearchParams | Readonly<Record<string, string | string[] | undefined>>;

export const defaultLeaderboardQueryState: LeaderboardQueryState = {
  mode: "weekly",
  game: "all",
  scope: "global",
  sort: "rank",
  direction: "asc",
  search: "",
  page: 1,
  pageSize: 10,
};

const games = ["all", "ea-fc", "cod-mobile", "clash-royale", "league"] as const;
const scopes = ["global", "friends"] as const;
const sorts = ["rank", "points", "wins", "win-rate"] as const;

function isOneOf<T extends string>(value: string | undefined, values: readonly T[]): value is T {
  return value !== undefined && values.includes(value as T);
}

function readValue(input: LeaderboardQueryInput, key: string): string | undefined {
  if (input instanceof URLSearchParams) return input.get(key) ?? undefined;
  const value = input[key];
  return Array.isArray(value) ? value[0] : value;
}

function parsePositiveInteger(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function parsePageSize(value: string | undefined): LeaderboardPageSize {
  const parsed = parsePositiveInteger(value, defaultLeaderboardQueryState.pageSize);
  return leaderboardPageSizes.includes(parsed as LeaderboardPageSize)
    ? (parsed as LeaderboardPageSize)
    : defaultLeaderboardQueryState.pageSize;
}

export function normalizeLeaderboardSearch(value: string | undefined): string {
  return (value ?? "").trim().replace(/\s+/g, " ").slice(0, 80);
}

export function parseLeaderboardQueryState(input: LeaderboardQueryInput): LeaderboardQueryState {
  const modeValue = readValue(input, "mode");
  const gameValue = readValue(input, "game");
  const scopeValue = readValue(input, "scope");
  const sortValue = readValue(input, "sort");
  const directionValue = readValue(input, "direction");

  return {
    mode: isOneOf(modeValue, leaderboardModes) ? modeValue : defaultLeaderboardQueryState.mode,
    game: isOneOf(gameValue, games) ? gameValue : defaultLeaderboardQueryState.game,
    scope: isOneOf(scopeValue, scopes) ? scopeValue : defaultLeaderboardQueryState.scope,
    sort: isOneOf(sortValue, sorts) ? sortValue : defaultLeaderboardQueryState.sort,
    direction: isOneOf(directionValue, leaderboardSortDirections)
      ? directionValue
      : defaultLeaderboardQueryState.direction,
    search: normalizeLeaderboardSearch(readValue(input, "q")),
    page: parsePositiveInteger(readValue(input, "page"), defaultLeaderboardQueryState.page),
    pageSize: parsePageSize(readValue(input, "size")),
  };
}

export function serializeLeaderboardQueryState(state: LeaderboardQueryState): URLSearchParams {
  const params = new URLSearchParams();

  if (state.mode !== defaultLeaderboardQueryState.mode) params.set("mode", state.mode);
  if (state.game !== defaultLeaderboardQueryState.game) params.set("game", state.game);
  if (state.scope !== defaultLeaderboardQueryState.scope) params.set("scope", state.scope);
  if (state.sort !== defaultLeaderboardQueryState.sort) params.set("sort", state.sort);
  if (state.direction !== defaultLeaderboardQueryState.direction) {
    params.set("direction", state.direction);
  }
  if (state.search) params.set("q", normalizeLeaderboardSearch(state.search));
  if (state.page !== defaultLeaderboardQueryState.page) params.set("page", String(state.page));
  if (state.pageSize !== defaultLeaderboardQueryState.pageSize) {
    params.set("size", String(state.pageSize));
  }

  return params;
}

export function patchLeaderboardQueryState(
  current: LeaderboardQueryState,
  patch: Partial<LeaderboardQueryState>,
): LeaderboardQueryState {
  return parseLeaderboardQueryState(
    serializeLeaderboardQueryState({
      ...current,
      ...patch,
      search: normalizeLeaderboardSearch(patch.search ?? current.search),
    }),
  );
}

export function hasActiveLeaderboardFilters(state: LeaderboardQueryState): boolean {
  return (
    state.game !== "all" ||
    state.scope !== "global" ||
    state.search.length > 0 ||
    state.sort !== "rank" ||
    state.direction !== "asc" ||
    state.pageSize !== 10
  );
}
