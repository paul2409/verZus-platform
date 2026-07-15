// VERZUS M5 STEPS 5.1-5.4

import { describe, expect, it } from "vitest";

import {
  adaptCrewSummaryPayload,
  adaptNextMatchPayload,
  adaptPlayerStatusPayload,
  PlayApiClientError,
} from "./play-api.adapter";

describe("Play API adapters", () => {
  it("adapts snake-case player status into the domain contract", () => {
    const status = adaptPlayerStatusPayload({
      ok: true,
      request_id: "request-001",
      data: {
        player_id: "player-001",
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
        last_updated_at: "2026-07-15T18:00:00.000Z",
      },
    });

    expect(status.playerId).toBe("player-001");
    expect(status.trustScore).toBe(91);
    expect(status.unreadNotifications).toBe(4);
  });

  it("supports legitimate empty next-match and Crew responses", () => {
    expect(adaptNextMatchPayload({ ok: true, request_id: "request-002", data: null })).toBeNull();
    expect(adaptCrewSummaryPayload({ ok: true, request_id: "request-003", data: null })).toBeNull();
  });

  it("maps structured API failures", () => {
    expect(() =>
      adaptPlayerStatusPayload({
        ok: false,
        error: {
          code: "maintenance",
          message: "Player status is temporarily unavailable.",
          request_id: "request-004",
          retryable: true,
          field_errors: {},
        },
      }),
    ).toThrowError(PlayApiClientError);

    try {
      adaptPlayerStatusPayload({
        ok: false,
        error: {
          code: "maintenance",
          message: "Player status is temporarily unavailable.",
          request_id: "request-004",
          retryable: true,
          field_errors: {},
        },
      });
    } catch (error) {
      expect(error).toMatchObject({
        code: "maintenance",
        requestId: "request-004",
        retryable: true,
      });
    }
  });

  it("rejects malformed responses before they enter the query cache", () => {
    expect(() => adaptPlayerStatusPayload({ ok: true, data: { handle: "broken" } })).toThrow(
      "invalid response",
    );
  });
});
