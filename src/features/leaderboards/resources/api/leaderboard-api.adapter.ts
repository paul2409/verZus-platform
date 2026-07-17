// VERZUS M8.3 LEADERBOARD HTTP TO DOMAIN ADAPTERS

import {
  leaderboardCurrentPositionResourceDataSchema,
  leaderboardModeCompositionResourceDataSchema,
  leaderboardEntriesResourceDataSchema,
  leaderboardRewardsResourceDataSchema,
  leaderboardStatusResourceDataSchema,
  leaderboardSummaryResourceDataSchema,
} from "../model/leaderboard-resource.schema";
import type {
  LeaderboardCurrentPositionResourceData,
  LeaderboardModeCompositionResourceData,
  LeaderboardEntriesResourceData,
  LeaderboardResourceMeta,
  LeaderboardRewardsResourceData,
  LeaderboardStatusResourceData,
  LeaderboardSummaryResourceData,
} from "../model/leaderboard-resource.types";
import {
  leaderboardCompositionResponseSchema,
  leaderboardCurrentPositionResponseSchema,
  leaderboardEntriesResponseSchema,
  leaderboardRewardsResponseSchema,
  leaderboardRowRawSchema,
  leaderboardStatusResponseSchema,
  leaderboardSummaryResponseSchema,
  type LeaderboardApiErrorRaw,
} from "./leaderboard-api.schema";

export class LeaderboardApiClientError extends Error {
  readonly code: string;
  readonly requestId: string;
  readonly retryable: boolean;
  readonly fieldErrors: Record<string, string[]>;

  constructor(input: {
    code: string;
    message: string;
    requestId: string;
    retryable: boolean;
    fieldErrors?: Record<string, string[]>;
  }) {
    super(input.message);
    this.name = "LeaderboardApiClientError";
    this.code = input.code;
    this.requestId = input.requestId;
    this.retryable = input.retryable;
    this.fieldErrors = input.fieldErrors ?? {};
  }
}

function apiFailure(error: LeaderboardApiErrorRaw): LeaderboardApiClientError {
  return new LeaderboardApiClientError({
    code: error.code,
    message: error.message,
    requestId: error.request_id,
    retryable: error.retryable,
    fieldErrors: error.field_errors,
  });
}

function invalidResponse(resource: string): LeaderboardApiClientError {
  return new LeaderboardApiClientError({
    code: "invalid_response",
    message: `The leaderboard ${resource} service returned an invalid response.`,
    requestId: `leaderboard-client-invalid-${resource}`,
    retryable: true,
  });
}

function adaptMeta(
  requestId: string,
  raw: { server_now: string; last_updated_at: string; freshness: "fresh" | "stale" },
): LeaderboardResourceMeta {
  return {
    requestId,
    serverNow: raw.server_now,
    lastUpdatedAt: raw.last_updated_at,
    freshness: raw.freshness,
  };
}

function adaptRow(raw: {
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
}) {
  return {
    id: raw.leaderboard_entry_id,
    rank: raw.rank,
    previousRank: raw.previous_rank,
    movement: raw.movement,
    movementDelta: raw.movement_delta,
    entityType: raw.entity_type,
    name: raw.display_name,
    handle: raw.handle,
    initials: raw.initials,
    crewName: raw.crew_name,
    countryCode: raw.country_code,
    game: raw.game,
    scope: raw.scope,
    wins: raw.wins,
    losses: raw.losses,
    winRate: raw.win_rate,
    points: raw.points,
    streak: raw.streak,
    trust: raw.trust,
    tier: raw.tier,
    memberCount: raw.member_count,
    isCurrentUser: raw.is_current_user,
  };
}

// VERZUS M8.4 MODE COMPOSITION ADAPTER
export function adaptLeaderboardCompositionPayload(
  payload: unknown,
): LeaderboardModeCompositionResourceData {
  const parsed = leaderboardCompositionResponseSchema.safeParse(payload);
  if (!parsed.success) throw invalidResponse("composition");
  if (!parsed.data.ok) throw apiFailure(parsed.data.error);
  const raw = parsed.data.data;

  return leaderboardModeCompositionResourceDataSchema.parse({
    mode: raw.mode,
    entityType: raw.entity_type,
    rankingBasis: raw.ranking_basis,
    identityLabel: raw.identity_label,
    affiliationLabel: raw.affiliation_label,
    pointsLabel: raw.points_label,
    currentPositionLabel: raw.current_position_label,
    defaultGame: raw.default_game,
    allowedGames: raw.allowed_games,
    defaultScope: raw.default_scope,
    allowedScopes: raw.allowed_scopes,
    defaultSort: raw.default_sort,
    defaultDirection: raw.default_direction,
    desktopColumns: raw.desktop_columns,
    mobilePrimaryMetric: raw.mobile_primary_metric,
    mobileSecondaryMetrics: raw.mobile_secondary_metrics,
    meta: adaptMeta(parsed.data.request_id, parsed.data.meta),
  });
}

export function adaptLeaderboardSummaryPayload(payload: unknown): LeaderboardSummaryResourceData {
  const parsed = leaderboardSummaryResponseSchema.safeParse(payload);
  if (!parsed.success) throw invalidResponse("summary");
  if (!parsed.data.ok) throw apiFailure(parsed.data.error);
  const raw = parsed.data.data;

  return leaderboardSummaryResourceDataSchema.parse({
    mode: raw.mode,
    eyebrow: raw.eyebrow,
    title: raw.title,
    description: raw.description,
    periodLabel: raw.period_label,
    countdownLabel: raw.countdown_label,
    totalCompetitors: raw.total_competitors,
    percentileLabel: raw.percentile_label,
    meta: adaptMeta(parsed.data.request_id, parsed.data.meta),
  });
}

export function adaptLeaderboardEntriesPayload(payload: unknown): LeaderboardEntriesResourceData {
  const parsed = leaderboardEntriesResponseSchema.safeParse(payload);
  if (!parsed.success) throw invalidResponse("entries");
  if (!parsed.data.ok) throw apiFailure(parsed.data.error);
  const raw = parsed.data.data;
  const isolatedRowIds: string[] = [];
  const items = raw.items.flatMap((candidate, index) => {
    const row = leaderboardRowRawSchema.safeParse(candidate);
    if (!row.success) {
      const identifier =
        candidate &&
        typeof candidate === "object" &&
        "leaderboard_entry_id" in candidate &&
        typeof candidate.leaderboard_entry_id === "string"
          ? candidate.leaderboard_entry_id
          : `row-${index + 1}`;
      isolatedRowIds.push(identifier);
      return [];
    }
    return [adaptRow(row.data)];
  });

  // VERZUS M8.6 MALFORMED ROW ISOLATION
  return leaderboardEntriesResourceDataSchema.parse({
    items,
    page: raw.page,
    pageCount: raw.page_count,
    total: raw.total,
    startIndex: raw.start_index,
    endIndex: raw.end_index,
    hasPreviousPage: raw.has_previous_page,
    hasNextPage: raw.has_next_page,
    isolatedRowCount: isolatedRowIds.length,
    isolatedRowIds,
    meta: adaptMeta(parsed.data.request_id, parsed.data.meta),
  });
}

export function adaptLeaderboardCurrentPositionPayload(
  payload: unknown,
): LeaderboardCurrentPositionResourceData {
  const parsed = leaderboardCurrentPositionResponseSchema.safeParse(payload);
  if (!parsed.success) throw invalidResponse("current-position");
  if (!parsed.data.ok) throw apiFailure(parsed.data.error);

  return leaderboardCurrentPositionResourceDataSchema.parse({
    entry: parsed.data.data.entry ? adaptRow(parsed.data.data.entry) : null,
    meta: adaptMeta(parsed.data.request_id, parsed.data.meta),
  });
}

export function adaptLeaderboardRewardsPayload(payload: unknown): LeaderboardRewardsResourceData {
  const parsed = leaderboardRewardsResponseSchema.safeParse(payload);
  if (!parsed.success) throw invalidResponse("rewards");
  if (!parsed.data.ok) throw apiFailure(parsed.data.error);

  return leaderboardRewardsResourceDataSchema.parse({
    items: parsed.data.data.items.map((raw) => ({
      rankLabel: raw.rank_label,
      xp: raw.xp,
      cashLabel: raw.cash_label,
    })),
    meta: adaptMeta(parsed.data.request_id, parsed.data.meta),
  });
}

export function adaptLeaderboardStatusPayload(payload: unknown): LeaderboardStatusResourceData {
  const parsed = leaderboardStatusResponseSchema.safeParse(payload);
  if (!parsed.success) throw invalidResponse("status");
  if (!parsed.data.ok) throw apiFailure(parsed.data.error);
  const raw = parsed.data.data;

  return leaderboardStatusResourceDataSchema.parse({
    mode: raw.mode,
    freshness: raw.freshness,
    lastUpdatedAt: raw.last_updated_at,
    nextRefreshAt: raw.next_refresh_at,
    source: raw.source,
    meta: adaptMeta(parsed.data.request_id, parsed.data.meta),
  });
}
