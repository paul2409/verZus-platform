// VERZUS M8.3 LEADERBOARD ADAPTER TESTS

import { describe, expect, it } from "vitest";

import {
  adaptLeaderboardEntriesPayload,
  adaptLeaderboardSummaryPayload,
  LeaderboardApiClientError,
} from "./leaderboard-api.adapter";

const meta = {
  server_now: "2026-07-17T10:00:00.000Z",
  last_updated_at: "2026-07-17T09:58:00.000Z",
  freshness: "fresh" as const,
};

const rawRow = {
  leaderboard_entry_id: "player-1",
  rank: 1,
  previous_rank: 3,
  movement: "up" as const,
  movement_delta: 2,
  entity_type: "player" as const,
  display_name: "Prismo",
  handle: "@prismo",
  initials: "PR",
  crew_name: "Xenon",
  country_code: "NG",
  game: "ea-fc" as const,
  scope: "friends" as const,
  wins: 128,
  losses: 36,
  win_rate: 78,
  points: 26750,
  streak: 7,
  trust: 97,
  tier: "champion" as const,
  member_count: null,
  is_current_user: false,
};

describe("leaderboard API adapters", () => {
  it("maps snake-case summary and entry payloads into domain contracts", () => {
    const summary = adaptLeaderboardSummaryPayload({
      ok: true,
      request_id: "req-summary",
      meta,
      data: {
        mode: "weekly",
        eyebrow: "Weekly player standings",
        title: "Weekly Leaderboard",
        description: "Verified performances.",
        period_label: "Week 12",
        countdown_label: "Ends in 03D",
        total_competitors: 12540,
        percentile_label: "Top 23%",
      },
    });
    const entries = adaptLeaderboardEntriesPayload({
      ok: true,
      request_id: "req-entries",
      meta,
      data: {
        items: [rawRow],
        page: 1,
        page_count: 1,
        total: 1,
        start_index: 1,
        end_index: 1,
        has_previous_page: false,
        has_next_page: false,
      },
    });

    expect(summary).toEqual(expect.objectContaining({ mode: "weekly", periodLabel: "Week 12" }));
    expect(entries.items[0]).toEqual(
      expect.objectContaining({ id: "player-1", previousRank: 3, winRate: 78 }),
    );
    expect(entries.meta.requestId).toBe("req-entries");
  });

  it("turns structured failures and malformed payloads into typed client errors", () => {
    expect(() =>
      adaptLeaderboardSummaryPayload({
        ok: false,
        error: {
          code: "leaderboard_unavailable",
          message: "Unavailable",
          request_id: "req-error",
          retryable: true,
          field_errors: {},
        },
      }),
    ).toThrowError(
      expect.objectContaining({ code: "leaderboard_unavailable", requestId: "req-error" }),
    );

    expect(() => adaptLeaderboardEntriesPayload({ ok: true, data: { broken: true } })).toThrowError(
      expect.any(LeaderboardApiClientError),
    );
  });
});
