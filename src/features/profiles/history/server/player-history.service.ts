import "server-only";

import type { QueryResultRow } from "pg";

import { queryDatabase } from "@/lib/db";

import type {
  PlayerHistoryGameFilter,
  PlayerHistoryResultFilter,
  PlayerStatisticsWindow,
} from "../model/player-history.types";

type SupportedGameLabel = "EA FC 26" | "Call of Duty" | "NBA 2K26";

type MatchHistoryRow = QueryResultRow & {
  id: string;
  opponent_id: string;
  opponent_label: string;
  game_filter: string;
  competition_label: string | null;
  side: "home" | "away";
  home_score: number;
  away_score: number;
  played_at: Date;
  duration_minutes: number;
};

type SummaryRow = QueryResultRow & {
  rating: number | string;
  current_streak: number | string;
};

function gameLabel(filter: string): SupportedGameLabel | null {
  if (filter === "ea-fc") return "EA FC 26";
  if (filter === "cod-mobile") return "Call of Duty";
  return null;
}

function gameFilter(label: PlayerHistoryGameFilter): string | null {
  if (label === "EA FC 26") return "ea-fc";
  if (label === "Call of Duty") return "cod-mobile";
  if (label === "NBA 2K26") return "nba-2k";
  return null;
}

function resultFor(row: MatchHistoryRow): "win" | "loss" | "draw" {
  const scoreFor = row.side === "home" ? row.home_score : row.away_score;
  const scoreAgainst = row.side === "home" ? row.away_score : row.home_score;
  if (scoreFor > scoreAgainst) return "win";
  if (scoreFor < scoreAgainst) return "loss";
  return "draw";
}

export async function readPlayerMatchHistory(input: {
  userId: string;
  game: PlayerHistoryGameFilter;
  result: PlayerHistoryResultFilter;
  page: number;
  pageSize: number;
}) {
  const requestedGame = gameFilter(input.game);
  const rows = await queryDatabase<MatchHistoryRow>(
    `
      SELECT
        match_record.id,
        opponent.user_id AS opponent_id,
        COALESCE(NULLIF(opponent_profile.display_name, ''), opponent_user.gamer_tag) AS opponent_label,
        game.filter_value AS game_filter,
        competition.name AS competition_label,
        viewer.side,
        result_record.home_score,
        result_record.away_score,
        result_record.confirmed_at AS played_at,
        GREATEST(
          1,
          FLOOR(EXTRACT(EPOCH FROM (result_record.confirmed_at - match_record.match_starts_at)) / 60)
        )::integer AS duration_minutes
      FROM match_results AS result_record
      JOIN matches AS match_record ON match_record.id = result_record.match_id
      JOIN match_participants AS viewer
        ON viewer.match_id = match_record.id AND viewer.user_id = $1
      JOIN match_participants AS opponent
        ON opponent.match_id = match_record.id AND opponent.user_id <> $1
      JOIN users AS opponent_user ON opponent_user.id = opponent.user_id
      LEFT JOIN player_profiles AS opponent_profile ON opponent_profile.user_id = opponent.user_id
      LEFT JOIN competitions AS competition ON competition.id = match_record.competition_id
      JOIN games AS game ON game.id = match_record.game_id
      WHERE result_record.status = 'confirmed'
        AND ($2::text IS NULL OR game.filter_value = $2)
        AND game.filter_value IN ('ea-fc', 'cod-mobile')
      ORDER BY result_record.confirmed_at DESC, match_record.id ASC
    `,
    [input.userId, requestedGame],
  );

  const filtered = rows.rows.filter((row) => {
    const result = resultFor(row);
    return input.result === "all" || result === input.result;
  });
  const totalItems = filtered.length;
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / input.pageSize);
  const page = totalPages === 0 ? 1 : Math.min(input.page, totalPages);
  const offset = (page - 1) * input.pageSize;
  const items = filtered.slice(offset, offset + input.pageSize).flatMap((row) => {
    const label = gameLabel(row.game_filter);
    if (!label) return [];
    const scoreFor = row.side === "home" ? row.home_score : row.away_score;
    const scoreAgainst = row.side === "home" ? row.away_score : row.home_score;
    return [
      {
        id: row.id,
        opponent_id: row.opponent_id,
        opponent_label: row.opponent_label,
        game_label: label,
        competition_label: row.competition_label ?? "Scheduled match",
        score_for: scoreFor,
        score_against: scoreAgainst,
        result: resultFor(row),
        played_at: row.played_at.toISOString(),
        played_at_label: row.played_at.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        }),
        duration_minutes: row.duration_minutes,
        rank_delta: 0,
        trust_delta: 0,
        verified: true,
        match_href: `/matches/${encodeURIComponent(row.id)}`,
        opponent_href: `/players/${encodeURIComponent(row.opponent_id)}`,
      },
    ];
  });

  return {
    items,
    page,
    page_size: input.pageSize,
    total_items: totalItems,
    total_pages: totalPages,
    filters: { game: input.game, result: input.result },
  };
}

export async function readPlayerStatistics(input: {
  userId: string;
  game: PlayerHistoryGameFilter;
  window: PlayerStatisticsWindow;
}) {
  const requestedGame = gameFilter(input.game);
  const cutoff =
    input.window === "7d"
      ? "7 days"
      : input.window === "30d"
        ? "30 days"
        : null;
  const rows = await queryDatabase<MatchHistoryRow>(
    `
      SELECT
        match_record.id,
        opponent.user_id AS opponent_id,
        COALESCE(NULLIF(opponent_profile.display_name, ''), opponent_user.gamer_tag) AS opponent_label,
        game.filter_value AS game_filter,
        competition.name AS competition_label,
        viewer.side,
        result_record.home_score,
        result_record.away_score,
        result_record.confirmed_at AS played_at,
        GREATEST(
          1,
          FLOOR(EXTRACT(EPOCH FROM (result_record.confirmed_at - match_record.match_starts_at)) / 60)
        )::integer AS duration_minutes
      FROM match_results AS result_record
      JOIN matches AS match_record ON match_record.id = result_record.match_id
      JOIN match_participants AS viewer
        ON viewer.match_id = match_record.id AND viewer.user_id = $1
      JOIN match_participants AS opponent
        ON opponent.match_id = match_record.id AND opponent.user_id <> $1
      JOIN users AS opponent_user ON opponent_user.id = opponent.user_id
      LEFT JOIN player_profiles AS opponent_profile ON opponent_profile.user_id = opponent.user_id
      LEFT JOIN competitions AS competition ON competition.id = match_record.competition_id
      JOIN games AS game ON game.id = match_record.game_id
      WHERE result_record.status = 'confirmed'
        AND ($2::text IS NULL OR game.filter_value = $2)
        AND ($3::text IS NULL OR result_record.confirmed_at >= now() - $3::interval)
        AND game.filter_value IN ('ea-fc', 'cod-mobile')
      ORDER BY result_record.confirmed_at DESC
    `,
    [input.userId, requestedGame, cutoff],
  );
  const summary = await queryDatabase<SummaryRow>(
    "SELECT rating, current_streak FROM player_competitive_summaries WHERE user_id = $1",
    [input.userId],
  );

  const matches = rows.rows;
  const results = matches.map(resultFor);
  const wins = results.filter((result) => result === "win").length;
  const losses = results.filter((result) => result === "loss").length;
  const draws = results.filter((result) => result === "draw").length;
  const pointsFor = matches.reduce(
    (total, row) => total + (row.side === "home" ? row.home_score : row.away_score),
    0,
  );
  const pointsAgainst = matches.reduce(
    (total, row) => total + (row.side === "home" ? row.away_score : row.home_score),
    0,
  );
  const grouped = new Map<SupportedGameLabel, MatchHistoryRow[]>();
  for (const row of matches) {
    const label = gameLabel(row.game_filter);
    if (!label) continue;
    grouped.set(label, [...(grouped.get(label) ?? []), row]);
  }
  const rating = Number(summary.rows[0]?.rating ?? 0);
  const currentStreak = Math.max(0, Number(summary.rows[0]?.current_streak ?? 0));

  return {
    window: input.window,
    game: input.game,
    matches: matches.length,
    wins,
    losses,
    draws,
    win_rate: matches.length === 0 ? 0 : Number(((wins / matches.length) * 100).toFixed(2)),
    rating,
    rating_delta: 0,
    current_streak: currentStreak,
    best_streak: currentStreak,
    points_for: pointsFor,
    points_against: pointsAgainst,
    average_points_for:
      matches.length === 0 ? 0 : Number((pointsFor / matches.length).toFixed(2)),
    average_points_against:
      matches.length === 0 ? 0 : Number((pointsAgainst / matches.length).toFixed(2)),
    verified_rate: matches.length === 0 ? 0 : 100,
    form: results.slice(0, 10),
    game_breakdown: [...grouped.entries()].map(([label, gameRows]) => {
      const gameResults = gameRows.map(resultFor);
      const gameWins = gameResults.filter((result) => result === "win").length;
      const gameLosses = gameResults.filter((result) => result === "loss").length;
      const gameDraws = gameResults.filter((result) => result === "draw").length;
      return {
        game_label: label,
        matches: gameRows.length,
        wins: gameWins,
        losses: gameLosses,
        draws: gameDraws,
        win_rate:
          gameRows.length === 0 ? 0 : Number(((gameWins / gameRows.length) * 100).toFixed(2)),
        rating,
        rating_delta: 0,
        best_streak: currentStreak,
      };
    }),
  };
}
