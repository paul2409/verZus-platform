// VERZUS M8.9 CREW INTEL RESOURCE TESTS

import { describe, expect, it } from "vitest";

import { adaptCrewIntelPayload } from "./crew-intel-resource.adapter";
import { createCrewIntelModel, serializeCrewIntelModel } from "./crew-intel-resource.service";

describe("crew intel resource", () => {
  it("maps leadership and roster data into the Crew card contract", () => {
    const model = createCrewIntelModel("crew-xenon");
    const resource = adaptCrewIntelPayload({
      data: serializeCrewIntelModel(model),
      meta: {
        request_id: "req-crew-1",
        fetched_at: "2026-07-17T12:00:00.000Z",
        freshness: "fresh",
        source: "mock-crew-intel",
      },
    });

    expect(resource.model.name).toBe("Xenon");
    expect(resource.model.ownerName).toBe("Prismo");
    expect(resource.model.captainNames).toContain("Ghosty");
  });

  it("rejects malformed Crew payloads", () => {
    expect(() => adaptCrewIntelPayload({ data: { id: "crew-xenon" } })).toThrow(
      "Crew intel failed schema validation",
    );
  });
});
