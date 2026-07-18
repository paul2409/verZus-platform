// VERZUS M9.4 CREW RESOURCE COMPOSITION TESTS

import { describe, expect, it } from "vitest";

import { getCrewFoundationMock } from "../../foundation";
import { mergeCrewResourceSnapshot } from "./crew-resource.merge";

const meta = {
  requestId: "request-1",
  fetchedAt: "2026-07-17T18:00:00.000Z",
  freshness: "fresh" as const,
  source: "mock-crew-resource" as const,
};

describe("mergeCrewResourceSnapshot", () => {
  it("replaces only the independently loaded resource slice", () => {
    const fallback = getCrewFoundationMock("crew-xenon-esports");
    const result = mergeCrewResourceSnapshot(fallback, {
      roster: {
        data: { members: [fallback.members[0]!] },
        meta,
      },
    });

    expect(result.members).toHaveLength(1);
    expect(result.activity).toEqual(fallback.activity);
    expect(result.identity).toEqual(fallback.identity);
  });

  it("keeps the approved local contract when a resource has not loaded", () => {
    const fallback = getCrewFoundationMock("crew-xenon-esports");
    expect(mergeCrewResourceSnapshot(fallback, {})).toEqual(fallback);
  });
});
