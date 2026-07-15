// VERZUS M5 STEPS 5.1-5.4

import {
  crewSummarySchema,
  currentCheckInSchema,
  currentPositionSchema,
  nextMatchSchema,
  playerStatusSchema,
  recentActivitySchema,
  recommendedCompetitionsSchema,
  type CrewSummary,
  type CurrentCheckIn,
  type CurrentPosition,
  type NextMatch,
  type PlayerStatus,
  type RecentActivityItem,
  type RecommendedCompetition,
} from "../model";
import {
  crewSummaryResponseSchema,
  currentCheckInResponseSchema,
  currentPositionResponseSchema,
  nextMatchResponseSchema,
  playerStatusResponseSchema,
  recentActivityResponseSchema,
  recommendedCompetitionsResponseSchema,
  type PlayApiErrorRaw,
} from "./play-api.schema";

export class PlayApiClientError extends Error {
  readonly code: string;
  readonly requestId: string;
  readonly retryable: boolean;
  readonly fieldErrors: Record<string, string[]>;

  constructor(error: {
    code: string;
    message: string;
    requestId: string;
    retryable: boolean;
    fieldErrors: Record<string, string[]>;
  }) {
    super(error.message);
    this.name = "PlayApiClientError";
    this.code = error.code;
    this.requestId = error.requestId;
    this.retryable = error.retryable;
    this.fieldErrors = error.fieldErrors;
  }
}

function apiFailure(error: PlayApiErrorRaw): PlayApiClientError {
  return new PlayApiClientError({
    code: error.code,
    message: error.message,
    requestId: error.request_id,
    retryable: error.retryable,
    fieldErrors: error.field_errors,
  });
}

function invalidResponse(resource: string): PlayApiClientError {
  return new PlayApiClientError({
    code: "invalid_response",
    message: `The Play ${resource} service returned an invalid response.`,
    requestId: `play-client-invalid-${resource}`,
    retryable: true,
    fieldErrors: {},
  });
}

export function adaptPlayerStatusPayload(payload: unknown): PlayerStatus {
  const parsed = playerStatusResponseSchema.safeParse(payload);

  if (!parsed.success) {
    throw invalidResponse("player-status");
  }

  if (!parsed.data.ok) {
    throw apiFailure(parsed.data.error);
  }

  const raw = parsed.data.data;

  return playerStatusSchema.parse({
    playerId: raw.player_id,
    handle: raw.handle,
    displayName: raw.display_name,
    avatarUrl: raw.avatar_url,
    primaryGame: raw.primary_game,
    gameLane: raw.game_lane,
    locationLabel: raw.location_label,
    trustScore: raw.trust_score,
    trustTier: raw.trust_tier,
    weekLabel: raw.week_label,
    unreadNotifications: raw.unread_notifications,
    lastUpdatedAt: raw.last_updated_at,
  });
}

export function adaptNextMatchPayload(payload: unknown): NextMatch | null {
  const parsed = nextMatchResponseSchema.safeParse(payload);

  if (!parsed.success) {
    throw invalidResponse("next-match");
  }

  if (!parsed.data.ok) {
    throw apiFailure(parsed.data.error);
  }

  const raw = parsed.data.data;

  if (!raw) {
    return null;
  }

  return nextMatchSchema.parse({
    matchId: raw.match_id,
    competitionId: raw.competition_id,
    competitionName: raw.competition_name,
    game: raw.game,
    format: raw.format,
    status: raw.status,
    startsAt: raw.starts_at,
    checkInOpensAt: raw.check_in_opens_at,
    checkInClosesAt: raw.check_in_closes_at,
    serverNow: raw.server_now,
    self: {
      playerId: raw.self.player_id,
      handle: raw.self.handle,
      avatarUrl: raw.self.avatar_url,
      rank: raw.self.rank,
      locationLabel: raw.self.location_label,
      isCurrentPlayer: raw.self.is_current_player,
    },
    opponent: {
      playerId: raw.opponent.player_id,
      handle: raw.opponent.handle,
      avatarUrl: raw.opponent.avatar_url,
      rank: raw.opponent.rank,
      locationLabel: raw.opponent.location_label,
      isCurrentPlayer: raw.opponent.is_current_player,
    },
  });
}

export function adaptCurrentCheckInPayload(payload: unknown): CurrentCheckIn {
  const parsed = currentCheckInResponseSchema.safeParse(payload);

  if (!parsed.success) {
    throw invalidResponse("check-in");
  }

  if (!parsed.data.ok) {
    throw apiFailure(parsed.data.error);
  }

  const raw = parsed.data.data;

  return currentCheckInSchema.parse({
    matchId: raw.match_id,
    state: raw.state,
    opensAt: raw.opens_at,
    closesAt: raw.closes_at,
    checkedInAt: raw.checked_in_at,
    serverNow: raw.server_now,
    canCheckIn: raw.can_check_in,
    mutationKey: raw.mutation_key,
  });
}

export function adaptCurrentPositionPayload(payload: unknown): CurrentPosition {
  const parsed = currentPositionResponseSchema.safeParse(payload);

  if (!parsed.success) {
    throw invalidResponse("current-position");
  }

  if (!parsed.data.ok) {
    throw apiFailure(parsed.data.error);
  }

  const raw = parsed.data.data;

  return currentPositionSchema.parse({
    leaderboardId: raw.leaderboard_id,
    weekLabel: raw.week_label,
    rank: raw.rank,
    previousRank: raw.previous_rank,
    movement: raw.movement,
    points: raw.points,
    targetPoints: raw.target_points,
    wins: raw.wins,
    losses: raw.losses,
    winRate: raw.win_rate,
    streak: raw.streak,
    tier: raw.tier,
    lastUpdatedAt: raw.last_updated_at,
  });
}

export function adaptCrewSummaryPayload(payload: unknown): CrewSummary | null {
  const parsed = crewSummaryResponseSchema.safeParse(payload);

  if (!parsed.success) {
    throw invalidResponse("crew-summary");
  }

  if (!parsed.data.ok) {
    throw apiFailure(parsed.data.error);
  }

  const raw = parsed.data.data;

  if (!raw) {
    return null;
  }

  return crewSummarySchema.parse({
    crewId: raw.crew_id,
    name: raw.name,
    tag: raw.tag,
    emblemUrl: raw.emblem_url,
    rank: raw.rank,
    points: raw.points,
    onlineMembers: raw.online_members,
    totalMembers: raw.total_members,
    liveActivityCount: raw.live_activity_count,
    nextFixtureLabel: raw.next_fixture_label,
    nextFixtureAt: raw.next_fixture_at,
    lastUpdatedAt: raw.last_updated_at,
  });
}

export function adaptRecommendedCompetitionsPayload(payload: unknown): RecommendedCompetition[] {
  const parsed = recommendedCompetitionsResponseSchema.safeParse(payload);

  if (!parsed.success) {
    throw invalidResponse("recommended-competitions");
  }

  if (!parsed.data.ok) {
    throw apiFailure(parsed.data.error);
  }

  return recommendedCompetitionsSchema.parse(
    parsed.data.data.map((raw) => ({
      competitionId: raw.competition_id,
      title: raw.title,
      game: raw.game,
      format: raw.format,
      startsAt: raw.starts_at,
      registrationClosesAt: raw.registration_closes_at,
      entryLabel: raw.entry_label,
      eligibilityLabel: raw.eligibility_label,
      rewardLabel: raw.reward_label,
      isFeatured: raw.is_featured,
    })),
  );
}

export function adaptRecentActivityPayload(payload: unknown): RecentActivityItem[] {
  const parsed = recentActivityResponseSchema.safeParse(payload);

  if (!parsed.success) {
    throw invalidResponse("recent-activity");
  }

  if (!parsed.data.ok) {
    throw apiFailure(parsed.data.error);
  }

  return recentActivitySchema.parse(
    parsed.data.data.map((raw) => ({
      activityId: raw.activity_id,
      type: raw.type,
      title: raw.title,
      detail: raw.detail,
      occurredAt: raw.occurred_at,
      pointsDelta: raw.points_delta,
      href: raw.href,
    })),
  );
}
