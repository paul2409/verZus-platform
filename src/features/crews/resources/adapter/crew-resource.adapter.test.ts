// VERZUS M9.4 CREW RESOURCE ADAPTER TESTS

import { describe, expect, it } from "vitest";

import { adaptCrewProfilePayload } from "./crew-resource.adapter";

describe("Crew resource adapters", () => {
  it("maps snake-case profile data into the Crew domain contract", () => {
    const result = adaptCrewProfilePayload({
      data: {
        identity: {
          id: "crew-xenon-esports",
          name: "Xenon Esports",
          tag: "XEN",
          tagline: "Compete.",
          description: "Verified Crew",
          crest_src: "/crest.svg",
          banner_src: "/banner.svg",
          verified: true,
          tier: "Platinum",
          games: ["EA FC"],
          member_count: 25,
          region: "Nigeria",
          visibility: "public",
          founded_at_label: "Nov 18, 2024",
          lifecycle: "active",
        },
      },
      meta: {
        request_id: "request-1",
        fetched_at: "2026-07-17T18:00:00.000Z",
        freshness: "fresh",
        source: "mock-crew-resource",
      },
    });

    expect(result.data.identity.crestSrc).toBe("/crest.svg");
    expect(result.data.identity.memberCount).toBe(25);
    expect(result.meta.requestId).toBe("request-1");
  });

  it("turns malformed data into a traceable schema error", () => {
    expect(() => adaptCrewProfilePayload({ data: { identity: { id: "x" } } })).toThrowError(
      expect.objectContaining({
        code: "CREW_PROFILE_SCHEMA_INVALID",
        retryable: true,
      }),
    );
  });
});
