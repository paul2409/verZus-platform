// VERZUS M5 STEPS 5.1-5.4

import type {
  CrewSummaryRaw,
  CurrentCheckInRaw,
  CurrentPositionRaw,
  NextMatchRaw,
  PlayerStatusRaw,
  RecentActivityItemRaw,
  RecommendedCompetitionRaw,
} from "../api";
import type { PlayScenario } from "../model";

export interface MockPlaySnapshot {
  playerStatus: PlayerStatusRaw;
  nextMatch: NextMatchRaw | null;
  currentCheckIn: CurrentCheckInRaw;
  currentPosition: CurrentPositionRaw;
  crewSummary: CrewSummaryRaw | null;
  recommendedCompetitions: RecommendedCompetitionRaw[];
  recentActivity: RecentActivityItemRaw[];
}

const serverNow = "2026-07-15T18:00:00.000Z";
const startsAt = "2026-07-15T19:00:00.000Z";
const checkInOpensAt = "2026-07-15T18:15:00.000Z";
const checkInClosesAt = "2026-07-15T18:55:00.000Z";

const playerStatus: PlayerStatusRaw = {
  player_id: "mock-player-001",
  handle: "JAYFLEX",
  display_name: "Jay Flex",
  avatar_url: null,
  primary_game: "EA SPORTS FC",
  game_lane: "EA FC",
  location_label: "Lagos · UNILAG",
  trust_score: 91,
  trust_tier: "verified",
  week_label: "Week 14",
  unread_notifications: 4,
  last_updated_at: serverNow,
};

const baseNextMatch: NextMatchRaw = {
  match_id: "match-week-14-001",
  competition_id: "ea-fc-weekly-pool-14",
  competition_name: "EA FC Weekly Pool · Week 14",
  game: "EA SPORTS FC",
  format: "1v1 · Best of 3",
  status: "scheduled",
  starts_at: startsAt,
  check_in_opens_at: checkInOpensAt,
  check_in_closes_at: checkInClosesAt,
  server_now: serverNow,
  self: {
    player_id: "mock-player-001",
    handle: "JAYFLEX",
    avatar_url: null,
    rank: 42,
    location_label: "Lagos · UNILAG",
    is_current_player: true,
  },
  opponent: {
    player_id: "mock-player-002",
    handle: "R3DSTORM",
    avatar_url: null,
    rank: 31,
    location_label: "Lagos",
    is_current_player: false,
  },
};

const baseCheckIn: CurrentCheckInRaw = {
  match_id: baseNextMatch.match_id,
  state: "unavailable",
  opens_at: checkInOpensAt,
  closes_at: checkInClosesAt,
  checked_in_at: null,
  server_now: serverNow,
  can_check_in: false,
  mutation_key: null,
};

const currentPosition: CurrentPositionRaw = {
  leaderboard_id: "ea-fc-weekly-14",
  week_label: "Week 14",
  rank: 17,
  previous_rank: 21,
  movement: "up",
  points: 2310,
  target_points: 2500,
  wins: 24,
  losses: 7,
  win_rate: 77.4,
  streak: "W7",
  tier: "Elite",
  last_updated_at: serverNow,
};

const baseCrew: CrewSummaryRaw = {
  crew_id: "mainland-titans",
  name: "Mainland Titans",
  tag: "MT",
  emblem_url: null,
  rank: 2,
  points: 2285,
  online_members: 6,
  total_members: 8,
  live_activity_count: 0,
  next_fixture_label: "Mainland Titans vs Lagos Lynx",
  next_fixture_at: "2026-07-19T17:00:00.000Z",
  last_updated_at: serverNow,
};

const standardOpportunities: RecommendedCompetitionRaw[] = [
  {
    competition_id: "rookie-cup-14",
    title: "EA FC Rookie Cup",
    game: "EA SPORTS FC",
    format: "1v1 knockout",
    starts_at: "2026-07-18T17:00:00.000Z",
    registration_closes_at: "2026-07-18T15:00:00.000Z",
    entry_label: "Free entry",
    eligibility_label: "Bronze and Silver",
    reward_label: "750 Bonus VS Credits",
    is_featured: false,
  },
  {
    competition_id: "friday-fight-night-14",
    title: "Friday Fight Night",
    game: "EA SPORTS FC",
    format: "1v1 grudge bracket",
    starts_at: "2026-07-17T19:00:00.000Z",
    registration_closes_at: "2026-07-17T17:00:00.000Z",
    entry_label: "VS Pass eligible",
    eligibility_label: "Verified EA FC players",
    reward_label: "1,500 VS Credits",
    is_featured: false,
  },
];

const recentActivity: RecentActivityItemRaw[] = [
  {
    activity_id: "activity-001",
    type: "match_win",
    title: "Win vs FEMISKILLZ",
    detail: "3-1 · Ranked EA FC",
    occurred_at: "2026-07-15T16:10:00.000Z",
    points_delta: 320,
    href: "/matches/match-recent-001",
  },
  {
    activity_id: "activity-002",
    type: "rank_change",
    title: "Weekly rank moved up",
    detail: "#21 to #17",
    occurred_at: "2026-07-15T14:30:00.000Z",
    points_delta: null,
    href: "/leaderboards",
  },
  {
    activity_id: "activity-003",
    type: "crew_update",
    title: "Crew War roster updated",
    detail: "Mainland Titans · EA FC lane",
    occurred_at: "2026-07-15T12:00:00.000Z",
    points_delta: null,
    href: "/crews/mainland-titans",
  },
];

function nextMatchForScenario(scenario: PlayScenario): NextMatchRaw | null {
  if (scenario === "no_match_scheduled") {
    return null;
  }

  if (scenario === "check_in_open") {
    return { ...baseNextMatch, status: "check_in_open" };
  }

  if (scenario === "checked_in") {
    return { ...baseNextMatch, status: "checked_in" };
  }

  if (scenario === "match_starting_soon") {
    return {
      ...baseNextMatch,
      status: "starting_soon",
      starts_at: "2026-07-15T18:08:00.000Z",
      check_in_closes_at: "2026-07-15T18:05:00.000Z",
    };
  }

  return { ...baseNextMatch };
}

function checkInForScenario(scenario: PlayScenario): CurrentCheckInRaw {
  if (scenario === "no_match_scheduled") {
    return {
      match_id: null,
      state: "unavailable",
      opens_at: null,
      closes_at: null,
      checked_in_at: null,
      server_now: serverNow,
      can_check_in: false,
      mutation_key: null,
    };
  }

  if (scenario === "check_in_open") {
    return {
      ...baseCheckIn,
      state: "open",
      can_check_in: true,
      mutation_key: "check-in-match-week-14-001",
    };
  }

  if (scenario === "checked_in" || scenario === "match_starting_soon") {
    return {
      ...baseCheckIn,
      state: "checked_in",
      checked_in_at: "2026-07-15T17:58:00.000Z",
      can_check_in: false,
      mutation_key: "check-in-match-week-14-001",
    };
  }

  return { ...baseCheckIn };
}

export function getMockPlaySnapshot(scenario: PlayScenario): MockPlaySnapshot {
  const crewSummary = scenario === "no_crew" ? null : { ...baseCrew };

  if (crewSummary && scenario === "crew_activity_present") {
    crewSummary.live_activity_count = 3;
  }

  const recommendedCompetitions = standardOpportunities.map((competition, index) => ({
    ...competition,
    is_featured: scenario === "opportunities_available" && index === 0,
  }));

  return {
    playerStatus: { ...playerStatus },
    nextMatch: nextMatchForScenario(scenario),
    currentCheckIn: checkInForScenario(scenario),
    currentPosition: { ...currentPosition },
    crewSummary,
    recommendedCompetitions,
    recentActivity: recentActivity.map((item) => ({ ...item })),
  };
}
