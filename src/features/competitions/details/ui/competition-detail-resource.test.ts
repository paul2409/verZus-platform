import { describe, expect, it } from "vitest";

import { CompetitionDetailApiClientError } from "../api";
import { competitionDetailResourceFromQuery } from "./competition-detail-resource";

describe("competition detail resource state", () => {
  it("maps an independent upstream failure", () => {
    const error = new CompetitionDetailApiClientError({
      code: "upstream_unavailable",
      message: "failed",
      requestId: "request-1",
      retryable: true,
    });
    const resource = competitionDetailResourceFromQuery({
      isPending: false,
      isError: true,
      isFetching: false,
      data: null,
      error,
    });
    expect(resource.state).toBe("partial_failure");
  });
});
