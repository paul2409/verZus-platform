// VERZUS M11.5 PLAYER HISTORY DOMAIN ADAPTERS

import type {
  PlayerDetailedStatistics,
  PlayerMatchHistoryPage,
} from "../model/player-history.types";
import {
  playerDetailedStatisticsResponseSchema,
  playerHistoryApiErrorSchema,
  playerMatchHistoryResponseSchema,
} from "../schema/player-history.schema";

export class PlayerHistoryResourceError extends Error {
  readonly code: string;
  readonly requestId: string;
  readonly retryable: boolean;
  readonly status: number | undefined;
  readonly fieldErrors: Record<string, string[]> | undefined;

  constructor(input: {
    code: string;
    message: string;
    requestId: string;
    retryable: boolean;
    status?: number | undefined;
    fieldErrors?: Record<string, string[]> | undefined;
  }) {
    super(input.message);
    this.name = "PlayerHistoryResourceError";
    this.code = input.code;
    this.requestId = input.requestId;
    this.retryable = input.retryable;
    this.status = input.status;
    this.fieldErrors = input.fieldErrors;
  }
}

export function adaptPlayerHistoryError(payload: unknown, status?: number) {
  const parsed = playerHistoryApiErrorSchema.safeParse(payload);
  if (!parsed.success) {
    return new PlayerHistoryResourceError({
      code: "PLAYER_HISTORY_UNKNOWN_ERROR",
      message: "Player history could not be loaded.",
      requestId: `profile-history-${status ?? "unknown"}`,
      retryable: status === undefined || status >= 500,
      status,
    });
  }

  return new PlayerHistoryResourceError({
    code: parsed.data.code,
    message: parsed.data.message,
    requestId: parsed.data.request_id,
    retryable: parsed.data.retryable,
    fieldErrors: parsed.data.field_errors,
    status,
  });
}

export function adaptPlayerMatchHistory(payload: unknown): PlayerMatchHistoryPage {
  const raw = playerMatchHistoryResponseSchema.parse(payload);
  return {
    items: raw.items.map((item) => ({
      id: item.id,
      opponentId: item.opponent_id,
      opponentLabel: item.opponent_label,
      gameLabel: item.game_label,
      competitionLabel: item.competition_label,
      scoreFor: item.score_for,
      scoreAgainst: item.score_against,
      scoreLabel: `${item.score_for}–${item.score_against}`,
      result: item.result,
      playedAt: item.played_at,
      playedAtLabel: item.played_at_label,
      durationMinutes: item.duration_minutes,
      rankDelta: item.rank_delta,
      trustDelta: item.trust_delta,
      verified: item.verified,
      matchHref: item.match_href,
      opponentHref: item.opponent_href,
    })),
    page: raw.page,
    pageSize: raw.page_size,
    totalItems: raw.total_items,
    totalPages: raw.total_pages,
    filters: raw.filters,
    requestId: raw.request_id,
    fetchedAt: raw.fetched_at,
    freshness: raw.freshness,
  };
}

export function adaptPlayerDetailedStatistics(payload: unknown): PlayerDetailedStatistics {
  const raw = playerDetailedStatisticsResponseSchema.parse(payload);
  return {
    window: raw.window,
    game: raw.game,
    matches: raw.matches,
    wins: raw.wins,
    losses: raw.losses,
    draws: raw.draws,
    winRate: raw.win_rate,
    rating: raw.rating,
    ratingDelta: raw.rating_delta,
    currentStreak: raw.current_streak,
    bestStreak: raw.best_streak,
    pointsFor: raw.points_for,
    pointsAgainst: raw.points_against,
    averagePointsFor: raw.average_points_for,
    averagePointsAgainst: raw.average_points_against,
    verifiedRate: raw.verified_rate,
    form: raw.form,
    gameBreakdown: raw.game_breakdown.map((item) => ({
      gameLabel: item.game_label,
      matches: item.matches,
      wins: item.wins,
      losses: item.losses,
      draws: item.draws,
      winRate: item.win_rate,
      rating: item.rating,
      ratingDelta: item.rating_delta,
      bestStreak: item.best_streak,
    })),
    requestId: raw.request_id,
    fetchedAt: raw.fetched_at,
    freshness: raw.freshness,
  };
}
