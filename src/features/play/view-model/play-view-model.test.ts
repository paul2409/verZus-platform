// VERZUS M5 STEPS 5.1-5.4

import { describe, expect, it } from "vitest";

import type { CrewSummary, RecentActivityItem } from "../model";
import { getMockPlayResource } from "../server";
import {
  adaptCrewSummaryPayload,
  adaptCurrentCheckInPayload,
  adaptCurrentPositionPayload,
  adaptNextMatchPayload,
  adaptPlayerStatusPayload,
  adaptRecentActivityPayload,
  adaptRecommendedCompetitionsPayload,
} from "../api";
import {
  buildPlayCommandCenterViewModel,
  createPlayResource,
  type PlayResources,
} from "./play-view-model";

function successResources(): PlayResources {
  return {
    playerStatus: createPlayResource(
      "success",
      adaptPlayerStatusPayload(getMockPlayResource("player-status", "normal").body),
    ),
    nextMatch: createPlayResource(
      "success",
      adaptNextMatchPayload(getMockPlayResource("next-match", "normal").body),
    ),
    currentCheckIn: createPlayResource(
      "success",
      adaptCurrentCheckInPayload(getMockPlayResource("current-check-in", "normal").body),
    ),
    currentPosition: createPlayResource(
      "success",
      adaptCurrentPositionPayload(getMockPlayResource("current-position", "normal").body),
    ),
    crewSummary: createPlayResource(
      "success",
      adaptCrewSummaryPayload(getMockPlayResource("crew-summary", "normal").body),
    ),
    recommendedCompetitions: createPlayResource(
      "success",
      adaptRecommendedCompetitionsPayload(
        getMockPlayResource("recommended-competitions", "normal").body,
      ),
    ),
    recentActivity: createPlayResource(
      "success",
      adaptRecentActivityPayload(getMockPlayResource("recent-activity", "normal").body),
    ),
  };
}

describe("Play command-centre view model", () => {
  it("builds the normal state without one aggregate endpoint", () => {
    const viewModel = buildPlayCommandCenterViewModel(successResources(), true);

    expect(viewModel.variant).toBe("normal");
    expect(viewModel.partialFailureCount).toBe(0);
    expect(viewModel.essentialActionsAvailable).toBe(true);
    expect(viewModel.nextMatch.data?.opponent.handle).toBe("R3DSTORM");
  });

  it("isolates secondary widget failures", () => {
    const resources = successResources();
    resources.crewSummary = createPlayResource<CrewSummary>(
      "error",
      null,
      "upstream_unavailable",
      "request-crew-001",
    );
    resources.recentActivity = createPlayResource<RecentActivityItem[]>(
      "error",
      null,
      "upstream_unavailable",
      "request-activity-001",
    );

    const viewModel = buildPlayCommandCenterViewModel(resources, true);

    expect(viewModel.variant).toBe("partial_api_failure");
    expect(viewModel.partialFailureCount).toBe(2);
    expect(viewModel.essentialActionsAvailable).toBe(true);
    expect(viewModel.nextMatch.available).toBe(true);
    expect(viewModel.currentCheckIn.available).toBe(true);
  });

  it("keeps stale data visible", () => {
    const resources = successResources();
    resources.currentPosition = createPlayResource("stale", resources.currentPosition.data);

    const viewModel = buildPlayCommandCenterViewModel(resources, true);

    expect(viewModel.currentPosition.available).toBe(true);
    expect(viewModel.currentPosition.stale).toBe(true);
    expect(viewModel.currentPosition.data?.rank).toBe(17);
  });

  it("blocks network-dependent essential actions when offline", () => {
    const viewModel = buildPlayCommandCenterViewModel(successResources(), false);

    expect(viewModel.variant).toBe("offline");
    expect(viewModel.essentialActionsAvailable).toBe(false);
  });
});
