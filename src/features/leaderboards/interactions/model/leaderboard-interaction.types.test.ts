// VERZUS M8.8 LEADERBOARD INTERACTION TYPE TESTS

import { describe, expect, it } from "vitest";

import { leaderboardFoundationBoards } from "../../foundation/mocks/leaderboard-foundation.mock";
import {
  buildLeaderboardIntelHref,
  getLeaderboardRowInteractions,
  parseLeaderboardIntelSelection,
} from "./leaderboard-interaction.types";

describe("leaderboard interaction descriptors", () => {
  it("creates player, Crew and match descriptors from one ranked player", () => {
    const row = leaderboardFoundationBoards.weekly.rows[0]!;
    const interactions = getLeaderboardRowInteractions(row);

    expect(interactions.identity).toEqual(
      expect.objectContaining({ kind: "player", entityId: "player-prismo" }),
    );
    expect(interactions.affiliation).toEqual(
      expect.objectContaining({ kind: "crew", entityId: "crew-xenon" }),
    );
    expect(interactions.recentMatch).toEqual(
      expect.objectContaining({ kind: "match", fullRoute: "/matches/match-player-prismo" }),
    );
  });

  it("accepts only allowlisted deep-link selections", () => {
    expect(parseLeaderboardIntelSelection({ intel: "player", entityId: "player-prismo" })).toEqual({
      kind: "player",
      entityId: "player-prismo",
    });
    expect(
      parseLeaderboardIntelSelection({ intel: "admin", entityId: "player-prismo" }),
    ).toBeNull();
    expect(parseLeaderboardIntelSelection({ intel: "player", entityId: "../secret" })).toBeNull();
  });

  it("preserves leaderboard filters while opening and closing intel", () => {
    const opened = buildLeaderboardIntelHref("/leaderboards/weekly", "mode=game&game=ea-fc", {
      kind: "match",
      entityId: "match-player-prismo",
    });
    expect(opened).toContain("mode=game");
    expect(opened).toContain("intel=match");
    expect(buildLeaderboardIntelHref("/leaderboards/weekly", opened.split("?")[1]!, null)).toBe(
      "/leaderboards/weekly?mode=game&game=ea-fc",
    );
  });
});
