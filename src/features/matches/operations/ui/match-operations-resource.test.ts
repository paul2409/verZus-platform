// VERZUS M7.3 MATCH RESOURCE STATE ADAPTER TESTS

import { describe, expect, it } from "vitest";

import { MatchOperationsApiClientError } from "../api";
import { matchResourceFromQuery } from "./match-operations-resource";

const data = {
  value: { id: "match-7" },
  meta: {
    requestId: "req-7",
    serverNow: "2026-07-16T20:00:00.000Z",
    lastUpdatedAt: "2026-07-16T20:00:00.000Z",
    freshness: "fresh" as const,
  },
};

describe("matchResourceFromQuery", () => {
  it("preserves cached data when refresh fails", () => {
    const resource = matchResourceFromQuery({
      isPending: false,
      isError: true,
      isFetching: false,
      data,
      error: new Error("refresh failed"),
    });

    expect(resource.state).toBe("stale");
    expect(resource.data).toBe(data);
  });

  it("maps structured independent failures", () => {
    const resource = matchResourceFromQuery({
      isPending: false,
      isError: true,
      isFetching: false,
      data: null,
      error: new MatchOperationsApiClientError({
        code: "upstream_unavailable",
        message: "timeline unavailable",
        requestId: "req-timeline",
        retryable: true,
      }),
    });

    expect(resource).toEqual(
      expect.objectContaining({
        state: "partial_failure",
        requestId: "req-timeline",
        canRetry: true,
      }),
    );
  });
});
