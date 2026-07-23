import { describe, expect, it } from "vitest";

import type { PlayCommandCenterViewModel } from "../view-model";
import { buildPlaySmartActions } from "./play-smart-actions";

function viewModel(overrides: Partial<PlayCommandCenterViewModel> = {}): PlayCommandCenterViewModel {
  const resource = <T>(data: T | null) => ({
    id: "player-status" as const,
    state: data === null ? ("empty" as const) : ("success" as const),
    data,
    errorCode: null,
    requestId: null,
    available: true,
    stale: false,
  });

  return {
    variant: "no_match_scheduled",
    online: true,
    partialFailureCount: 0,
    essentialActionsAvailable: true,
    playerStatus: {
      ...resource({ unreadNotifications: 0 }),
      id: "player-status",
    } as PlayCommandCenterViewModel["playerStatus"],
    nextMatch: { ...resource(null), id: "next-match" } as PlayCommandCenterViewModel["nextMatch"],
    currentCheckIn: { ...resource(null), id: "check-in" } as PlayCommandCenterViewModel["currentCheckIn"],
    currentPosition: {
      ...resource(null),
      id: "current-position",
    } as PlayCommandCenterViewModel["currentPosition"],
    crewSummary: { ...resource(null), id: "crew-pulse" } as PlayCommandCenterViewModel["crewSummary"],
    recommendedCompetitions: {
      ...resource([]),
      id: "opportunities",
    } as PlayCommandCenterViewModel["recommendedCompetitions"],
    recentActivity: {
      ...resource([]),
      id: "recent-activity",
    } as PlayCommandCenterViewModel["recentActivity"],
    ...overrides,
  };
}

describe("buildPlaySmartActions", () => {
  it("prioritizes unread alerts", () => {
    const model = viewModel({
      playerStatus: {
        ...viewModel().playerStatus,
        data: { unreadNotifications: 3 } as PlayCommandCenterViewModel["playerStatus"]["data"],
      },
    });

    expect(buildPlaySmartActions(model)[0]?.id).toBe("notifications");
  });

  it("recommends a specific eligible competition when no match exists", () => {
    const model = viewModel({
      recommendedCompetitions: {
        ...viewModel().recommendedCompetitions,
        data: [
          {
            competitionId: "competition-1",
            title: "Weekend Cup",
            game: "EA Sports FC",
            format: "1v1",
            startsAt: "2026-07-26T18:00:00.000Z",
            registrationClosesAt: "2026-07-25T18:00:00.000Z",
            entryLabel: "Free",
            eligibilityLabel: "Eligible",
            rewardLabel: "Trophy",
            isFeatured: true,
          },
        ],
      },
    });

    expect(buildPlaySmartActions(model).some((action) => action.id === "best-competition")).toBe(
      true,
    );
  });

  it("never returns duplicate destinations and caps actions at four", () => {
    const actions = buildPlaySmartActions(viewModel());
    expect(actions.length).toBeLessThanOrEqual(4);
    expect(new Set(actions.map((action) => action.href)).size).toBe(actions.length);
  });
});
