// VERZUS M5 STEPS 5.1-5.4

import { describe, expect, it } from "vitest";

import {
  adaptCrewSummaryPayload,
  adaptCurrentCheckInPayload,
  adaptCurrentPositionPayload,
  adaptNextMatchPayload,
  adaptPlayerStatusPayload,
  adaptRecentActivityPayload,
  adaptRecommendedCompetitionsPayload,
} from "../api";
import { getMockPlayResource } from "./mock-play.service";

describe("mock Play service", () => {
  it("produces schema-valid independent success payloads", () => {
    expect(
      adaptPlayerStatusPayload(getMockPlayResource("player-status", "normal").body),
    ).toMatchObject({
      handle: "JAYFLEX",
      trustScore: 91,
    });
    expect(adaptNextMatchPayload(getMockPlayResource("next-match", "normal").body)?.matchId).toBe(
      "match-week-14-001",
    );
    expect(
      adaptCurrentCheckInPayload(getMockPlayResource("current-check-in", "check_in_open").body),
    ).toMatchObject({ state: "open", canCheckIn: true });
    expect(
      adaptCurrentPositionPayload(getMockPlayResource("current-position", "normal").body).rank,
    ).toBe(17);
    expect(adaptCrewSummaryPayload(getMockPlayResource("crew-summary", "normal").body)?.name).toBe(
      "Mainland Titans",
    );
    expect(
      adaptRecommendedCompetitionsPayload(
        getMockPlayResource("recommended-competitions", "normal").body,
      ),
    ).toHaveLength(2);
    expect(
      adaptRecentActivityPayload(getMockPlayResource("recent-activity", "normal").body),
    ).toHaveLength(3);
  });

  it("supports empty match and no-Crew states", () => {
    expect(
      adaptNextMatchPayload(getMockPlayResource("next-match", "no_match_scheduled").body),
    ).toBeNull();
    expect(adaptCrewSummaryPayload(getMockPlayResource("crew-summary", "no_crew").body)).toBeNull();
  });

  it("fails only selected widgets in the partial-failure scenario", () => {
    expect(getMockPlayResource("next-match", "partial_api_failure").status).toBe(200);
    expect(getMockPlayResource("current-check-in", "partial_api_failure").status).toBe(200);
    expect(getMockPlayResource("crew-summary", "partial_api_failure").status).toBe(503);
    expect(getMockPlayResource("recent-activity", "partial_api_failure").status).toBe(503);
  });

  it("returns retryable offline errors for isolated requests", () => {
    const result = getMockPlayResource("player-status", "offline");

    expect(result.status).toBe(503);
    expect(result.body).toMatchObject({
      ok: false,
      error: {
        code: "offline",
        retryable: true,
      },
    });
  });
});
