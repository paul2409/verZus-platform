// VERZUS M8.4 MODE REGISTRY AND QUERY POLICY
// VERZUS M8.10.2 TEN-ROW DEFAULT

import type {
  LeaderboardGame,
  LeaderboardMode,
  LeaderboardScope,
  LeaderboardSortKey,
} from "../../foundation/model/leaderboard-foundation.types";
import type {
  LeaderboardQueryState,
  LeaderboardSortDirection,
} from "../../explorer/model/leaderboard-query-state";
import type {
  LeaderboardModeColumn,
  LeaderboardModeComposition,
  LeaderboardModeMetricKey,
} from "./leaderboard-mode.types";

const allGames = ["all", "ea-fc", "cod-mobile", "clash-royale", "league"] as const;
const gameLanes = ["ea-fc", "cod-mobile", "clash-royale", "league"] as const;
const allScopes = ["global", "friends"] as const;
const globalScope = ["global"] as const;

function column(
  key: LeaderboardModeColumn["key"],
  label: string,
  alignment: LeaderboardModeColumn["alignment"] = "start",
): LeaderboardModeColumn {
  return { key, label, alignment };
}

function composition(input: LeaderboardModeComposition): LeaderboardModeComposition {
  return input;
}

export const leaderboardModeRegistry: Record<LeaderboardMode, LeaderboardModeComposition> = {
  weekly: composition({
    mode: "weekly",
    entityType: "player",
    rankingBasis: "Verified weekly points",
    identityLabel: "Player",
    affiliationLabel: "Crew",
    pointsLabel: "Weekly points",
    currentPositionLabel: "Your weekly rank",
    defaultGame: "all",
    allowedGames: allGames,
    defaultScope: "global",
    allowedScopes: allScopes,
    defaultSort: "rank",
    defaultDirection: "asc",
    desktopColumns: [
      column("rank", "Rank"),
      column("identity", "Player"),
      column("affiliation", "Crew"),
      column("record", "Record"),
      column("win-rate", "Win rate", "end"),
      column("streak", "Streak", "end"),
      column("trust", "Trust", "end"),
      column("recent-match", "Recent match"),
      column("points", "Weekly points", "end"),
    ],
    mobilePrimaryMetric: "points",
    mobileSecondaryMetrics: ["record", "win-rate"],
  }),
  pools: composition({
    mode: "pools",
    entityType: "pool",
    rankingBasis: "Pool points before advancement lock",
    identityLabel: "Pool",
    affiliationLabel: "Players",
    pointsLabel: "Pool points",
    currentPositionLabel: "Your pool position",
    defaultGame: "all",
    allowedGames: allGames,
    defaultScope: "global",
    allowedScopes: globalScope,
    defaultSort: "rank",
    defaultDirection: "asc",
    desktopColumns: [
      column("rank", "Rank"),
      column("identity", "Pool"),
      column("members", "Players", "end"),
      column("game", "Game lane"),
      column("record", "Record"),
      column("win-rate", "Avg. win rate", "end"),
      column("recent-match", "Recent match"),
      column("points", "Pool points", "end"),
    ],
    mobilePrimaryMetric: "points",
    mobileSecondaryMetrics: ["members", "game", "win-rate"],
  }),
  game: composition({
    mode: "game",
    entityType: "player",
    rankingBasis: "Verified points within one game lane",
    identityLabel: "Player",
    affiliationLabel: "Crew",
    pointsLabel: "Game points",
    currentPositionLabel: "Your game rank",
    defaultGame: "ea-fc",
    allowedGames: gameLanes,
    defaultScope: "global",
    allowedScopes: allScopes,
    defaultSort: "rank",
    defaultDirection: "asc",
    desktopColumns: [
      column("rank", "Rank"),
      column("identity", "Player"),
      column("affiliation", "Crew"),
      column("game", "Game"),
      column("record", "Record"),
      column("win-rate", "Win rate", "end"),
      column("streak", "Streak", "end"),
      column("recent-match", "Recent match"),
      column("points", "Game points", "end"),
    ],
    mobilePrimaryMetric: "points",
    mobileSecondaryMetrics: ["game", "record", "win-rate"],
  }),
  crew: composition({
    mode: "crew",
    entityType: "crew",
    rankingBasis: "Crew championship points",
    identityLabel: "Crew",
    affiliationLabel: "Members",
    pointsLabel: "Championship points",
    currentPositionLabel: "Your Crew rank",
    defaultGame: "all",
    allowedGames: ["all"],
    defaultScope: "global",
    allowedScopes: allScopes,
    defaultSort: "rank",
    defaultDirection: "asc",
    desktopColumns: [
      column("rank", "Rank"),
      column("identity", "Crew"),
      column("members", "Members", "end"),
      column("record", "Record"),
      column("win-rate", "Win rate", "end"),
      column("streak", "Streak", "end"),
      column("trust", "Trust", "end"),
      column("recent-match", "Recent match"),
      column("points", "Championship points", "end"),
    ],
    mobilePrimaryMetric: "points",
    mobileSecondaryMetrics: ["members", "record", "win-rate"],
  }),
  combine: composition({
    mode: "combine",
    entityType: "player",
    rankingBasis: "Normalized cross-game combine score",
    identityLabel: "Player",
    affiliationLabel: "Crew",
    pointsLabel: "Combine score",
    currentPositionLabel: "Your combine rank",
    defaultGame: "all",
    allowedGames: ["all"],
    defaultScope: "global",
    allowedScopes: allScopes,
    defaultSort: "rank",
    defaultDirection: "asc",
    desktopColumns: [
      column("rank", "Rank"),
      column("identity", "Player"),
      column("affiliation", "Crew"),
      column("game", "Coverage"),
      column("record", "Record"),
      column("win-rate", "Win rate", "end"),
      column("trust", "Trust", "end"),
      column("recent-match", "Recent match"),
      column("points", "Combine score", "end"),
    ],
    mobilePrimaryMetric: "points",
    mobileSecondaryMetrics: ["game", "win-rate", "trust"],
  }),
};

export function getLeaderboardModeComposition(mode: LeaderboardMode): LeaderboardModeComposition {
  return leaderboardModeRegistry[mode];
}

function allowed<T extends string>(value: T, values: readonly T[]): boolean {
  return values.includes(value);
}

export function normalizeLeaderboardQueryForMode(
  state: LeaderboardQueryState,
  modeComposition: LeaderboardModeComposition = getLeaderboardModeComposition(state.mode),
): LeaderboardQueryState {
  const game = allowed<LeaderboardGame>(state.game, modeComposition.allowedGames)
    ? state.game
    : modeComposition.defaultGame;
  const scope = allowed<LeaderboardScope>(state.scope, modeComposition.allowedScopes)
    ? state.scope
    : modeComposition.defaultScope;

  return {
    ...state,
    mode: modeComposition.mode,
    game,
    scope,
  };
}

export function getLeaderboardModeSwitchPatch(
  mode: LeaderboardMode,
): Partial<LeaderboardQueryState> {
  const modeComposition = getLeaderboardModeComposition(mode);
  return {
    mode,
    game: modeComposition.defaultGame,
    scope: modeComposition.defaultScope,
    sort: modeComposition.defaultSort,
    direction: modeComposition.defaultDirection,
    page: 1,
  };
}

export function getLeaderboardModeResetState(
  mode: LeaderboardMode,
  pageSize: LeaderboardQueryState["pageSize"],
): LeaderboardQueryState {
  const modeComposition = getLeaderboardModeComposition(mode);
  return {
    mode,
    game: modeComposition.defaultGame,
    scope: modeComposition.defaultScope,
    sort: modeComposition.defaultSort,
    direction: modeComposition.defaultDirection,
    search: "",
    page: 1,
    pageSize,
  };
}

export function hasActiveLeaderboardModeFilters(
  state: LeaderboardQueryState,
  modeComposition: LeaderboardModeComposition = getLeaderboardModeComposition(state.mode),
): boolean {
  return (
    state.game !== modeComposition.defaultGame ||
    state.scope !== modeComposition.defaultScope ||
    state.search.length > 0 ||
    state.sort !== modeComposition.defaultSort ||
    state.direction !== modeComposition.defaultDirection ||
    state.pageSize !== 10
  );
}

export function isLeaderboardModeMetricKey(value: string): value is LeaderboardModeMetricKey {
  return ["points", "record", "win-rate", "members", "game", "streak", "trust"].includes(
    value as LeaderboardModeMetricKey,
  );
}

export function isLeaderboardModeSortKey(value: string): value is LeaderboardSortKey {
  return ["rank", "points", "wins", "win-rate"].includes(value as LeaderboardSortKey);
}

export function isLeaderboardModeSortDirection(value: string): value is LeaderboardSortDirection {
  return value === "asc" || value === "desc";
}
