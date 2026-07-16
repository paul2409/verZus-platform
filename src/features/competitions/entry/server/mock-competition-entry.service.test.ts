import { describe, expect, it } from "vitest";

import {
  decideMockCompetitionEntry,
  getMockCompetitionEntryControl,
} from "./mock-competition-entry.service";

const key = "3b52d84b-5bb8-493a-85c2-8f6b9da8b93b";
const now = "2026-07-16T12:00:00.000+01:00";

function command(idempotencyKey = key) {
  return {
    competition_id: "ea-fc-rookie-cup",
    expected_state_version: "ea-fc-rookie-cup:registration_open:v1",
    idempotency_key: idempotencyKey,
    accepted_terms: true,
  };
}

describe("mock competition entry service", () => {
  it("returns server-authoritative control state", () => {
    const result = getMockCompetitionEntryControl({
      competitionId: "ea-fc-rookie-cup",
      scenario: "normal",
      storedEntries: [],
      now,
    });

    expect(result.status).toBe(200);
    expect((result.body as { data: { can_enter: boolean } }).data.can_enter).toBe(true);
  });

  it("requires matching idempotency keys", () => {
    const result = decideMockCompetitionEntry({
      competitionId: "ea-fc-rookie-cup",
      scenario: "normal",
      storedEntries: [],
      payload: command(),
      idempotencyHeader: "different-key",
      now,
    });

    expect(result.status).toBe(400);
    expect((result.body as { error: { code: string } }).error.code).toBe(
      "idempotency_key_mismatch",
    );
  });

  it("creates one persistent entry and replays it for the same key", () => {
    const first = decideMockCompetitionEntry({
      competitionId: "ea-fc-rookie-cup",
      scenario: "normal",
      storedEntries: [],
      payload: command(),
      idempotencyHeader: key,
      now,
    });

    expect(first.status).toBe(201);
    expect(first.entriesToPersist).toHaveLength(1);

    const second = decideMockCompetitionEntry({
      competitionId: "ea-fc-rookie-cup",
      scenario: "normal",
      storedEntries: first.entriesToPersist ?? [],
      payload: command(),
      idempotencyHeader: key,
      now,
    });

    expect(second.status).toBe(200);
    expect((second.body as { data: { duplicate: boolean } }).data.duplicate).toBe(true);
    expect(second.entriesToPersist).toBeNull();
  });

  it("blocks a stale expected state version", () => {
    const result = decideMockCompetitionEntry({
      competitionId: "ea-fc-rookie-cup",
      scenario: "normal",
      storedEntries: [],
      payload: { ...command(), expected_state_version: "stale-version" },
      idempotencyHeader: key,
      now,
    });

    expect(result.status).toBe(409);
    expect((result.body as { error: { code: string } }).error.code).toBe("stale_competition_state");
  });
});
