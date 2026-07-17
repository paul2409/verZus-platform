// VERZUS M8.5 INDEPENDENT LIVE UPDATE API

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  leaderboardModes,
  type LeaderboardMode,
} from "@/features/leaderboards/foundation/model/leaderboard-foundation.types";
import {
  leaderboardLiveUpdateScenarios,
  type LeaderboardLiveUpdateScenario,
} from "@/features/leaderboards/live/model/leaderboard-live.types";
import { getMockLeaderboardLiveUpdate } from "@/features/leaderboards/live/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function isMode(value: string): value is LeaderboardMode {
  return leaderboardModes.includes(value as LeaderboardMode);
}

function scenario(request: NextRequest): LeaderboardLiveUpdateScenario {
  const value = request.nextUrl.searchParams.get("scenario") ?? "normal";
  return leaderboardLiveUpdateScenarios.includes(value as LeaderboardLiveUpdateScenario)
    ? (value as LeaderboardLiveUpdateScenario)
    : "normal";
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ mode: string }> },
): Promise<NextResponse> {
  const { mode } = await context.params;
  if (!isMode(mode)) {
    const requestId = `mock-leaderboard-updates-${globalThis.crypto.randomUUID()}`;
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

  const result = getMockLeaderboardLiveUpdate(
    mode,
    request.nextUrl.searchParams,
    scenario(request),
  );
  const response = NextResponse.json(result.body, {
    status: result.status,
    headers: {
      "cache-control": "no-store, max-age=0",
      "x-verzus-resource": "leaderboard-updates",
    },
  });
  const body = result.body as { request_id?: string };
  if (body.request_id) response.headers.set("x-request-id", body.request_id);
  return response;
}
