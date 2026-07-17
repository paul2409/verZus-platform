// VERZUS M7.5 LOBBY SERVICE TESTS

import { beforeEach, describe, expect, it } from "vitest";

import { executeMatchLobbyOperation } from "./match-lobby.service";
import { getMatchLobbyOperationsSnapshot, resetMatchLobbyStore } from "./match-lobby.store";
import { resetMatchCheckInStore } from "./match-check-in.store";

const now = new Date("2026-07-16T20:00:00.000Z");

beforeEach(() => {
  resetMatchLobbyStore();
  resetMatchCheckInStore();
});

describe("executeMatchLobbyOperation", () => {
  it("enters the lobby once and replays the same idempotency key", () => {
    const snapshot = getMatchLobbyOperationsSnapshot("m7-preview-lobby-now", "both-ready", now);
    const command = {
      matchId: snapshot.matchId,
      seedState: snapshot.seedState,
      expectedState: snapshot.state,
      expectedVersion: snapshot.matchVersion,
      idempotencyKey: "lobby-enter-00000001",
      action: "enter_lobby" as const,
    };

    const first = executeMatchLobbyOperation(command, now);
    const replay = executeMatchLobbyOperation(command, now);

    expect(first.outcome).toBe("lobby_entered");
    expect(first.snapshot.state).toBe("lobby-open");
    expect(first.snapshot.actionEventCount).toBe(1);
    expect(replay.event.replayed).toBe(true);
    expect(replay.snapshot.actionEventCount).toBe(1);
  });

  it("confirms lobby readiness without creating an invalid state transition", () => {
    const snapshot = getMatchLobbyOperationsSnapshot("m7-preview", "lobby-open", now);
    const result = executeMatchLobbyOperation(
      {
        matchId: snapshot.matchId,
        seedState: snapshot.seedState,
        expectedState: snapshot.state,
        expectedVersion: snapshot.matchVersion,
        idempotencyKey: "lobby-ready-0000001",
        action: "confirm_ready",
      },
      now,
    );

    expect(result.outcome).toBe("ready_confirmed");
    expect(result.snapshot.state).toBe("lobby-open");
    expect(result.snapshot.currentUser.ready).toBe(true);
    expect(result.snapshot.matchVersion).toBe(snapshot.matchVersion + 1);
  });

  it("starts the match only when both players are ready and server time is reached", () => {
    const snapshot = getMatchLobbyOperationsSnapshot("m7-preview-start-ready", "lobby-open", now);
    const result = executeMatchLobbyOperation(
      {
        matchId: snapshot.matchId,
        seedState: snapshot.seedState,
        expectedState: snapshot.state,
        expectedVersion: snapshot.matchVersion,
        idempotencyKey: "start-match-00000001",
        action: "start_match",
      },
      now,
    );

    expect(result.outcome).toBe("match_started");
    expect(result.snapshot.state).toBe("in-progress");
    expect(result.snapshot.clock.mode).toBe("elapsed");
  });

  it("blocks match start while an opponent is not lobby-ready", () => {
    const snapshot = getMatchLobbyOperationsSnapshot("m7-preview", "lobby-open", now);

    expect(() =>
      executeMatchLobbyOperation(
        {
          matchId: snapshot.matchId,
          seedState: snapshot.seedState,
          expectedState: snapshot.state,
          expectedVersion: snapshot.matchVersion,
          idempotencyKey: "start-match-blocked-1",
          action: "start_match",
        },
        now,
      ),
    ).toThrowError(
      expect.objectContaining({
        code: "MATCH_PARTICIPANTS_NOT_READY",
      }),
    );
  });

  it("records an operational issue without changing match state or version", () => {
    const snapshot = getMatchLobbyOperationsSnapshot("m7-preview", "in-progress", now);
    const result = executeMatchLobbyOperation(
      {
        matchId: snapshot.matchId,
        seedState: snapshot.seedState,
        expectedState: snapshot.state,
        expectedVersion: snapshot.matchVersion,
        idempotencyKey: "report-issue-00000001",
        action: "report_issue",
        issue: { category: "connection", summary: "Connection dropped twice." },
      },
      now,
    );

    expect(result.outcome).toBe("issue_reported");
    expect(result.snapshot.state).toBe("in-progress");
    expect(result.snapshot.matchVersion).toBe(snapshot.matchVersion);
    expect(result.snapshot.issueCount).toBe(1);
    expect(result.snapshot.lastIssue?.status).toBe("open");
  });
});
