// VERZUS M5 STEPS 5.1-5.4

import { describe, expect, it } from "vitest";

import type { CrewSummary, CurrentCheckIn, NextMatch, RecommendedCompetition } from "./play.schema";
import { derivePlayScreenVariant } from "./play-state";

const now = "2026-07-15T18:00:00.000Z";

const nextMatch: NextMatch = {
  matchId: "match-001",
  competitionId: "competition-001",
  competitionName: "EA FC Weekly Pool",
  game: "EA SPORTS FC",
  format: "1v1 · Best of 3",
  status: "scheduled",
  startsAt: "2026-07-15T19:00:00.000Z",
  checkInOpensAt: "2026-07-15T18:15:00.000Z",
  checkInClosesAt: "2026-07-15T18:55:00.000Z",
  serverNow: now,
  self: {
    playerId: "player-001",
    handle: "JAYFLEX",
    avatarUrl: null,
    rank: 42,
    locationLabel: "Lagos",
    isCurrentPlayer: true,
  },
  opponent: {
    playerId: "player-002",
    handle: "R3DSTORM",
    avatarUrl: null,
    rank: 31,
    locationLabel: "Lagos",
    isCurrentPlayer: false,
  },
};

const checkIn: CurrentCheckIn = {
  matchId: "match-001",
  state: "unavailable",
  opensAt: "2026-07-15T18:15:00.000Z",
  closesAt: "2026-07-15T18:55:00.000Z",
  checkedInAt: null,
  serverNow: now,
  canCheckIn: false,
  mutationKey: null,
};

const crew: CrewSummary = {
  crewId: "crew-001",
  name: "Mainland Titans",
  tag: "MT",
  emblemUrl: null,
  rank: 2,
  points: 2285,
  onlineMembers: 6,
  totalMembers: 8,
  liveActivityCount: 0,
  nextFixtureLabel: "vs Lagos Lynx",
  nextFixtureAt: "2026-07-19T17:00:00.000Z",
  lastUpdatedAt: now,
};

const opportunity: RecommendedCompetition = {
  competitionId: "competition-002",
  title: "Friday Fight Night",
  game: "EA SPORTS FC",
  format: "1v1 knockout",
  startsAt: "2026-07-17T18:00:00.000Z",
  registrationClosesAt: "2026-07-17T16:00:00.000Z",
  entryLabel: "Free entry",
  eligibilityLabel: "Verified players",
  rewardLabel: "500 VS Credits",
  isFeatured: true,
};

function baseInput() {
  return {
    online: true,
    nextMatch,
    checkIn,
    crew,
    recommendedCompetitions: [] as readonly RecommendedCompetition[],
    failedWidgets: [] as const,
  };
}

describe("derivePlayScreenVariant", () => {
  it("prioritizes offline and partial failure states", () => {
    expect(derivePlayScreenVariant({ ...baseInput(), online: false })).toBe("offline");
    expect(derivePlayScreenVariant({ ...baseInput(), failedWidgets: ["crew-pulse"] })).toBe(
      "partial_api_failure",
    );
  });

  it("derives the match-action states", () => {
    expect(
      derivePlayScreenVariant({
        ...baseInput(),
        nextMatch: { ...nextMatch, status: "starting_soon" },
      }),
    ).toBe("match_starting_soon");

    expect(
      derivePlayScreenVariant({
        ...baseInput(),
        checkIn: { ...checkIn, state: "checked_in", checkedInAt: now },
      }),
    ).toBe("checked_in");

    expect(
      derivePlayScreenVariant({
        ...baseInput(),
        checkIn: { ...checkIn, state: "open", canCheckIn: true },
      }),
    ).toBe("check_in_open");
  });

  it("derives empty, Crew, and opportunity states", () => {
    expect(derivePlayScreenVariant({ ...baseInput(), nextMatch: null })).toBe("no_match_scheduled");
    expect(
      derivePlayScreenVariant({
        ...baseInput(),
        crew: { ...crew, liveActivityCount: 2 },
      }),
    ).toBe("crew_activity_present");
    expect(derivePlayScreenVariant({ ...baseInput(), crew: null })).toBe("no_crew");
    expect(
      derivePlayScreenVariant({
        ...baseInput(),
        recommendedCompetitions: [opportunity],
      }),
    ).toBe("opportunities_available");
  });

  it("falls back to normal", () => {
    expect(derivePlayScreenVariant(baseInput())).toBe("normal");
  });
});
