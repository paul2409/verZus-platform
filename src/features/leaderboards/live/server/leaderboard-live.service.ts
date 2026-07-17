// VERZUS M8.5 DETERMINISTIC LIVE UPDATE SERVICE

import { buildLeaderboardPage, parseLeaderboardQueryState } from "../../explorer";
import type { LeaderboardQueryState } from "../../explorer";
import type {
  LeaderboardFoundationRow,
  LeaderboardMode,
} from "../../foundation/model/leaderboard-foundation.types";
import { normalizeLeaderboardQueryForMode } from "../../modes/model/leaderboard-mode.registry";
import { getLeaderboardModeReadModel } from "../../modes/server/leaderboard-mode-read-model";
import type { LeaderboardLiveUpdateScenario } from "../model/leaderboard-live.types";
import { buildCurrentPositionInsight } from "../model/leaderboard-movement";
import { applyStableLeaderboardRows } from "../model/leaderboard-stable-update";

export type MockLeaderboardLiveResult = {
  status: number;
  body: unknown;
};

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

function scenarioRows(
  rows: readonly LeaderboardFoundationRow[],
  scenario: LeaderboardLiveUpdateScenario,
): LeaderboardFoundationRow[] {
  if (scenario === "normal" || rows.length < 2) return [...rows];

  const incoming = rows.map((row, index) => {
    if (scenario === "advance") {
      if (index === 0) return { ...row, rank: 2, points: row.points + 150 };
      if (index === 1) return { ...row, rank: 1, points: row.points + 2_800 };
    }
    if (scenario === "tie" && index < 2) {
      return { ...row, rank: 1, points: Math.max(rows[0]!.points, rows[1]!.points) };
    }
    return row;
  });

  return applyStableLeaderboardRows(rows, incoming);
}

function scenarioCurrentPosition(
  row: LeaderboardFoundationRow,
  scenario: LeaderboardLiveUpdateScenario,
): LeaderboardFoundationRow {
  if (scenario !== "advance") return row;
  return {
    ...row,
    previousRank: row.rank,
    rank: Math.max(1, row.rank - 2),
    points: row.points + 500,
  };
}

function queryState(mode: LeaderboardMode, params: URLSearchParams): LeaderboardQueryState {
  return { ...parseLeaderboardQueryState(params), mode };
}

export function getMockLeaderboardLiveUpdate(
  mode: LeaderboardMode,
  params: URLSearchParams,
  scenario: LeaderboardLiveUpdateScenario = "normal",
  now: Date = new Date(),
): MockLeaderboardLiveResult {
  const { board, composition } = getLeaderboardModeReadModel(mode);
  const state = normalizeLeaderboardQueryForMode(queryState(mode, params), composition);
  const rows = scenarioRows(board.rows, scenario);
  const page = buildLeaderboardPage(rows, state);
  const currentPosition = buildCurrentPositionInsight(
    scenarioCurrentPosition(board.currentEntry, scenario),
  );
  const baseRevision = 12;
  const revision = scenario === "advance" ? 13 : scenario === "tie" ? 14 : baseRevision;
  const changedEntryIds =
    scenario === "normal"
      ? []
      : [rows[0]?.id, rows[1]?.id, currentPosition.entry?.id].filter((value): value is string =>
          Boolean(value),
        );
  const requestId = `mock-leaderboard-updates-${globalThis.crypto.randomUUID()}`;
  const lastUpdatedAt = new Date(now.getTime() - 5_000).toISOString();

  return {
    status: 200,
    body: {
      ok: true,
      data: {
        mode,
        revision,
        base_revision: baseRevision,
        has_changes: scenario !== "normal",
        changed_entry_ids: changedEntryIds,
        items: page.rows.map(rawRow),
        current_position: {
          entry: currentPosition.entry ? rawRow(currentPosition.entry) : null,
          previous_rank: currentPosition.previousRank,
          movement: currentPosition.movement,
          movement_delta: currentPosition.movementDelta,
          next_rank: currentPosition.nextRank,
          points_to_next_rank: currentPosition.pointsToNextRank,
        },
        next_poll_at: new Date(now.getTime() + 30_000).toISOString(),
      },
      request_id: requestId,
      meta: {
        server_now: now.toISOString(),
        last_updated_at: lastUpdatedAt,
        freshness: "fresh",
      },
    },
  };
}
