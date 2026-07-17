// VERZUS M7.3 MATCH OPERATIONS ADAPTER TESTS

import { describe, expect, it } from "vitest";

import { buildMatchResourceFixtures } from "../server/match-resource.fixture";
import { adaptMatchParticipants, adaptMatchSummary } from "./match-operations-api.adapter";
import type { MatchOperationsApiClientError } from "./match-operations-api.adapter";

function success(data: unknown) {
  return {
    ok: true,
    data,
    request_id: "req-m7-3",
    meta: {
      server_now: "2026-07-16T20:00:00.000Z",
      last_updated_at: "2026-07-16T20:00:00.000Z",
      freshness: "fresh",
    },
  };
}

describe("match operations API adapters", () => {
  const fixtures = buildMatchResourceFixtures(
    "m7-preview",
    "check-in-open",
    new Date("2026-07-16T20:00:00.000Z"),
  );

  it("maps snake-case summary and participant resources into domain view models", () => {
    const summary = adaptMatchSummary(success(fixtures.summary));
    const participants = adaptMatchParticipants(success(fixtures.participants));

    expect(summary.value).toEqual(
      expect.objectContaining({ id: "m7-preview", state: "check-in-open", matchVersion: 12 }),
    );
    expect(participants.value.home).toEqual(
      expect.objectContaining({ id: "rebels-united", checkedIn: false }),
    );
  });

  it("rejects malformed resources before they enter the query cache", () => {
    expect(() => adaptMatchSummary({ ok: true, data: { broken: true } })).toThrowError(
      expect.objectContaining<Partial<MatchOperationsApiClientError>>({
        code: "invalid_response",
        retryable: true,
      }),
    );
  });

  it("preserves structured API errors", () => {
    expect(() =>
      adaptMatchSummary({
        ok: false,
        error: {
          code: "forbidden",
          message: "Match access denied.",
          request_id: "req-denied",
          retryable: false,
        },
      }),
    ).toThrowError(
      expect.objectContaining<Partial<MatchOperationsApiClientError>>({
        code: "forbidden",
        requestId: "req-denied",
        retryable: false,
      }),
    );
  });
});
