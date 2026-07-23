import { describe, expect, it } from "vitest";

import type { SmartDefaultsSources } from "./smart-defaults.repository";
import { buildSmartDefaultsSnapshot } from "./smart-defaults.service";

function sources(overrides: Partial<SmartDefaultsSources> = {}): SmartDefaultsSources {
  return {
    profile: {
      country_code: "NG",
      region: "Lagos",
      city: "Lagos",
      timezone: "Africa/Lagos",
    },
    identity: {
      game_id: "ea-sports-fc",
      game_name: "EA Sports FC",
      game_filter: "ea-fc",
      platform: "playstation",
      platform_handle: "BoydFC",
    },
    availability: [
      {
        day_of_week: "saturday",
        start_time: "18:00:00",
        end_time: "22:00:00",
        timezone: "Africa/Lagos",
      },
    ],
    preferences: null,
    recentSearchDomain: null,
    ...overrides,
  };
}

describe("buildSmartDefaultsSnapshot", () => {
  it("derives safe defaults from the player's authoritative profile", () => {
    const snapshot = buildSmartDefaultsSnapshot(sources(), new Date("2026-07-23T12:00:00.000Z"));

    expect(snapshot.competition.game).toBe("ea-fc");
    expect(snapshot.leaderboard.game).toBe("ea-fc");
    expect(snapshot.crewCreation).toEqual({ primaryGame: "EA FC", region: "Nigeria" });
    expect(snapshot.availability[0]).toMatchObject({ startTime: "18:00", endTime: "22:00" });
    expect(snapshot.sources.competitionGame).toBe("profile");
  });

  it("keeps explicit preferences ahead of inferred values", () => {
    const snapshot = buildSmartDefaultsSnapshot(
      sources({
        preferences: {
          competition_game: "all",
          competition_sort: "availability",
          leaderboard_mode: "crew",
          leaderboard_game: "all",
          search_domain: "crews",
          version: 4,
        },
      }),
    );

    expect(snapshot.version).toBe(4);
    expect(snapshot.competition).toMatchObject({ game: "all", sort: "availability" });
    expect(snapshot.leaderboard).toEqual({ mode: "crew", game: "all" });
    expect(snapshot.search.domain).toBe("crews");
    expect(snapshot.sources.leaderboardMode).toBe("explicit");
  });

  it("uses search history without inventing identity data", () => {
    const snapshot = buildSmartDefaultsSnapshot(
      sources({ profile: null, identity: null, availability: [], recentSearchDomain: "players" }),
    );

    expect(snapshot.identity).toBeNull();
    expect(snapshot.crewCreation).toBeNull();
    expect(snapshot.competition.game).toBe("all");
    expect(snapshot.search.domain).toBe("players");
    expect(snapshot.sources.searchDomain).toBe("history");
  });
});
