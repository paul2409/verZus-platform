import { describe, expect, it } from "vitest";

import { getMockCompetitionLifecycleResponse } from "../server/mock-competition-lifecycle.service";
import {
  adaptCompetitionLifecyclePayload,
  CompetitionLifecycleApiClientError,
} from "./competition-lifecycle-api.adapter";

describe("competition lifecycle API adapter", () => {
  it("adapts an allowed lifecycle response", () => {
    const response = getMockCompetitionLifecycleResponse("ea-fc-rookie-cup", "normal");

    expect(adaptCompetitionLifecyclePayload(response.body)).toMatchObject({
      disposition: "entry_open",
      entryAllowed: true,
    });
  });

  it("preserves a user-visible request ID for failures", () => {
    const response = getMockCompetitionLifecycleResponse("ea-fc-rookie-cup", "maintenance");

    expect(() => adaptCompetitionLifecyclePayload(response.body)).toThrow(
      CompetitionLifecycleApiClientError,
    );

    try {
      adaptCompetitionLifecyclePayload(response.body);
    } catch (error) {
      expect(error).toMatchObject({
        code: "maintenance",
        retryable: true,
      });
    }
  });
});
