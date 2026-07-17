// VERZUS M8.9 PLAYER INTEL API ROUTE

import { randomUUID } from "node:crypto";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  createPlayerIntelModel,
  normalizePlayerIntelScenario,
  serializePlayerIntelModel,
} from "@/features/profiles/intel-card/resource";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function errorResponse(
  requestId: string,
  status: number,
  code: string,
  message: string,
  retryable: boolean,
) {
  return NextResponse.json(
    { error: { code, message, request_id: requestId, retryable } },
    { status, headers: { "Cache-Control": "no-store", "X-Request-ID": requestId } },
  );
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ playerId: string }> },
): Promise<NextResponse> {
  const { playerId } = await context.params;
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  const scenario = normalizePlayerIntelScenario(request.nextUrl.searchParams.get("scenario"));

  if (scenario === "slow") await new Promise((resolve) => setTimeout(resolve, 1_200));
  if (scenario === "error") {
    return errorResponse(
      requestId,
      503,
      "PLAYER_INTEL_UNAVAILABLE",
      "Player intel is temporarily unavailable.",
      true,
    );
  }
  if (scenario === "not-found") {
    return errorResponse(
      requestId,
      404,
      "PLAYER_INTEL_NOT_FOUND",
      "Player intel was not found.",
      false,
    );
  }
  if (scenario === "malformed") {
    return NextResponse.json(
      { data: { id: playerId }, meta: { request_id: requestId } },
      { status: 200, headers: { "Cache-Control": "no-store", "X-Request-ID": requestId } },
    );
  }

  const freshness = scenario === "stale" ? "stale" : scenario === "partial" ? "partial" : "fresh";
  const model = createPlayerIntelModel(playerId);

  return NextResponse.json(
    {
      data: serializePlayerIntelModel(model),
      meta: {
        request_id: requestId,
        fetched_at: new Date().toISOString(),
        freshness,
        source: "mock-player-intel",
      },
    },
    { status: 200, headers: { "Cache-Control": "no-store", "X-Request-ID": requestId } },
  );
}
