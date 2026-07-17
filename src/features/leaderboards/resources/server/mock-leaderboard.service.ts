// VERZUS M8.3 PURE MOCK LEADERBOARD RESOURCE SERVICE

import {
  buildLeaderboardPage,
  parseLeaderboardQueryState,
  type LeaderboardQueryState,
} from "../../explorer";
import { normalizeLeaderboardQueryForMode } from "../../modes/model/leaderboard-mode.registry";
import { getLeaderboardModeReadModel } from "../../modes/server/leaderboard-mode-read-model";
import type {
  LeaderboardFoundationRow,
  LeaderboardMode,
} from "../../foundation/model/leaderboard-foundation.types";
import type { LeaderboardResourceScenario } from "../model/leaderboard-resource.types";

export const leaderboardResourceNames = [
  "composition",
  "summary",
  "entries",
  "current-position",
  "rewards",
  "status",
] as const;

export type LeaderboardResourceName = (typeof leaderboardResourceNames)[number];

export type MockLeaderboardResult = {
  status: number;
  body: unknown;
};

function requestId(resource: LeaderboardResourceName): string {
  return `mock-leaderboard-${resource}-${globalThis.crypto.randomUUID()}`;
}

function meta(scenario: LeaderboardResourceScenario, now: Date) {
  const freshness = scenario === "stale" ? "stale" : "fresh";
  return {
    server_now: now.toISOString(),
    last_updated_at: new Date(
      now.getTime() - (freshness === "stale" ? 20 * 60_000 : 2 * 60_000),
    ).toISOString(),
    freshness,
  } as const;
}

function rawRow(row: LeaderboardFoundationRow) {
  return {
    leaderboard_entry_id: row.id,
    rank: row.rank,
    previous_rank: row.previousRank,
    movement: row.movement,
    movement_delta: row.movementDelta,
    entity_type: row.entityType,
    display_name: row.name,
    handle: row.handle,
    initials: row.initials,
    crew_name: row.crewName,
    country_code: row.countryCode,
    game: row.game,
    scope: row.scope,
    wins: row.wins,
    losses: row.losses,
    win_rate: row.winRate,
    points: row.points,
    streak: row.streak,
    trust: row.trust,
    tier: row.tier,
    member_count: row.memberCount,
    is_current_user: row.isCurrentUser,
  };
}

function success(
  resource: LeaderboardResourceName,
  scenario: LeaderboardResourceScenario,
  data: unknown,
  now: Date,
): MockLeaderboardResult {
  return {
    status: 200,
    body: {
      ok: true,
      data,
      request_id: requestId(resource),
      meta: meta(scenario, now),
    },
  };
}

function failure(
  resource: LeaderboardResourceName,
  scenario: "error" | "offline" | "unauthorized",
): MockLeaderboardResult {
  const unauthorized = scenario === "unauthorized";
  const offline = scenario === "offline";
  return {
    status: unauthorized ? 401 : 503,
    body: {
      ok: false,
      error: {
        code: unauthorized
          ? "leaderboard_unauthorized"
          : offline
            ? "offline"
            : `leaderboard_${resource.replace("-", "_")}_unavailable`,
        message: unauthorized
          ? "Authentication is required to view this leaderboard resource."
          : offline
            ? "The leaderboard resource is unavailable while offline."
            : `The leaderboard ${resource} resource is temporarily unavailable.`,
        request_id: requestId(resource),
        retryable: !unauthorized,
        field_errors: {},
      },
    },
  };
}

function malformed(resource: LeaderboardResourceName, now: Date): MockLeaderboardResult {
  return {
    status: 200,
    body: {
      ok: true,
      data: { malformed_resource: resource },
      request_id: requestId(resource),
      meta: meta("normal", now),
    },
  };
}

function queryState(mode: LeaderboardMode, params: URLSearchParams): LeaderboardQueryState {
  return { ...parseLeaderboardQueryState(params), mode };
}

export function getMockLeaderboardResource(
  mode: LeaderboardMode,
  resource: LeaderboardResourceName,
  params: URLSearchParams,
  scenario: LeaderboardResourceScenario = "normal",
  now: Date = new Date(),
): MockLeaderboardResult {
  if (scenario === "error" || scenario === "offline" || scenario === "unauthorized") {
    return failure(resource, scenario);
  }
  if (scenario === "malformed") return malformed(resource, now);

  // VERZUS M8.4 MODE READ MODEL COMPOSITION
  const { board, composition } = getLeaderboardModeReadModel(mode);

  switch (resource) {
    case "composition":
      return success(
        resource,
        scenario,
        {
          mode: composition.mode,
          entity_type: composition.entityType,
          ranking_basis: composition.rankingBasis,
          identity_label: composition.identityLabel,
          affiliation_label: composition.affiliationLabel,
          points_label: composition.pointsLabel,
          current_position_label: composition.currentPositionLabel,
          default_game: composition.defaultGame,
          allowed_games: composition.allowedGames,
          default_scope: composition.defaultScope,
          allowed_scopes: composition.allowedScopes,
          default_sort: composition.defaultSort,
          default_direction: composition.defaultDirection,
          desktop_columns: composition.desktopColumns.map((column) => ({
            key: column.key,
            label: column.label,
            alignment: column.alignment,
          })),
          mobile_primary_metric: composition.mobilePrimaryMetric,
          mobile_secondary_metrics: composition.mobileSecondaryMetrics,
        },
        now,
      );

    case "summary":
      return success(
        resource,
        scenario,
        {
          mode,
          eyebrow: board.eyebrow,
          title: board.title,
          description: board.description,
          period_label: board.periodLabel,
          countdown_label: board.countdownLabel,
          total_competitors: board.totalCompetitors,
          percentile_label: board.percentileLabel,
        },
        now,
      );

    case "entries": {
      const rows = scenario === "empty" ? [] : board.rows;
      const state = normalizeLeaderboardQueryForMode(queryState(mode, params), composition);
      const page = buildLeaderboardPage(rows, state);
      const items = page.rows.map(rawRow);
      // VERZUS M8.6 MALFORMED ROW SCENARIO
      if (scenario === "malformed-row" && items.length > 1) {
        items[1] = { ...items[1], rank: "invalid-rank" } as never;
      }
      return success(
        resource,
        scenario,
        {
          items,
          page: page.page,
          page_count: page.totalPages,
          total: page.filteredCount,
          start_index: page.startIndex,
          end_index: page.endIndex,
          has_previous_page: page.page > 1,
          has_next_page: page.page < page.totalPages,
        },
        now,
      );
    }

    case "current-position":
      return success(
        resource,
        scenario,
        { entry: scenario === "empty" ? null : rawRow(board.currentEntry) },
        now,
      );

    case "rewards":
      return success(
        resource,
        scenario,
        {
          items:
            scenario === "empty"
              ? []
              : board.rewards.map((reward) => ({
                  rank_label: reward.rankLabel,
                  xp: reward.xp,
                  cash_label: reward.cashLabel,
                })),
        },
        now,
      );

    case "status": {
      const resourceMeta = meta(scenario, now);
      return success(
        resource,
        scenario,
        {
          mode,
          freshness: resourceMeta.freshness,
          last_updated_at: resourceMeta.last_updated_at,
          next_refresh_at: new Date(now.getTime() + 30_000).toISOString(),
          source: "mock-leaderboard",
        },
        now,
      );
    }
  }
}
