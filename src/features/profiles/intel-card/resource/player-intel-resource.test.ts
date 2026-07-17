// VERZUS M8.9 PLAYER INTEL RESOURCE TESTS

import { describe, expect, it } from "vitest";

import { adaptPlayerIntelPayload } from "./player-intel-resource.adapter";
import { createPlayerIntelModel, serializePlayerIntelModel } from "./player-intel-resource.service";

describe("player intel resource", () => {
  it("maps a snake-case API envelope into the card contract", () => {
    const model = createPlayerIntelModel("player-prismo");
    const resource = adaptPlayerIntelPayload({
      data: serializePlayerIntelModel(model),
      meta: {
        request_id: "req-player-1",
        fetched_at: "2026-07-17T12:00:00.000Z",
        freshness: "fresh",
        source: "mock-player-intel",
      },
    });

    expect(resource.model.displayName).toBe("Prismo");
    expect(resource.model.recentMatches?.[0]?.href).toContain("/matches/");
    expect(resource.requestId).toBe("req-player-1");
  });

  it("rejects malformed player payloads", () => {
    expect(() => adaptPlayerIntelPayload({ data: { id: "player-prismo" } })).toThrow(
      "Player intel failed schema validation",
    );
  });
});
