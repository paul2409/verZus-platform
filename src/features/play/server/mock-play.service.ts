// VERZUS M5 STEPS 5.1-5.4

import type { PlayScenario } from "../model";
import { getMockPlaySnapshot } from "./mock-play.data";

export const playResourceNames = [
  "player-status",
  "next-match",
  "current-check-in",
  "current-position",
  "crew-summary",
  "recommended-competitions",
  "recent-activity",
] as const;

export type PlayResourceName = (typeof playResourceNames)[number];

export interface MockPlayServiceResult {
  status: number;
  body: unknown;
}

function requestId(resource: PlayResourceName): string {
  return `mock-play-${resource}-${globalThis.crypto.randomUUID()}`;
}

function failure(
  resource: PlayResourceName,
  status: number,
  code: string,
  message: string,
  retryable: boolean,
): MockPlayServiceResult {
  return {
    status,
    body: {
      ok: false,
      error: {
        code,
        message,
        request_id: requestId(resource),
        retryable,
        field_errors: {},
      },
    },
  };
}

function resourceData(resource: PlayResourceName, scenario: PlayScenario): unknown {
  const snapshot = getMockPlaySnapshot(scenario);

  switch (resource) {
    case "player-status":
      return snapshot.playerStatus;
    case "next-match":
      return snapshot.nextMatch;
    case "current-check-in":
      return snapshot.currentCheckIn;
    case "current-position":
      return snapshot.currentPosition;
    case "crew-summary":
      return snapshot.crewSummary;
    case "recommended-competitions":
      return snapshot.recommendedCompetitions;
    case "recent-activity":
      return snapshot.recentActivity;
  }
}

export function getMockPlayResource(
  resource: PlayResourceName,
  scenario: PlayScenario,
): MockPlayServiceResult {
  if (scenario === "offline") {
    return failure(
      resource,
      503,
      "offline",
      "The Play resource is unavailable while offline.",
      true,
    );
  }

  if (
    scenario === "partial_api_failure" &&
    (resource === "crew-summary" || resource === "recent-activity")
  ) {
    return failure(
      resource,
      503,
      "upstream_unavailable",
      `The ${resource} resource failed independently.`,
      true,
    );
  }

  return {
    status: 200,
    body: {
      ok: true,
      data: resourceData(resource, scenario),
      request_id: requestId(resource),
    },
  };
}
