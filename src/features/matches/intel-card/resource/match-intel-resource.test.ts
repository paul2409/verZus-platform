// VERZUS M8.9 MATCH INTEL RESOURCE TESTS

import { describe, expect, it } from "vitest";

import { adaptMatchIntelPayload } from "./match-intel-resource.adapter";
import { createMatchIntelModel, serializeMatchIntelModel } from "./match-intel-resource.service";

describe("match intel resource", () => {
  it("maps result-integrity fields into the Match card contract", () => {
    const model = createMatchIntelModel("match-player-prismo");
    const resource = adaptMatchIntelPayload({
      data: serializeMatchIntelModel(model),
      meta: {
        request_id: "req-match-1",
        fetched_at: "2026-07-17T12:00:00.000Z",
        freshness: "fresh",
        source: "mock-match-intel",
      },
    });

    expect(resource.model.scoreLabel).toBe("3 - 1");
    expect(resource.model.resultConfirmationLabel).toBe("Both players confirmed");
    expect(resource.model.matchHref).toBe("/matches/match-player-prismo");
  });

  it("rejects malformed Match payloads", () => {
    expect(() => adaptMatchIntelPayload({ data: { id: "match-player-prismo" } })).toThrow(
      "Match intel failed schema validation",
    );
  });
});
