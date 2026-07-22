import "server-only";

import { randomUUID } from "node:crypto";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { QueryResultRow } from "pg";

import { getServerAuthSession } from "@/features/auth/server/auth-session.server";
import {
  leaderboardModes,
  type LeaderboardMode,
} from "@/features/leaderboards/foundation/model/leaderboard-foundation.types";
import { getLeaderboardModeComposition } from "@/features/leaderboards/modes/model/leaderboard-mode.registry";
import { queryDatabase } from "@/lib/db";

export type ProductionLeaderboardResource =
  | "composition"
  | "summary"
  | "entries"
  | "current-position"
  | "rewards"
  | "status"
  | "updates";

type AggregateRow = QueryResultRow & {
  user_id: string;
  display_name: string;
  handle: string;
  country_code: string | null;
  game_filter: string;
  wins: string | number;
  losses: string | number;
  draws: string | number;
  points: string | number;
  trust_score: string | number;
  current_streak: string | number;
  last_result_at: Date | null;
};

type RawRow = {
  leaderboard_entry_id: string;
  rank: number;
  previous_rank: number | null;
  movement: "up" | "down" | "same" | "new";
  movement_delta: number | null;
  entity_type: "player" | "pool" | "crew";
  display_name: string;
  handle: string;
  initials: string;
  crew_name: string | null;
  country_code: string;
  game: "ea-fc" | "cod-mobile" | "clash-royale" | "league";
  scope: "global" | "friends";
  wins: number;
  losses: number;
  win_rate: number;
  points: number;
  streak: number;
  trust: number;
  tier: "champion" | "diamond" | "platinum" | "gold" | "silver" | "bronze";
  member_count: number | null;
  is_current_user: boolean;
};

async function actorId(): Promise<string> {
  const session = await getServerAuthSession();
  if (session.state !== "authenticated" || !session.user) {
    throw Object.assign(new Error("Authentication is required."), {
      status: 401,
      code: "leaderboard_unauthorized",
      retryable: false,
    });
  }
  return session.user.id;
}

function isMode(value: string): value is LeaderboardMode {
  return leaderboardModes.includes(value as LeaderboardMode);
}

function headers(requestId: string) {
  return {
    "Cache-Control": "no-store, max-age=0",
    "X-Request-ID": requestId,
    "X-Verzus-Resource": "leaderboard-api",
  };
}

function failure(requestId: string, error: unknown): NextResponse {
  const value = error as { status?: number; code?: string; message?: string; retryable?: boolean };
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: value.code ?? "leaderboard_internal_error",
        message: value.message ?? "The leaderboard resource could not be loaded.",
        request_id: requestId,
        retryable: value.retryable ?? true,
        field_errors: {},
      },
    },
    { status: value.status ?? 500, headers: headers(requestId) },
  );
}

function meta(now = new Date()) {
  return {
    server_now: now.toISOString(),
    last_updated_at: now.toISOString(),
    freshness: "fresh" as const,
  };
}

function gameForApi(value: string): RawRow["game"] {
  return value === "league-of-legends" ? "league" : (value as RawRow["game"]);
}

function databaseGame(value: string | null): string | null {
  if (!value || value === "all") return null;
  return value === "league" ? "league-of-legends" : value;
}

function initials(name: string): string {
  const value = name
    .split(/\s+/u)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  return value || "P";
}

function tier(points: number): RawRow["tier"] {
  if (points >= 1500) return "champion";
  if (points >= 1000) return "diamond";
  if (points >= 700) return "platinum";
  if (points >= 400) return "gold";
  if (points >= 150) return "silver";
  return "bronze";
}

async function aggregateRows(
  mode: LeaderboardMode,
  currentUserId: string,
  requestedGame: string | null,
): Promise<RawRow[]> {
  if (mode === "crew" || mode === "pools") return [];
  const gameFilter = mode === "game" ? databaseGame(requestedGame) ?? "ea-fc" : null;
  const weekly = mode === "weekly";
  const result = await queryDatabase<AggregateRow>(
    `
      WITH outcomes AS (
        SELECT
          participant.user_id,
          game.filter_value AS game_filter,
          result_record.confirmed_at AS result_at,
          CASE
            WHEN participant.side = 'home' AND result_record.home_score > result_record.away_score THEN 1
            WHEN participant.side = 'away' AND result_record.away_score > result_record.home_score THEN 1
            ELSE 0
          END AS won,
          CASE
            WHEN participant.side = 'home' AND result_record.home_score < result_record.away_score THEN 1
            WHEN participant.side = 'away' AND result_record.away_score < result_record.home_score THEN 1
            ELSE 0
          END AS lost,
          CASE WHEN result_record.home_score = result_record.away_score THEN 1 ELSE 0 END AS drew
        FROM match_results AS result_record
        JOIN matches AS match_record ON match_record.id = result_record.match_id
        JOIN match_participants AS participant ON participant.match_id = match_record.id
        JOIN games AS game ON game.id = match_record.game_id
        WHERE result_record.status = 'confirmed'
          AND ($1::boolean = false OR result_record.confirmed_at >= date_trunc('week', now()))
          AND ($2::text IS NULL OR game.filter_value = $2)
      )
      SELECT
        outcomes.user_id,
        COALESCE(NULLIF(profile.display_name, ''), user_account.gamer_tag) AS display_name,
        COALESCE(NULLIF(profile.handle, ''), '@' || user_account.normalized_gamer_tag) AS handle,
        profile.country_code,
        CASE WHEN $3::text = 'combine' THEN 'ea-fc' ELSE MIN(outcomes.game_filter) END AS game_filter,
        SUM(outcomes.won) AS wins,
        SUM(outcomes.lost) AS losses,
        SUM(outcomes.drew) AS draws,
        SUM(outcomes.won * 3 + outcomes.drew) AS points,
        COALESCE(summary.trust_score, 0) AS trust_score,
        COALESCE(summary.current_streak, 0) AS current_streak,
        MAX(outcomes.result_at) AS last_result_at
      FROM outcomes
      JOIN users AS user_account ON user_account.id = outcomes.user_id
      LEFT JOIN player_profiles AS profile ON profile.user_id = outcomes.user_id
      LEFT JOIN player_competitive_summaries AS summary ON summary.user_id = outcomes.user_id
      GROUP BY outcomes.user_id, profile.display_name, profile.handle, profile.country_code,
               user_account.gamer_tag, user_account.normalized_gamer_tag,
               summary.trust_score, summary.current_streak
      ORDER BY points DESC, wins DESC, losses ASC, outcomes.user_id ASC
    `,
    [weekly, gameFilter, mode],
  );

  return result.rows.map((row, index) => {
    const wins = Number(row.wins);
    const losses = Number(row.losses);
    const draws = Number(row.draws);
    const points = Number(row.points);
    const played = wins + losses + draws;
    return {
      leaderboard_entry_id: `${mode}:${row.user_id}`,
      rank: index + 1,
      previous_rank: null,
      movement: "new",
      movement_delta: null,
      entity_type: "player",
      display_name: row.display_name,
      handle: row.handle,
      initials: initials(row.display_name),
      crew_name: null,
      country_code: (row.country_code?.trim() || "NGA").slice(0, 3).toUpperCase(),
      game: gameForApi(row.game_filter),
      scope: "global",
      wins,
      losses,
      win_rate: played === 0 ? 0 : Number(((wins / played) * 100).toFixed(2)),
      points,
      streak: Math.max(0, Number(row.current_streak)),
      trust: Number(row.trust_score),
      tier: tier(points),
      member_count: null,
      is_current_user: row.user_id === currentUserId,
    };
  });
}

function applyEntriesQuery(rows: RawRow[], request: NextRequest) {
  const search = request.nextUrl.searchParams.get("search")?.trim().toLowerCase() ?? "";
  const sort = request.nextUrl.searchParams.get("sort") ?? "rank";
  const direction = request.nextUrl.searchParams.get("direction") === "desc" ? "desc" : "asc";
  const page = Math.max(1, Number(request.nextUrl.searchParams.get("page") ?? 1) || 1);
  const pageSize = Math.min(50, Math.max(5, Number(request.nextUrl.searchParams.get("pageSize") ?? 10) || 10));
  const filtered = search
    ? rows.filter((row) =>
        `${row.display_name} ${row.handle}`.toLowerCase().includes(search),
      )
    : rows;
  const sorted = [...filtered].sort((left, right) => {
    const difference =
      sort === "points"
        ? left.points - right.points
        : sort === "wins"
          ? left.wins - right.wins
          : sort === "win-rate"
            ? left.win_rate - right.win_rate
            : left.rank - right.rank;
    return direction === "desc" ? -difference : difference;
  });
  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const offset = (currentPage - 1) * pageSize;
  const items = sorted.slice(offset, offset + pageSize);
  return {
    items,
    page: currentPage,
    page_count: pageCount,
    total: sorted.length,
    start_index: items.length ? offset + 1 : 0,
    end_index: items.length ? offset + items.length : 0,
    has_previous_page: currentPage > 1,
    has_next_page: currentPage < pageCount,
  };
}

function summaryFor(mode: LeaderboardMode, total: number) {
  const labels: Record<LeaderboardMode, { eyebrow: string; title: string; description: string }> = {
    weekly: {
      eyebrow: "WEEKLY STANDINGS",
      title: "Weekly player leaderboard",
      description: "Verified results completed during the current UTC week.",
    },
    pools: {
      eyebrow: "POOL STANDINGS",
      title: "Pool leaderboard",
      description: "Pool rankings become available when pool operations are enabled.",
    },
    game: {
      eyebrow: "GAME LANE",
      title: "Game rankings",
      description: "Verified results within the selected game lane.",
    },
    crew: {
      eyebrow: "CREW CHAMPIONSHIP",
      title: "Crew leaderboard",
      description: "Crew rankings become available after the Crew persistence cutover.",
    },
    combine: {
      eyebrow: "COMBINE",
      title: "Cross-game combine",
      description: "Verified points aggregated across supported game lanes.",
    },
  };
  return {
    mode,
    ...labels[mode],
    period_label: mode === "weekly" ? "CURRENT UTC WEEK" : "CURRENT SEASON",
    countdown_label: "Updates after verified results",
    total_competitors: total,
    percentile_label: total === 0 ? "No ranked players yet" : `${total} ranked players`,
  };
}

async function revision(mode: LeaderboardMode): Promise<number> {
  const result = await queryDatabase<{ revision: string | number }>(
    "SELECT revision FROM leaderboard_revisions WHERE mode = $1",
    [mode],
  );
  return Number(result.rows[0]?.revision ?? 1);
}

export async function handleProductionLeaderboardGet(
  request: NextRequest,
  modeValue: string,
  resource: ProductionLeaderboardResource,
): Promise<NextResponse> {
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  try {
    if (!isMode(modeValue)) {
      throw Object.assign(new Error(`Leaderboard mode ${modeValue} was not found.`), {
        status: 404,
        code: "leaderboard_mode_not_found",
        retryable: false,
      });
    }
    const userId = await actorId();
    const mode = modeValue;
    const game = request.nextUrl.searchParams.get("game");
    const rows = await aggregateRows(mode, userId, game);
    const current = rows.find((row) => row.is_current_user) ?? null;
    const now = new Date();
    const responseMeta = meta(now);
    let data: unknown;

    if (resource === "composition") {
      const composition = getLeaderboardModeComposition(mode);
      data = {
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
        desktop_columns: composition.desktopColumns,
        mobile_primary_metric: composition.mobilePrimaryMetric,
        mobile_secondary_metrics: composition.mobileSecondaryMetrics,
      };
    } else if (resource === "summary") {
      data = summaryFor(mode, rows.length);
    } else if (resource === "entries") {
      data = applyEntriesQuery(rows, request);
    } else if (resource === "current-position") {
      data = { entry: current };
    } else if (resource === "rewards") {
      data = { items: [] };
    } else if (resource === "status") {
      data = {
        mode,
        freshness: "fresh",
        last_updated_at: responseMeta.last_updated_at,
        next_refresh_at: new Date(now.getTime() + 30_000).toISOString(),
        source: "leaderboard-api",
      };
    } else {
      const currentRevision = await revision(mode);
      const baseRevision = Math.max(1, Number(request.nextUrl.searchParams.get("revision") ?? currentRevision) || currentRevision);
      const changed = currentRevision !== baseRevision;
      data = {
        mode,
        revision: currentRevision,
        base_revision: baseRevision,
        has_changes: changed,
        changed_entry_ids: changed ? rows.map((row) => row.leaderboard_entry_id) : [],
        items: changed ? rows : [],
        current_position: {
          entry: current,
          previous_rank: null,
          movement: current ? "new" : "same",
          movement_delta: null,
          next_rank: current && current.rank > 1 ? current.rank - 1 : null,
          points_to_next_rank:
            current && current.rank > 1
              ? Math.max(0, (rows[current.rank - 2]?.points ?? current.points) - current.points)
              : null,
        },
        next_poll_at: new Date(now.getTime() + 30_000).toISOString(),
      };
    }

    return NextResponse.json(
      { ok: true, data, request_id: requestId, meta: responseMeta },
      { status: 200, headers: headers(requestId) },
    );
  } catch (error) {
    return failure(requestId, error);
  }
}

export async function handlePlayCurrentPosition(request: NextRequest): Promise<NextResponse> {
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  try {
    const userId = await actorId();
    const rows = await aggregateRows("weekly", userId, null);
    const current = rows.find((row) => row.is_current_user);
    const now = new Date().toISOString();
    const data = current
      ? {
          leaderboard_id: "weekly",
          week_label: "CURRENT UTC WEEK",
          rank: current.rank,
          previous_rank: current.previous_rank,
          movement: current.movement,
          points: current.points,
          target_points: Math.max(current.points + 1, rows[current.rank - 2]?.points ?? current.points + 3),
          wins: current.wins,
          losses: current.losses,
          win_rate: current.win_rate,
          streak: current.streak > 0 ? `W${current.streak}` : "—",
          tier: current.tier,
          last_updated_at: now,
        }
      : null;

    if (!data) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "leaderboard_position_unavailable",
            message: "Complete a verified match to receive a leaderboard position.",
            request_id: requestId,
            retryable: false,
            field_errors: {},
          },
        },
        { status: 404, headers: headers(requestId) },
      );
    }

    return NextResponse.json(
      { ok: true, data, request_id: requestId },
      { status: 200, headers: headers(requestId) },
    );
  } catch (error) {
    return failure(requestId, error);
  }
}
