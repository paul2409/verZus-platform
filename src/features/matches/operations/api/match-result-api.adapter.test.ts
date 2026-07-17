// VERZUS M7.6 RESULT RESPONSE ADAPTER TESTS

import { describe, expect, it } from "vitest";

import { createMatchClockSnapshot } from "../model/match-clock.policy";
import {
  adaptMatchDisputeMutation,
  adaptMatchEvidenceMutation,
  adaptMatchResultMutation,
} from "./match-result-api.adapter";

const now = new Date("2026-07-17T01:00:00.000Z");

function snapshot() {
  return {
    match_id: "m7-preview",
    seed_state: "submit-result" as const,
    state: "awaiting-opponent-confirmation" as const,
    match_version: 13,
    submission: {
      submission_id: "submission-1",
      score: { home: 3, away: 2 },
      note: "GG",
      submitted_by: "current_user" as const,
      submitted_at: now.toISOString(),
    },
    confirmation: null,
    conflict: null,
    evidence_attachments: [],
    dispute: null,
    result_event_count: 1,
    evidence_event_count: 0,
    dispute_event_count: 0,
    last_event_id: "event-1",
    last_updated_at: now.toISOString(),
    clock: createMatchClockSnapshot("m7-preview", "awaiting-opponent-confirmation", now, 13),
  };
}

function event() {
  return { event_id: "event-1", created_at: now.toISOString(), replayed: false };
}

describe("M7.6 response adapters", () => {
  it("adapts result submission responses", () => {
    const result = adaptMatchResultMutation({
      ok: true,
      request_id: "req-result-1",
      data: {
        outcome: "result_submitted",
        snapshot: snapshot(),
        event: { ...event(), action: "submit_result" },
      },
    });

    expect(result.outcome).toBe("result_submitted");
    expect(result.snapshot.submission?.score).toEqual({ home: 3, away: 2 });
  });

  it("adapts independent evidence responses", () => {
    const attachment = {
      evidence_id: "evidence-1",
      file_name: "score.png",
      mime_type: "image/png" as const,
      size_bytes: 1024,
      sha256: "a".repeat(64),
      uploaded_at: now.toISOString(),
    };
    const result = adaptMatchEvidenceMutation({
      ok: true,
      request_id: "req-evidence-1",
      data: {
        outcome: "evidence_uploaded",
        attachment,
        snapshot: { ...snapshot(), evidence_attachments: [attachment] },
        event: event(),
      },
    });

    expect(result.attachment.fileName).toBe("score.png");
    expect(result.snapshot.evidenceAttachments).toHaveLength(1);
  });

  it("adapts auditable dispute responses", () => {
    const dispute = {
      dispute_id: "dispute-1",
      reason: "score_mismatch" as const,
      summary: "Opponent submitted a different score.",
      claimed_score: { home: 3, away: 2 },
      status: "open" as const,
      created_by: "current_user" as const,
      created_at: now.toISOString(),
      audit_event_id: "audit-1",
    };
    const result = adaptMatchDisputeMutation({
      ok: true,
      request_id: "req-dispute-1",
      data: {
        outcome: "dispute_created",
        snapshot: {
          ...snapshot(),
          state: "disputed",
          match_version: 14,
          dispute,
          dispute_event_count: 1,
        },
        event: event(),
      },
    });

    expect(result.snapshot.dispute?.auditEventId).toBe("audit-1");
  });
});
