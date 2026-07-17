// VERZUS M7.4 CHECK-IN SERVICE TESTS

import { beforeEach, describe, expect, it } from "vitest";

import type { MatchCheckInServiceError } from "./match-check-in.service";
import { executeMatchCheckIn } from "./match-check-in.service";
import { getMatchCheckInSnapshot, resetMatchCheckInStore } from "./match-check-in.store";

const now = new Date("2026-07-16T20:00:00.000Z");

beforeEach(() => resetMatchCheckInStore());

describe("server-authoritative match check-in", () => {
  it("creates one event and persists checked-in state across reads", () => {
    const result = executeMatchCheckIn(
      {
        matchId: "m7-preview",
        seedState: "check-in-open",
        expectedState: "check-in-open",
        expectedVersion: 12,
        idempotencyKey: "idem-check-in-0001",
      },
      now,
    );

    const refreshed = getMatchCheckInSnapshot(
      "m7-preview",
      "check-in-open",
      new Date(now.getTime() + 1_000),
    );
    expect(result.outcome).toBe("checked_in");
    expect(refreshed.state).toBe("checked-in");
    expect(refreshed.matchVersion).toBe(13);
    expect(refreshed.checkInEventCount).toBe(1);
  });

  it("replays the same idempotency key without creating a second event", () => {
    const command = {
      matchId: "m7-preview",
      seedState: "check-in-open" as const,
      expectedState: "check-in-open" as const,
      expectedVersion: 12,
      idempotencyKey: "idem-check-in-0002",
    };
    const first = executeMatchCheckIn(command, now);
    const second = executeMatchCheckIn(command, new Date(now.getTime() + 500));

    expect(second.event.eventId).toBe(first.event.eventId);
    expect(second.event.replayed).toBe(true);
    expect(second.snapshot.checkInEventCount).toBe(1);
  });

  it("treats a different retry key after success as an idempotent no-op", () => {
    executeMatchCheckIn(
      {
        matchId: "m7-preview",
        seedState: "check-in-open",
        expectedState: "check-in-open",
        expectedVersion: 12,
        idempotencyKey: "idem-check-in-0003",
      },
      now,
    );
    const repeated = executeMatchCheckIn(
      {
        matchId: "m7-preview",
        seedState: "check-in-open",
        expectedState: "check-in-open",
        expectedVersion: 12,
        idempotencyKey: "idem-check-in-0004",
      },
      new Date(now.getTime() + 1_000),
    );

    expect(repeated.outcome).toBe("already_checked_in");
    expect(repeated.snapshot.checkInEventCount).toBe(1);
  });

  it("moves to both-ready when the server already has opponent check-in", () => {
    const result = executeMatchCheckIn(
      {
        matchId: "m7-preview-opponent-ready",
        seedState: "check-in-open",
        expectedState: "check-in-open",
        expectedVersion: 12,
        idempotencyKey: "idem-check-in-0005",
      },
      now,
    );

    expect(result.outcome).toBe("both_ready");
    expect(result.snapshot.state).toBe("both-ready");
    expect(result.snapshot.currentUser.ready).toBe(true);
    expect(result.snapshot.opponent.ready).toBe(true);
  });

  it("blocks a stale first mutation", () => {
    expect(() =>
      executeMatchCheckIn(
        {
          matchId: "m7-preview",
          seedState: "check-in-open",
          expectedState: "check-in-open",
          expectedVersion: 11,
          idempotencyKey: "idem-check-in-0006",
        },
        now,
      ),
    ).toThrowError(
      expect.objectContaining<Partial<MatchCheckInServiceError>>({
        code: "MATCH_STALE_VERSION",
        retryable: true,
      }),
    );
  });
});
