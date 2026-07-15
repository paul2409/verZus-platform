// VERZUS M5 STEPS 5.9-5.13

import { describe, expect, it } from "vitest";

import { adaptPlayCheckInPayload } from "./check-in-api.adapter";

const idempotencyKey = "3b52d84b-5bb8-493a-85c2-8f6b9da8b93b";

describe("check-in API adapter", () => {
  it("adapts a valid check-in response", () => {
    expect(
      adaptPlayCheckInPayload({
        ok: true,
        data: {
          match_id: "match-1",
          state: "checked_in",
          checked_in_at: "2026-07-15T18:20:00.000Z",
          idempotency_key: idempotencyKey,
          duplicate: false,
        },
        request_id: "request-1",
      }),
    ).toEqual({
      matchId: "match-1",
      state: "checked_in",
      checkedInAt: "2026-07-15T18:20:00.000Z",
      idempotencyKey,
      duplicate: false,
      requestId: "request-1",
    });
  });

  it("rejects malformed responses", () => {
    expect(() => adaptPlayCheckInPayload({ ok: true, data: {} })).toThrow("invalid response");
  });
});
