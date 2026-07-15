// VERZUS M5 STEPS 5.9-5.13

import { describe, expect, it } from "vitest";

import { decideMockPlayCheckIn } from "./mock-check-in.service";

const command = {
  match_id: "match-week-14-001",
  mutation_key: "check-in-match-week-14-001",
  idempotency_key: "3b52d84b-5bb8-493a-85c2-8f6b9da8b93b",
};

describe("mock Play check-in service", () => {
  it("accepts one server-authoritative check-in while the window is open", () => {
    const result = decideMockPlayCheckIn({
      scenario: "check_in_open",
      payload: command,
      idempotencyHeader: command.idempotency_key,
      existingRecord: null,
      now: "2026-07-15T18:20:00.000Z",
    });

    expect(result.status).toBe(200);
    expect(result.recordToPersist).toEqual({
      matchId: command.match_id,
      checkedInAt: "2026-07-15T18:20:00.000Z",
      idempotencyKey: command.idempotency_key,
    });
  });

  it("returns the original result for a duplicate request", () => {
    const existingRecord = {
      matchId: command.match_id,
      checkedInAt: "2026-07-15T18:20:00.000Z",
      idempotencyKey: command.idempotency_key,
    };
    const result = decideMockPlayCheckIn({
      scenario: "check_in_open",
      payload: command,
      idempotencyHeader: command.idempotency_key,
      existingRecord,
    });

    expect(result.status).toBe(200);
    expect(result.recordToPersist).toEqual(existingRecord);
    expect(result.body).toMatchObject({
      ok: true,
      data: { duplicate: true },
    });
  });

  it("blocks check-in when the server window is not open", () => {
    const result = decideMockPlayCheckIn({
      scenario: "normal",
      payload: command,
      idempotencyHeader: command.idempotency_key,
      existingRecord: null,
    });

    expect(result.status).toBe(409);
    expect(result.body).toMatchObject({
      ok: false,
      error: { code: "stale_check_in_state" },
    });
  });

  it("requires matching idempotency keys", () => {
    const result = decideMockPlayCheckIn({
      scenario: "check_in_open",
      payload: command,
      idempotencyHeader: "different-key",
      existingRecord: null,
    });

    expect(result.status).toBe(400);
    expect(result.body).toMatchObject({
      ok: false,
      error: { code: "idempotency_key_mismatch" },
    });
  });
});
