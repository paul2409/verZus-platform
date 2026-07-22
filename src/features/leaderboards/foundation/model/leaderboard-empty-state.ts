import type {
  LeaderboardEntityType,
  LeaderboardFoundationBoard,
  LeaderboardFoundationRow,
  LeaderboardMode,
} from "./leaderboard-foundation.types";

const modeCopy: Record<
  LeaderboardMode,
  { eyebrow: string; title: string; description: string; entityType: LeaderboardEntityType }
> = {
  weekly: {
    eyebrow: "Weekly standings",
    title: "Weekly leaderboard",
    description: "Confirmed weekly results will appear here.",
    entityType: "player",
  },
  pools: {
    eyebrow: "Pool standings",
    title: "Pool leaderboard",
    description: "Confirmed pool standings will appear here.",
    entityType: "pool",
  },
  game: {
    eyebrow: "Game rankings",
    title: "Game leaderboard",
    description: "Confirmed game-lane rankings will appear here.",
    entityType: "player",
  },
  crew: {
    eyebrow: "Crew championship",
    title: "Crew leaderboard",
    description: "Confirmed Crew standings will appear here.",
    entityType: "crew",
  },
  combine: {
    eyebrow: "Combine rankings",
    title: "Combine leaderboard",
    description: "Confirmed combine rankings will appear here.",
    entityType: "player",
  },
};

function unrankedEntry(mode: LeaderboardMode): LeaderboardFoundationRow {
  return {
    id: `unranked-${mode}`,
    rank: 0,
    previousRank: null,
    movement: "same",
    movementDelta: null,
    entityType: modeCopy[mode].entityType,
    name: "Unranked",
    handle: "No confirmed position",
    initials: "--",
    crewName: null,
    countryCode: "--",
    game: "ea-fc",
    scope: "global",
    wins: 0,
    losses: 0,
    winRate: 0,
    points: 0,
    streak: 0,
    trust: 0,
    tier: "bronze",
    memberCount: mode === "crew" ? 0 : null,
    isCurrentUser: true,
  };
}

export const emptyLeaderboardBoards: Record<LeaderboardMode, LeaderboardFoundationBoard> = {
  weekly: createEmptyBoard("weekly"),
  pools: createEmptyBoard("pools"),
  game: createEmptyBoard("game"),
  crew: createEmptyBoard("crew"),
  combine: createEmptyBoard("combine"),
};

function createEmptyBoard(mode: LeaderboardMode): LeaderboardFoundationBoard {
  const copy = modeCopy[mode];
  return {
    mode,
    eyebrow: copy.eyebrow,
    title: copy.title,
    description: copy.description,
    periodLabel: "No active period",
    countdownLabel: "Awaiting confirmed results",
    totalCompetitors: 0,
    percentileLabel: "Unranked",
    rows: [],
    currentEntry: unrankedEntry(mode),
    rewards: [],
  };
}
