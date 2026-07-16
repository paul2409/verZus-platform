import { describe, expect, it } from "vitest";

import { CompetitionDiscoveryApiClientError } from "../api";
import type { FeaturedCompetitionResourceData } from "../model/competition-discovery.types";
import { competitionResourceFromQuery } from "./competition-discovery-resource";

const data: FeaturedCompetitionResourceData = {
  competition: null,
  meta: {
    requestId: "req-1",
    serverNow: "2026-07-19T12:00:00.000Z",
    lastUpdatedAt: "2026-07-19T10:30:00.000Z",
    freshness: "stale",
  },
};

describe("competitionResourceFromQuery", () => {
  it("keeps stale data visible", () => {
    const resource = competitionResourceFromQuery({
      isPending: false,
      isError: false,
      isFetching: false,
      data,
      error: null,
    });

    expect(resource.state).toBe("stale");
    expect(resource.data).toBe(data);
  });

  it("maps typed offline failures", () => {
    const resource = competitionResourceFromQuery<FeaturedCompetitionResourceData>({
      isPending: false,
      isError: true,
      isFetching: false,
      data: null,
      error: new CompetitionDiscoveryApiClientError({
        code: "offline",
        message: "offline",
        requestId: "offline-1",
        retryable: true,
      }),
    });

    expect(resource.state).toBe("offline");
    expect(resource.canRetry).toBe(true);
  });
});
