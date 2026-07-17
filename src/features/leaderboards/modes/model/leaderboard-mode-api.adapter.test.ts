// VERZUS M8.4 MODE COMPOSITION ADAPTER TESTS

import { describe, expect, it } from "vitest";

import { adaptLeaderboardCompositionPayload } from "../../resources/api/leaderboard-api.adapter";

describe("leaderboard mode composition adapter", () => {
  it("adapts the snake-case mode contract into the domain composition", () => {
    const result = adaptLeaderboardCompositionPayload({
      ok: true,
      data: {
        mode: "crew",
        entity_type: "crew",
        ranking_basis: "Crew championship points",
        identity_label: "Crew",
        affiliation_label: "Members",
        points_label: "Championship points",
        current_position_label: "Your Crew rank",
        default_game: "all",
        allowed_games: ["all"],
        default_scope: "global",
        allowed_scopes: ["global", "friends"],
        default_sort: "rank",
        default_direction: "asc",
        desktop_columns: [
          { key: "rank", label: "Rank", alignment: "start" },
          { key: "identity", label: "Crew", alignment: "start" },
          { key: "points", label: "Championship points", alignment: "end" },
        ],
        mobile_primary_metric: "points",
        mobile_secondary_metrics: ["members", "win-rate"],
      },
      request_id: "req-mode-1",
      meta: {
        server_now: "2026-07-17T10:00:00.000Z",
        last_updated_at: "2026-07-17T09:58:00.000Z",
        freshness: "fresh",
      },
    });

    expect(result).toEqual(
      expect.objectContaining({
        mode: "crew",
        entityType: "crew",
        currentPositionLabel: "Your Crew rank",
        allowedGames: ["all"],
      }),
    );
    expect(result.meta.requestId).toBe("req-mode-1");
  });

  it("rejects malformed mode composition payloads", () => {
    expect(() => adaptLeaderboardCompositionPayload({ ok: true, data: {} })).toThrowError(
      expect.objectContaining({ code: "invalid_response" }),
    );
  });
});
