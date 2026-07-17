// VERZUS M7.4 CHECK-IN RESPONSE ADAPTER TESTS

import { describe, expect, it } from "vitest";

import type { MatchOperationsApiClientError } from "./match-operations-api.adapter";
import { adaptMatchCheckInMutation } from "./match-check-in-api.adapter";

const clock = {
  matchId: "m7-preview",
  state: "checked-in",
  matchVersion: 13,
  serverNow: "2026-07-16T20:00:00.000Z",
  issuedAt: "2026-07-16T20:00:00.000Z",
  scheduledAt: "2026-07-16T20:39:13.000Z",
  checkInOpensAt: "2026-07-16T19:59:13.000Z",
  checkInClosesAt: "2026-07-16T20:24:13.000Z",
  lobbyOpensAt: "2026-07-16T20:29:13.000Z",
  matchStartsAt: "2026-07-16T20:39:13.000Z",
  resultDueAt: "2026-07-16T21:39:13.000Z",
  activeDeadlineKind: "check_in_closes",
  activeDeadlineAt: "2026-07-16T20:24:13.000Z",
  mode: "countdown",
  timezone: "UTC",
} as const;

describe("check-in API adapter", () => {
  it("maps a successful mutation into the domain result", () => {
    const result = adaptMatchCheckInMutation({
      ok: true,
      request_id: "req-1",
      data: {
        outcome: "checked_in",
        match_id: "m7-preview",
        seed_state: "check-in-open",
        state: "checked-in",
        match_version: 13,
        current_user: { participant_id: "rebels-united", checked_in: true, ready: false },
        opponent: { participant_id: "apex-predators", checked_in: false, ready: false },
        check_in_event_count: 1,
        last_event_id: "evt-1",
        last_updated_at: "2026-07-16T20:00:00.000Z",
        clock,
        event: {
          event_id: "evt-1",
          created_at: "2026-07-16T20:00:00.000Z",
          replayed: false,
        },
      },
    });

    expect(result.outcome).toBe("checked_in");
    expect(result.snapshot.matchVersion).toBe(13);
    expect(result.snapshot.currentUser.checkedIn).toBe(true);
  });

  it("preserves structured server errors", () => {
    expect(() =>
      adaptMatchCheckInMutation({
        ok: false,
        error: {
          code: "MATCH_STALE_VERSION",
          message: "Refresh the match.",
          request_id: "req-stale",
          retryable: true,
        },
      }),
    ).toThrowError(
      expect.objectContaining<Partial<MatchOperationsApiClientError>>({
        code: "MATCH_STALE_VERSION",
        requestId: "req-stale",
        retryable: true,
      }),
    );
  });
});
