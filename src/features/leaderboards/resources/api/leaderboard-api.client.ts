// VERZUS M8.3 ABORTABLE LEADERBOARD API CLIENTS

import { serializeLeaderboardQueryState } from "../../explorer/model/leaderboard-query-state";
import type { LeaderboardQueryState } from "../../explorer/model/leaderboard-query-state";
import type { LeaderboardMode } from "../../foundation/model/leaderboard-foundation.types";
import type {
  LeaderboardCurrentPositionResourceData,
  LeaderboardModeCompositionResourceData,
  LeaderboardEntriesResourceData,
  LeaderboardResourceScenario,
  LeaderboardRewardsResourceData,
  LeaderboardStatusResourceData,
  LeaderboardSummaryResourceData,
} from "../model/leaderboard-resource.types";
import {
  adaptLeaderboardCompositionPayload,
  adaptLeaderboardCurrentPositionPayload,
  adaptLeaderboardEntriesPayload,
  adaptLeaderboardRewardsPayload,
  adaptLeaderboardStatusPayload,
  adaptLeaderboardSummaryPayload,
  LeaderboardApiClientError,
} from "./leaderboard-api.adapter";

export type LeaderboardReadRequest = {
  scenario?: LeaderboardResourceScenario;
  signal?: AbortSignal;
};

function resourcePath(mode: LeaderboardMode, resource: string): string {
  return `/api/leaderboards/${encodeURIComponent(mode)}/${resource}`;
}

function appendScenario(params: URLSearchParams, scenario?: LeaderboardResourceScenario) {
  if (scenario && scenario !== "normal") params.set("scenario", scenario);
  return params;
}

async function readResource<TData>(
  path: string,
  params: URLSearchParams,
  adapt: (payload: unknown) => TData,
  signal?: AbortSignal,
): Promise<TData> {
  const url = params.size > 0 ? `${path}?${params.toString()}` : path;
  let response: Response;

  try {
    response = await fetch(url, {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
      headers: { accept: "application/json" },
      ...(signal ? { signal } : {}),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new LeaderboardApiClientError({
      code: "offline",
      message: "Leaderboard resources are unavailable while offline.",
      requestId: "leaderboard-client-offline",
      retryable: true,
    });
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new LeaderboardApiClientError({
      code: "invalid_response",
      message: "The leaderboard service returned unreadable data.",
      requestId: response.headers.get("x-request-id") ?? "leaderboard-client-invalid-json",
      retryable: true,
    });
  }

  return adapt(payload);
}

// VERZUS M8.4 INDEPENDENT MODE COMPOSITION CLIENT
export function getLeaderboardComposition(
  mode: LeaderboardMode,
  request: LeaderboardReadRequest = {},
): Promise<LeaderboardModeCompositionResourceData> {
  return readResource(
    resourcePath(mode, "composition"),
    appendScenario(new URLSearchParams(), request.scenario),
    adaptLeaderboardCompositionPayload,
    request.signal,
  );
}

export function getLeaderboardSummary(
  mode: LeaderboardMode,
  request: LeaderboardReadRequest = {},
): Promise<LeaderboardSummaryResourceData> {
  return readResource(
    resourcePath(mode, "summary"),
    appendScenario(new URLSearchParams(), request.scenario),
    adaptLeaderboardSummaryPayload,
    request.signal,
  );
}

export function getLeaderboardEntries(
  state: LeaderboardQueryState,
  request: LeaderboardReadRequest = {},
): Promise<LeaderboardEntriesResourceData> {
  const params = serializeLeaderboardQueryState(state);
  params.delete("mode");
  return readResource(
    resourcePath(state.mode, "entries"),
    appendScenario(params, request.scenario),
    adaptLeaderboardEntriesPayload,
    request.signal,
  );
}

export function getLeaderboardCurrentPosition(
  mode: LeaderboardMode,
  request: LeaderboardReadRequest = {},
): Promise<LeaderboardCurrentPositionResourceData> {
  return readResource(
    resourcePath(mode, "current-position"),
    appendScenario(new URLSearchParams(), request.scenario),
    adaptLeaderboardCurrentPositionPayload,
    request.signal,
  );
}

export function getLeaderboardRewards(
  mode: LeaderboardMode,
  request: LeaderboardReadRequest = {},
): Promise<LeaderboardRewardsResourceData> {
  return readResource(
    resourcePath(mode, "rewards"),
    appendScenario(new URLSearchParams(), request.scenario),
    adaptLeaderboardRewardsPayload,
    request.signal,
  );
}

export function getLeaderboardStatus(
  mode: LeaderboardMode,
  request: LeaderboardReadRequest = {},
): Promise<LeaderboardStatusResourceData> {
  return readResource(
    resourcePath(mode, "status"),
    appendScenario(new URLSearchParams(), request.scenario),
    adaptLeaderboardStatusPayload,
    request.signal,
  );
}
