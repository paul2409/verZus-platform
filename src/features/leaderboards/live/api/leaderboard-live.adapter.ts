// VERZUS M8.5 LIVE UPDATE HTTP ADAPTER

import type { LeaderboardFoundationRow } from "../../foundation/model/leaderboard-foundation.types";
import { LeaderboardApiClientError } from "../../resources/api/leaderboard-api.adapter";
import type { LeaderboardLiveUpdateData } from "../model/leaderboard-live.types";
import { leaderboardLiveUpdateResponseSchema } from "./leaderboard-live.schema";

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
}): LeaderboardFoundationRow {
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

export function adaptLeaderboardLiveUpdatePayload(payload: unknown): LeaderboardLiveUpdateData {
  const parsed = leaderboardLiveUpdateResponseSchema.safeParse(payload);
  if (!parsed.success) {
    throw new LeaderboardApiClientError({
      code: "invalid_response",
      message: "The leaderboard update service returned an invalid response.",
      requestId: "leaderboard-live-invalid-response",
      retryable: true,
    });
  }

  if (!parsed.data.ok) {
    throw new LeaderboardApiClientError({
      code: parsed.data.error.code,
      message: parsed.data.error.message,
      requestId: parsed.data.error.request_id,
      retryable: parsed.data.error.retryable,
      fieldErrors: parsed.data.error.field_errors,
    });
  }

  const raw = parsed.data.data;
  return {
    mode: raw.mode,
    revision: raw.revision,
    baseRevision: raw.base_revision,
    hasChanges: raw.has_changes,
    changedEntryIds: raw.changed_entry_ids,
    items: raw.items.map(adaptRow),
    currentPosition: {
      entry: raw.current_position.entry ? adaptRow(raw.current_position.entry) : null,
      previousRank: raw.current_position.previous_rank,
      movement: raw.current_position.movement,
      movementDelta: raw.current_position.movement_delta,
      nextRank: raw.current_position.next_rank,
      pointsToNextRank: raw.current_position.points_to_next_rank,
    },
    nextPollAt: raw.next_poll_at,
    meta: {
      requestId: parsed.data.request_id,
      serverNow: parsed.data.meta.server_now,
      lastUpdatedAt: parsed.data.meta.last_updated_at,
      freshness: parsed.data.meta.freshness,
    },
  };
}
