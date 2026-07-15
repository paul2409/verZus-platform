// VERZUS M5 STEPS 5.1-5.4

import type {
  CrewSummary,
  CurrentCheckIn,
  CurrentPosition,
  NextMatch,
  PlayerStatus,
  PlayScenario,
  RecentActivityItem,
  RecommendedCompetition,
} from "../model";
import {
  adaptCrewSummaryPayload,
  adaptCurrentCheckInPayload,
  adaptCurrentPositionPayload,
  adaptNextMatchPayload,
  adaptPlayerStatusPayload,
  adaptRecentActivityPayload,
  adaptRecommendedCompetitionsPayload,
} from "./play-api.adapter";

export interface PlayReadRequest {
  scenario?: PlayScenario;
  signal?: AbortSignal;
}

function buildUrl(path: string, scenario: PlayScenario | undefined): string {
  if (!scenario) {
    return path;
  }

  const search = new URLSearchParams({ scenario });
  return `${path}?${search.toString()}`;
}

async function readResource<T>(
  path: string,
  adapt: (payload: unknown) => T,
  request: PlayReadRequest = {},
): Promise<T> {
  const init: RequestInit = {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
    headers: {
      accept: "application/json",
    },
  };

  if (request.signal) {
    init.signal = request.signal;
  }

  const response = await fetch(buildUrl(path, request.scenario), init);
  const payload: unknown = await response.json();

  return adapt(payload);
}

export function getPlayerStatus(request: PlayReadRequest = {}): Promise<PlayerStatus> {
  return readResource("/api/me/status", adaptPlayerStatusPayload, request);
}

export function getNextMatch(request: PlayReadRequest = {}): Promise<NextMatch | null> {
  return readResource("/api/matches/next", adaptNextMatchPayload, request);
}

export function getCurrentCheckIn(request: PlayReadRequest = {}): Promise<CurrentCheckIn> {
  return readResource("/api/check-ins/current", adaptCurrentCheckInPayload, request);
}

export function getCurrentPosition(request: PlayReadRequest = {}): Promise<CurrentPosition> {
  return readResource("/api/leaderboards/me", adaptCurrentPositionPayload, request);
}

export function getCrewSummary(request: PlayReadRequest = {}): Promise<CrewSummary | null> {
  return readResource("/api/crews/me/summary", adaptCrewSummaryPayload, request);
}

export function getRecommendedCompetitions(
  request: PlayReadRequest = {},
): Promise<RecommendedCompetition[]> {
  return readResource(
    "/api/competitions/recommended",
    adaptRecommendedCompetitionsPayload,
    request,
  );
}

export function getRecentActivity(request: PlayReadRequest = {}): Promise<RecentActivityItem[]> {
  return readResource("/api/activity/recent", adaptRecentActivityPayload, request);
}
