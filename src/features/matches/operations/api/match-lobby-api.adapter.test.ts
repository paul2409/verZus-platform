// VERZUS M7.5 LOBBY RESPONSE ADAPTER TESTS

import { describe, expect, it } from "vitest";

import { createMatchClockSnapshot } from "../model/match-clock.policy";
import { adaptMatchLobbyMutation } from "./match-lobby-api.adapter";

const now = new Date("2026-07-16T20:00:00.000Z");

function payload() {
  return {
    ok: true as const,
    request_id: "req-lobby-1",
    data: {
      outcome: "ready_confirmed" as const,
      match_id: "m7-preview",
      seed_state: "lobby-open" as const,
      state: "lobby-open" as const,
      match_version: 13,
      current_user: {
        participant_id: "rebels-united",
        checked_in: true,
        entered: true,
        ready: true,
      },
      opponent: {
        participant_id: "apex-predators",
        checked_in: true,
        entered: false,
        ready: false,
      },
      connection: {
        lobby_code: "VZ-775-2049",
        platform: "EA SPORTS FC 26",
        server_region: "West Africa",
        join_method: "Private match code",
      },
      action_event_count: 1,
      issue_count: 0,
      last_issue: null,
      last_event_id: "event-1",
      last_updated_at: now.toISOString(),
      clock: createMatchClockSnapshot("m7-preview", "lobby-open", now, 13),
      event: {
        event_id: "event-1",
        action: "confirm_ready" as const,
        created_at: now.toISOString(),
        replayed: false,
      },
    },
  };
}

describe("adaptMatchLobbyMutation", () => {
  it("maps the raw lobby mutation response into the domain contract", () => {
    const result = adaptMatchLobbyMutation(payload());

    expect(result.outcome).toBe("ready_confirmed");
    expect(result.snapshot.currentUser.ready).toBe(true);
    expect(result.snapshot.connection.serverRegion).toBe("West Africa");
    expect(result.snapshot.matchVersion).toBe(13);
  });

  it("rejects malformed responses", () => {
    expect(() => adaptMatchLobbyMutation({ ok: true, data: {} })).toThrowError(
      expect.objectContaining({ code: "invalid_response" }),
    );
  });
});
