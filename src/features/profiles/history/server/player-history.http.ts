// VERZUS M11.5 PLAYER HISTORY HTTP HANDLERS

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type {
  PlayerHistoryResourceName,
  PlayerHistoryScenario,
} from "../model/player-history.types";
import {
  normalizePlayerHistoryGame,
  normalizePlayerHistoryPage,
  normalizePlayerHistoryResult,
  normalizePlayerHistoryScenario,
  normalizePlayerStatisticsWindow,
  serializePlayerDetailedStatistics,
  serializePlayerMatchHistory,
} from "./player-history.service";

function requestId(resource: PlayerHistoryResourceName): string {
  return `profile-${resource}-${crypto.randomUUID()}`;
}

function failureFor(
  scenario: PlayerHistoryScenario,
  resource: PlayerHistoryResourceName,
): { code: string; message: string; retryable: boolean; status: number } | null {
  switch (scenario) {
    case "offline":
      return {
        code: "PLAYER_HISTORY_OFFLINE",
        message: `${resource} is unavailable while offline.`,
        retryable: true,
        status: 503,
      };
    case "error":
      return {
        code: "PLAYER_HISTORY_UNAVAILABLE",
        message: `${resource} is temporarily unavailable.`,
        retryable: true,
        status: 503,
      };
    case "unauthorized":
      return {
        code: "PLAYER_HISTORY_UNAUTHORIZED",
        message: `Authentication is required to access ${resource}.`,
        retryable: false,
        status: 401,
      };
    case "forbidden":
      return {
        code: "PLAYER_HISTORY_FORBIDDEN",
        message: `This profile cannot access ${resource}.`,
        retryable: false,
        status: 403,
      };
    case "not-found":
      return {
        code: "PLAYER_HISTORY_NOT_FOUND",
        message: `${resource} could not be found.`,
        retryable: false,
        status: 404,
      };
    case "maintenance":
      return {
        code: "PLAYER_HISTORY_MAINTENANCE",
        message: `${resource} is temporarily under maintenance.`,
        retryable: true,
        status: 503,
      };
    default:
      return null;
  }
}

function errorResponse(
  failure: NonNullable<ReturnType<typeof failureFor>>,
  id: string,
  scenario: PlayerHistoryScenario,
) {
  return NextResponse.json(
    {
      code: failure.code,
      message: failure.message,
      request_id: id,
      retryable: failure.retryable,
    },
    {
      status: failure.status,
      headers: {
        "cache-control": "no-store",
        "x-request-id": id,
        ...(scenario === "maintenance" ? { "retry-after": "60" } : {}),
      },
    },
  );
}

export async function handlePlayerMatchesGet(request: NextRequest): Promise<NextResponse> {
  const scenario = normalizePlayerHistoryScenario(request.nextUrl.searchParams.get("scenario"));
  const id = requestId("matches");
  if (scenario === "slow") await new Promise((resolve) => setTimeout(resolve, 1_200));

  const failure = failureFor(scenario, "matches");
  if (failure) return errorResponse(failure, id, scenario);

  if (scenario === "malformed") {
    return NextResponse.json(
      { items: "invalid", request_id: id },
      { headers: { "cache-control": "no-store", "x-request-id": id } },
    );
  }

  const game = normalizePlayerHistoryGame(request.nextUrl.searchParams.get("game"));
  const result = normalizePlayerHistoryResult(request.nextUrl.searchParams.get("result"));
  const page = normalizePlayerHistoryPage(request.nextUrl.searchParams.get("page"));
  const pageSize = 6;

  return NextResponse.json(
    serializePlayerMatchHistory({ scenario, game, result, page, pageSize, requestId: id }),
    { headers: { "cache-control": "no-store", "x-request-id": id } },
  );
}

export async function handlePlayerStatisticsGet(request: NextRequest): Promise<NextResponse> {
  const scenario = normalizePlayerHistoryScenario(request.nextUrl.searchParams.get("scenario"));
  const id = requestId("statistics");
  if (scenario === "slow") await new Promise((resolve) => setTimeout(resolve, 1_200));

  const failure = failureFor(scenario, "statistics");
  if (failure) return errorResponse(failure, id, scenario);

  if (scenario === "malformed") {
    return NextResponse.json(
      { matches: -1, win_rate: "invalid", request_id: id },
      { headers: { "cache-control": "no-store", "x-request-id": id } },
    );
  }

  const game = normalizePlayerHistoryGame(request.nextUrl.searchParams.get("game"));
  const window = normalizePlayerStatisticsWindow(request.nextUrl.searchParams.get("window"));

  return NextResponse.json(
    serializePlayerDetailedStatistics({ scenario, game, window, requestId: id }),
    { headers: { "cache-control": "no-store", "x-request-id": id } },
  );
}
