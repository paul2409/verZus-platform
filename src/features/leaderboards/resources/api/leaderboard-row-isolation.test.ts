// VERZUS M8.6 LEADERBOARD MALFORMED ROW ISOLATION TESTS

import { describe, expect, it } from "vitest";

import { adaptLeaderboardEntriesPayload } from "./leaderboard-api.adapter";

const validRow = {
  leaderboard_entry_id: "valid-player",
  rank: 1,
  previous_rank: 2,
  movement: "up",
  movement_delta: 1,
  entity_type: "player",
  display_name: "Valid Player",
  handle: "@valid",
  initials: "VP",
  crew_name: "Xenon",
  country_code: "NG",
  game: "ea-fc",
  scope: "global",
  wins: 10,
  losses: 2,
  win_rate: 83,
  points: 1200,
  streak: 3,
  trust: 95,
  tier: "diamond",
  member_count: null,
  is_current_user: false,
};

const meta = {
  server_now: "2026-07-17T10:00:00.000Z",
  last_updated_at: "2026-07-17T09:58:00.000Z",
  freshness: "fresh",
};

describe("leaderboard row isolation", () => {
  it("omits one malformed row without rejecting valid rankings", () => {
    const data = adaptLeaderboardEntriesPayload({
      ok: true,
      request_id: "req-row-isolation",
      meta,
      data: {
        items: [
          validRow,
          {
            ...validRow,
            leaderboard_entry_id: "corrupt-player",
            rank: "not-a-number",
          },
        ],
        page: 1,
        page_count: 1,
        total: 2,
        start_index: 1,
        end_index: 2,
        has_previous_page: false,
        has_next_page: false,
      },
    });

    expect(data.items).toHaveLength(1);
    expect(data.items[0]?.id).toBe("valid-player");
    expect(data.isolatedRowCount).toBe(1);
    expect(data.isolatedRowIds).toEqual(["corrupt-player"]);
  });
});
