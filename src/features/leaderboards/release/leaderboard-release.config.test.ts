// VERZUS M8.10 LEADERBOARD RELEASE CONFIGURATION TESTS

import { describe, expect, it } from "vitest";

import { getLeaderboardReleaseConfig } from "./leaderboard-release.config";

describe("leaderboard release configuration", () => {
  it("keeps M8 enabled by default for local and preview environments", () => {
    expect(getLeaderboardReleaseConfig({})).toEqual({
      appEnvironment: "local",
      releaseSha: "development",
      leaderboardsEnabled: true,
      entityIntelEnabled: true,
    });
  });

  it("supports independent leaderboard and entity-intel disablement", () => {
    expect(
      getLeaderboardReleaseConfig({
        NEXT_PUBLIC_APP_ENV: "production",
        NEXT_PUBLIC_RELEASE_SHA: "sha-123",
        NEXT_PUBLIC_ENABLE_M8_LEADERBOARDS: "false",
        NEXT_PUBLIC_ENABLE_M8_ENTITY_INTEL: "false",
      }),
    ).toEqual({
      appEnvironment: "production",
      releaseSha: "sha-123",
      leaderboardsEnabled: false,
      entityIntelEnabled: false,
    });
  });
});
