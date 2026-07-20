// VERZUS M11.5 SERVER-AUTHORITATIVE MATCH HISTORY READ MODELS

import type {
  PlayerHistoryGameFilter,
  PlayerHistoryResultFilter,
  PlayerHistoryScenario,
  PlayerStatisticsWindow,
} from "../model/player-history.types";

type MatchFixture = {
  id: string;
  opponentId: string;
  opponentLabel: string;
  gameLabel: "EA FC 26" | "Call of Duty" | "NBA 2K26";
  competitionLabel: string;
  scoreFor: number;
  scoreAgainst: number;
  result: "win" | "loss" | "draw";
  playedAt: string;
  playedAtLabel: string;
  durationMinutes: number;
  rankDelta: number;
  trustDelta: number;
  verified: boolean;
};

const matchFixtures: readonly MatchFixture[] = [
  {
    id: "match-prismo-018",
    opponentId: "player-ghosty",
    opponentLabel: "Ghosty",
    gameLabel: "EA FC 26",
    competitionLabel: "Friday Night Open",
    scoreFor: 4,
    scoreAgainst: 2,
    result: "win",
    playedAt: "2026-07-18T20:15:00.000Z",
    playedAtLabel: "18 Jul 2026",
    durationMinutes: 18,
    rankDelta: 22,
    trustDelta: 1,
    verified: true,
  },
  {
    id: "match-prismo-017",
    opponentId: "player-rivalking",
    opponentLabel: "RivalKing",
    gameLabel: "EA FC 26",
    competitionLabel: "Season Zero Weekly",
    scoreFor: 3,
    scoreAgainst: 1,
    result: "win",
    playedAt: "2026-07-16T19:30:00.000Z",
    playedAtLabel: "16 Jul 2026",
    durationMinutes: 17,
    rankDelta: 18,
    trustDelta: 0,
    verified: true,
  },
  {
    id: "match-prismo-016",
    opponentId: "player-nox",
    opponentLabel: "Nox",
    gameLabel: "Call of Duty",
    competitionLabel: "Tactical Ladder",
    scoreFor: 148,
    scoreAgainst: 151,
    result: "loss",
    playedAt: "2026-07-13T18:40:00.000Z",
    playedAtLabel: "13 Jul 2026",
    durationMinutes: 24,
    rankDelta: -12,
    trustDelta: 0,
    verified: true,
  },
  {
    id: "match-prismo-015",
    opponentId: "player-arc",
    opponentLabel: "ArcFlash",
    gameLabel: "NBA 2K26",
    competitionLabel: "Courtside Clash",
    scoreFor: 72,
    scoreAgainst: 68,
    result: "win",
    playedAt: "2026-07-10T21:00:00.000Z",
    playedAtLabel: "10 Jul 2026",
    durationMinutes: 31,
    rankDelta: 16,
    trustDelta: 1,
    verified: true,
  },
  {
    id: "match-prismo-014",
    opponentId: "player-lumina",
    opponentLabel: "Lumina",
    gameLabel: "EA FC 26",
    competitionLabel: "Pool B Qualifier",
    scoreFor: 2,
    scoreAgainst: 2,
    result: "draw",
    playedAt: "2026-07-07T18:10:00.000Z",
    playedAtLabel: "7 Jul 2026",
    durationMinutes: 19,
    rankDelta: 2,
    trustDelta: 0,
    verified: true,
  },
  {
    id: "match-prismo-013",
    opponentId: "player-koda",
    opponentLabel: "Koda",
    gameLabel: "EA FC 26",
    competitionLabel: "Season Zero Weekly",
    scoreFor: 5,
    scoreAgainst: 0,
    result: "win",
    playedAt: "2026-07-04T17:20:00.000Z",
    playedAtLabel: "4 Jul 2026",
    durationMinutes: 16,
    rankDelta: 24,
    trustDelta: 1,
    verified: true,
  },
  {
    id: "match-prismo-012",
    opponentId: "player-vanta",
    opponentLabel: "Vanta",
    gameLabel: "Call of Duty",
    competitionLabel: "Tactical Ladder",
    scoreFor: 166,
    scoreAgainst: 158,
    result: "win",
    playedAt: "2026-06-29T19:45:00.000Z",
    playedAtLabel: "29 Jun 2026",
    durationMinutes: 27,
    rankDelta: 15,
    trustDelta: 0,
    verified: true,
  },
  {
    id: "match-prismo-011",
    opponentId: "player-jett",
    opponentLabel: "Jett",
    gameLabel: "NBA 2K26",
    competitionLabel: "Courtside Clash",
    scoreFor: 61,
    scoreAgainst: 69,
    result: "loss",
    playedAt: "2026-06-25T20:30:00.000Z",
    playedAtLabel: "25 Jun 2026",
    durationMinutes: 29,
    rankDelta: -14,
    trustDelta: 0,
    verified: true,
  },
  {
    id: "match-prismo-010",
    opponentId: "player-nyx",
    opponentLabel: "Nyx",
    gameLabel: "EA FC 26",
    competitionLabel: "Pool B Qualifier",
    scoreFor: 1,
    scoreAgainst: 0,
    result: "win",
    playedAt: "2026-06-21T16:50:00.000Z",
    playedAtLabel: "21 Jun 2026",
    durationMinutes: 18,
    rankDelta: 11,
    trustDelta: 1,
    verified: true,
  },
  {
    id: "match-prismo-009",
    opponentId: "player-storm",
    opponentLabel: "Stormbyte",
    gameLabel: "EA FC 26",
    competitionLabel: "Season Zero Weekly",
    scoreFor: 1,
    scoreAgainst: 3,
    result: "loss",
    playedAt: "2026-06-18T18:00:00.000Z",
    playedAtLabel: "18 Jun 2026",
    durationMinutes: 20,
    rankDelta: -17,
    trustDelta: 0,
    verified: true,
  },
  {
    id: "match-prismo-008",
    opponentId: "player-bishop",
    opponentLabel: "Bishop",
    gameLabel: "Call of Duty",
    competitionLabel: "Tactical Ladder",
    scoreFor: 154,
    scoreAgainst: 154,
    result: "draw",
    playedAt: "2026-06-13T21:20:00.000Z",
    playedAtLabel: "13 Jun 2026",
    durationMinutes: 26,
    rankDelta: 1,
    trustDelta: 0,
    verified: true,
  },
  {
    id: "match-prismo-007",
    opponentId: "player-orbit",
    opponentLabel: "Orbit",
    gameLabel: "NBA 2K26",
    competitionLabel: "Courtside Clash",
    scoreFor: 78,
    scoreAgainst: 74,
    result: "win",
    playedAt: "2026-06-09T19:10:00.000Z",
    playedAtLabel: "9 Jun 2026",
    durationMinutes: 32,
    rankDelta: 14,
    trustDelta: 1,
    verified: true,
  },
  {
    id: "match-prismo-006",
    opponentId: "player-kairo",
    opponentLabel: "Kairo",
    gameLabel: "EA FC 26",
    competitionLabel: "Friday Night Open",
    scoreFor: 2,
    scoreAgainst: 0,
    result: "win",
    playedAt: "2026-06-03T20:00:00.000Z",
    playedAtLabel: "3 Jun 2026",
    durationMinutes: 17,
    rankDelta: 13,
    trustDelta: 0,
    verified: true,
  },
  {
    id: "match-prismo-005",
    opponentId: "player-ember",
    opponentLabel: "Ember",
    gameLabel: "EA FC 26",
    competitionLabel: "Pool B Qualifier",
    scoreFor: 0,
    scoreAgainst: 1,
    result: "loss",
    playedAt: "2026-05-28T18:30:00.000Z",
    playedAtLabel: "28 May 2026",
    durationMinutes: 18,
    rankDelta: -10,
    trustDelta: -1,
    verified: true,
  },
  {
    id: "match-prismo-004",
    opponentId: "player-sable",
    opponentLabel: "Sable",
    gameLabel: "Call of Duty",
    competitionLabel: "Tactical Ladder",
    scoreFor: 172,
    scoreAgainst: 164,
    result: "win",
    playedAt: "2026-05-22T20:45:00.000Z",
    playedAtLabel: "22 May 2026",
    durationMinutes: 25,
    rankDelta: 12,
    trustDelta: 1,
    verified: true,
  },
  {
    id: "match-prismo-003",
    opponentId: "player-rune",
    opponentLabel: "Rune",
    gameLabel: "NBA 2K26",
    competitionLabel: "Courtside Clash",
    scoreFor: 65,
    scoreAgainst: 65,
    result: "draw",
    playedAt: "2026-05-16T19:35:00.000Z",
    playedAtLabel: "16 May 2026",
    durationMinutes: 30,
    rankDelta: 0,
    trustDelta: 0,
    verified: false,
  },
  {
    id: "match-prismo-002",
    opponentId: "player-zenith",
    opponentLabel: "Zenith",
    gameLabel: "EA FC 26",
    competitionLabel: "Season Zero Weekly",
    scoreFor: 3,
    scoreAgainst: 2,
    result: "win",
    playedAt: "2026-05-09T17:40:00.000Z",
    playedAtLabel: "9 May 2026",
    durationMinutes: 19,
    rankDelta: 17,
    trustDelta: 1,
    verified: true,
  },
  {
    id: "match-prismo-001",
    opponentId: "player-echo",
    opponentLabel: "Echo",
    gameLabel: "EA FC 26",
    competitionLabel: "Season Zero Weekly",
    scoreFor: 1,
    scoreAgainst: 2,
    result: "loss",
    playedAt: "2026-05-02T18:15:00.000Z",
    playedAtLabel: "2 May 2026",
    durationMinutes: 18,
    rankDelta: -13,
    trustDelta: 0,
    verified: true,
  },
];

export function normalizePlayerHistoryScenario(value: string | null): PlayerHistoryScenario {
  const allowed: PlayerHistoryScenario[] = [
    "normal",
    "stale",
    "empty",
    "error",
    "offline",
    "slow",
    "malformed",
    "unauthorized",
    "forbidden",
    "not-found",
    "maintenance",
  ];
  return allowed.includes(value as PlayerHistoryScenario)
    ? (value as PlayerHistoryScenario)
    : "normal";
}

export function normalizePlayerHistoryGame(value: string | null): PlayerHistoryGameFilter {
  const allowed: PlayerHistoryGameFilter[] = ["all", "EA FC 26", "Call of Duty", "NBA 2K26"];
  return allowed.includes(value as PlayerHistoryGameFilter)
    ? (value as PlayerHistoryGameFilter)
    : "all";
}

export function normalizePlayerHistoryResult(value: string | null): PlayerHistoryResultFilter {
  const allowed: PlayerHistoryResultFilter[] = ["all", "win", "loss", "draw"];
  return allowed.includes(value as PlayerHistoryResultFilter)
    ? (value as PlayerHistoryResultFilter)
    : "all";
}

export function normalizePlayerStatisticsWindow(value: string | null): PlayerStatisticsWindow {
  const allowed: PlayerStatisticsWindow[] = ["season", "30d", "7d"];
  return allowed.includes(value as PlayerStatisticsWindow)
    ? (value as PlayerStatisticsWindow)
    : "season";
}

export function normalizePlayerHistoryPage(value: string | null): number {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function selectWindow(matches: readonly MatchFixture[], window: PlayerStatisticsWindow) {
  if (window === "7d") return matches.slice(0, 4);
  if (window === "30d") return matches.slice(0, 10);
  return matches;
}

function calculateCurrentWinStreak(matches: readonly MatchFixture[]): number {
  let total = 0;
  for (const match of matches) {
    if (match.result !== "win") break;
    total += 1;
  }
  return total;
}

function calculateBestWinStreak(matches: readonly MatchFixture[]): number {
  let best = 0;
  let current = 0;
  for (const match of [...matches].reverse()) {
    if (match.result === "win") {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  }
  return best;
}

function ratingForGame(game: PlayerHistoryGameFilter): number {
  switch (game) {
    case "EA FC 26":
      return 2184;
    case "Call of Duty":
      return 1742;
    case "NBA 2K26":
      return 1658;
    default:
      return 2056;
  }
}

export function serializePlayerMatchHistory(input: {
  scenario: PlayerHistoryScenario;
  game: PlayerHistoryGameFilter;
  result: PlayerHistoryResultFilter;
  page: number;
  pageSize: number;
  requestId: string;
}) {
  const filtered = matchFixtures.filter((match) => {
    const gameMatches = input.game === "all" || match.gameLabel === input.game;
    const resultMatches = input.result === "all" || match.result === input.result;
    return gameMatches && resultMatches;
  });

  const totalItems = input.scenario === "empty" ? 0 : filtered.length;
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / input.pageSize);
  const safePage = totalPages === 0 ? 1 : Math.min(input.page, totalPages);
  const start = (safePage - 1) * input.pageSize;
  const items = input.scenario === "empty" ? [] : filtered.slice(start, start + input.pageSize);

  return {
    items: items.map((match) => ({
      id: match.id,
      opponent_id: match.opponentId,
      opponent_label: match.opponentLabel,
      game_label: match.gameLabel,
      competition_label: match.competitionLabel,
      score_for: match.scoreFor,
      score_against: match.scoreAgainst,
      result: match.result,
      played_at: match.playedAt,
      played_at_label: match.playedAtLabel,
      duration_minutes: match.durationMinutes,
      rank_delta: match.rankDelta,
      trust_delta: match.trustDelta,
      verified: match.verified,
      match_href: `/matches/${match.id}`,
      opponent_href: `/players/${match.opponentId}`,
    })),
    page: safePage,
    page_size: input.pageSize,
    total_items: totalItems,
    total_pages: totalPages,
    filters: { game: input.game, result: input.result },
    request_id: input.requestId,
    fetched_at: new Date().toISOString(),
    freshness: input.scenario === "stale" ? "stale" : "fresh",
  };
}

export function serializePlayerDetailedStatistics(input: {
  scenario: PlayerHistoryScenario;
  game: PlayerHistoryGameFilter;
  window: PlayerStatisticsWindow;
  requestId: string;
}) {
  const windowMatches = selectWindow(matchFixtures, input.window);
  const filtered = windowMatches.filter(
    (match) => input.game === "all" || match.gameLabel === input.game,
  );
  const matches = input.scenario === "empty" ? [] : filtered;
  const wins = matches.filter((match) => match.result === "win").length;
  const losses = matches.filter((match) => match.result === "loss").length;
  const draws = matches.filter((match) => match.result === "draw").length;
  const pointsFor = matches.reduce((total, match) => total + match.scoreFor, 0);
  const pointsAgainst = matches.reduce((total, match) => total + match.scoreAgainst, 0);
  const verified = matches.filter((match) => match.verified).length;
  const games = ["EA FC 26", "Call of Duty", "NBA 2K26"] as const;

  return {
    window: input.window,
    game: input.game,
    matches: matches.length,
    wins,
    losses,
    draws,
    win_rate: matches.length === 0 ? 0 : Number(((wins / matches.length) * 100).toFixed(1)),
    rating: ratingForGame(input.game),
    rating_delta: matches.reduce((total, match) => total + match.rankDelta, 0),
    current_streak: calculateCurrentWinStreak(matches),
    best_streak: calculateBestWinStreak(matches),
    points_for: pointsFor,
    points_against: pointsAgainst,
    average_points_for: matches.length === 0 ? 0 : Number((pointsFor / matches.length).toFixed(1)),
    average_points_against:
      matches.length === 0 ? 0 : Number((pointsAgainst / matches.length).toFixed(1)),
    verified_rate:
      matches.length === 0 ? 0 : Number(((verified / matches.length) * 100).toFixed(1)),
    form: matches.slice(0, 10).map((match) => match.result),
    game_breakdown: games.map((game) => {
      const gameMatches = windowMatches.filter((match) => match.gameLabel === game);
      const gameWins = gameMatches.filter((match) => match.result === "win").length;
      const gameLosses = gameMatches.filter((match) => match.result === "loss").length;
      const gameDraws = gameMatches.filter((match) => match.result === "draw").length;
      return {
        game_label: game,
        matches: gameMatches.length,
        wins: gameWins,
        losses: gameLosses,
        draws: gameDraws,
        win_rate:
          gameMatches.length === 0 ? 0 : Number(((gameWins / gameMatches.length) * 100).toFixed(1)),
        rating: ratingForGame(game),
        rating_delta: gameMatches.reduce((total, match) => total + match.rankDelta, 0),
        best_streak: calculateBestWinStreak(gameMatches),
      };
    }),
    request_id: input.requestId,
    fetched_at: new Date().toISOString(),
    freshness: input.scenario === "stale" ? "stale" : "fresh",
  };
}
