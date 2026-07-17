// VERZUS M8.3 LEADERBOARD ROUTE HANDLER

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  leaderboardModes,
  type LeaderboardMode,
} from "../../foundation/model/leaderboard-foundation.types";
import {
  leaderboardResourceScenarios,
  type LeaderboardResourceScenario,
} from "../model/leaderboard-resource.types";
import {
  getMockLeaderboardResource,
  type LeaderboardResourceName,
} from "./mock-leaderboard.service";

function isLeaderboardMode(value: string): value is LeaderboardMode {
  return leaderboardModes.includes(value as LeaderboardMode);
}

function readScenario(request: NextRequest): LeaderboardResourceScenario {
  const value = request.nextUrl.searchParams.get("scenario") ?? "normal";
  return leaderboardResourceScenarios.includes(value as LeaderboardResourceScenario)
    ? (value as LeaderboardResourceScenario)
    : "normal";
}

function notFound(mode: string): NextResponse {
  const requestId = `mock-leaderboard-mode-${globalThis.crypto.randomUUID()}`;
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: "leaderboard_mode_not_found",
        message: `Leaderboard mode ${mode} was not found.`,
        request_id: requestId,
        retryable: false,
        field_errors: {},
      },
    },
    { status: 404, headers: { "x-request-id": requestId } },
  );
}

export async function handleMockLeaderboardGet(
  request: NextRequest,
  modeValue: string,
  resource: LeaderboardResourceName,
): Promise<NextResponse> {
  if (!isLeaderboardMode(modeValue)) return notFound(modeValue);

  const scenario = readScenario(request);
  // VERZUS M8.6 CONTROLLED SLOW RESOURCE
  if (scenario === "slow") {
    await new Promise((resolve) => setTimeout(resolve, 1_600));
  }

  const result = getMockLeaderboardResource(
    modeValue,
    resource,
    request.nextUrl.searchParams,
    scenario,
  );
  const response = NextResponse.json(result.body, {
    status: result.status,
    headers: {
      "cache-control": "no-store, max-age=0",
      "x-verzus-resource": `leaderboard-${resource}`,
    },
  });
  const body = result.body as {
    ok?: boolean;
    request_id?: string;
    error?: { request_id?: string };
  };
  const requestId = body.request_id ?? body.error?.request_id;
  if (requestId) response.headers.set("x-request-id", requestId);
  return response;
}
