// VERZUS M11.5 ABORTABLE PLAYER HISTORY CLIENTS

import { ZodError } from "zod";

import {
  adaptPlayerDetailedStatistics,
  adaptPlayerHistoryError,
  adaptPlayerMatchHistory,
  PlayerHistoryResourceError,
} from "../adapter/player-history.adapter";
import type {
  PlayerDetailedStatistics,
  PlayerHistoryGameFilter,
  PlayerHistoryResultFilter,
  PlayerHistoryScenario,
  PlayerMatchHistoryPage,
  PlayerStatisticsWindow,
} from "../model/player-history.types";

async function requestJson(path: string, signal?: AbortSignal): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(path, {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
      headers: { accept: "application/json" },
      ...(signal ? { signal } : {}),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new PlayerHistoryResourceError({
      code: "PLAYER_HISTORY_OFFLINE",
      message: "Player history is unavailable while offline.",
      requestId: "profile-history-offline",
      retryable: true,
    });
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new PlayerHistoryResourceError({
      code: "PLAYER_HISTORY_INVALID_JSON",
      message: "Player history returned unreadable data.",
      requestId: response.headers.get("x-request-id") ?? "profile-history-invalid-json",
      retryable: true,
      status: response.status,
    });
  }

  if (!response.ok) throw adaptPlayerHistoryError(payload, response.status);
  return payload;
}

function wrapSchemaFailure(error: unknown, resource: string): never {
  if (error instanceof PlayerHistoryResourceError) throw error;
  if (error instanceof ZodError) {
    throw new PlayerHistoryResourceError({
      code: "PLAYER_HISTORY_SCHEMA_INVALID",
      message: `${resource} returned malformed data.`,
      requestId: `profile-${resource}-schema-invalid`,
      retryable: true,
    });
  }
  throw error;
}

export async function getPlayerMatchHistory(input: {
  game: PlayerHistoryGameFilter;
  result: PlayerHistoryResultFilter;
  page: number;
  scenario: PlayerHistoryScenario;
  signal?: AbortSignal;
}): Promise<PlayerMatchHistoryPage> {
  const params = new URLSearchParams({
    game: input.game,
    result: input.result,
    page: String(input.page),
  });
  try {
    return adaptPlayerMatchHistory(
      await requestJson(`/api/profile/matches?${params.toString()}`, input.signal),
    );
  } catch (error) {
    return wrapSchemaFailure(error, "matches");
  }
}

export async function getPlayerDetailedStatistics(input: {
  game: PlayerHistoryGameFilter;
  window: PlayerStatisticsWindow;
  scenario: PlayerHistoryScenario;
  signal?: AbortSignal;
}): Promise<PlayerDetailedStatistics> {
  const params = new URLSearchParams({ game: input.game, window: input.window });
  try {
    return adaptPlayerDetailedStatistics(
      await requestJson(`/api/profile/statistics?${params.toString()}`, input.signal),
    );
  } catch (error) {
    return wrapSchemaFailure(error, "statistics");
  }
}
