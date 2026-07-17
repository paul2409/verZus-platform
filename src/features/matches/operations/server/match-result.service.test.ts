// VERZUS M7.6 RESULT OPERATIONS SERVER TESTS

import { beforeEach, describe, expect, it } from "vitest";

import { resetMatchResultOperationsStore } from "./match-result.store";
import {
  executeMatchDisputeCommand,
  executeMatchEvidenceUpload,
  executeMatchResultCommand,
} from "./match-result.service";

const now = new Date("2026-07-17T01:00:00.000Z");

beforeEach(() => {
  resetMatchResultOperationsStore();
});

describe("M7.6 result operations", () => {
  it("submits a result once and replays the same idempotency key", () => {
    const command = {
      matchId: "m7-result-submit",
      seedState: "submit-result" as const,
      expectedState: "submit-result" as const,
      expectedVersion: 12,
      idempotencyKey: "result-key-1",
      action: "submit_result" as const,
      score: { home: 3, away: 2 },
      note: "GG",
    };

    const first = executeMatchResultCommand(command, now);
    const replay = executeMatchResultCommand(command, new Date(now.getTime() + 1000));

    expect(first.outcome).toBe("result_submitted");
    expect(first.snapshot.state).toBe("awaiting-opponent-confirmation");
    expect(first.snapshot.matchVersion).toBe(13);
    expect(replay.event.replayed).toBe(true);
    expect(replay.snapshot.resultEventCount).toBe(1);
  });

  it("blocks stale result submission versions", () => {
    expect(() =>
      executeMatchResultCommand(
        {
          matchId: "m7-result-stale",
          seedState: "submit-result",
          expectedState: "submit-result",
          expectedVersion: 11,
          idempotencyKey: "result-key-stale",
          action: "submit_result",
          score: { home: 1, away: 0 },
        },
        now,
      ),
    ).toThrowError(expect.objectContaining({ code: "MATCH_STALE_VERSION" }));
  });

  it("persists matching opponent confirmation", () => {
    const result = executeMatchResultCommand(
      {
        matchId: "m7-result-confirm",
        seedState: "awaiting-opponent-confirmation",
        expectedState: "awaiting-opponent-confirmation",
        expectedVersion: 12,
        idempotencyKey: "confirm-key-1",
        action: "confirm_result",
        score: { home: 3, away: 2 },
      },
      now,
    );

    expect(result.outcome).toBe("result_confirmed");
    expect(result.snapshot.state).toBe("result-confirmed");
    expect(result.snapshot.confirmation?.score).toEqual({ home: 3, away: 2 });
  });

  it("records a score conflict without overwriting the submitted score", () => {
    const result = executeMatchResultCommand(
      {
        matchId: "m7-result-conflict",
        seedState: "awaiting-opponent-confirmation",
        expectedState: "awaiting-opponent-confirmation",
        expectedVersion: 12,
        idempotencyKey: "confirm-key-conflict",
        action: "confirm_result",
        score: { home: 2, away: 3 },
      },
      now,
    );

    expect(result.outcome).toBe("result_conflict_detected");
    expect(result.snapshot.state).toBe("awaiting-opponent-confirmation");
    expect(result.snapshot.submission?.score).toEqual({ home: 3, away: 2 });
    expect(result.snapshot.conflict?.confirmationScore).toEqual({ home: 2, away: 3 });
  });

  it("uploads evidence independently without changing match state or version", async () => {
    const result = await executeMatchEvidenceUpload({
      matchId: "m7-evidence",
      seedState: "submit-result",
      expectedState: "submit-result",
      expectedVersion: 12,
      idempotencyKey: "evidence-key-1",
      fileName: "score.png",
      mimeType: "image/png",
      bytes: new Uint8Array([1, 2, 3, 4]),
      now,
    });

    expect(result.outcome).toBe("evidence_uploaded");
    expect(result.snapshot.state).toBe("submit-result");
    expect(result.snapshot.matchVersion).toBe(12);
    expect(result.snapshot.evidenceAttachments).toHaveLength(1);
  });

  it("creates an auditable dispute through a legal transition", () => {
    const result = executeMatchDisputeCommand(
      {
        matchId: "m7-dispute",
        seedState: "awaiting-opponent-confirmation",
        expectedState: "awaiting-opponent-confirmation",
        expectedVersion: 12,
        idempotencyKey: "dispute-key-1",
        reason: "score_mismatch",
        summary: "Opponent confirmation does not match the final score.",
        claimedScore: { home: 3, away: 2 },
      },
      now,
    );

    expect(result.outcome).toBe("dispute_created");
    expect(result.snapshot.state).toBe("disputed");
    expect(result.snapshot.dispute?.auditEventId).toBeTruthy();
    expect(result.snapshot.disputeEventCount).toBe(1);
  });
});
