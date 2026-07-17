// VERZUS M8.9 MATCH INTEL API ROUTE

import { randomUUID } from "node:crypto";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  createMatchIntelModel,
  normalizeMatchIntelScenario,
  serializeMatchIntelModel,
} from "@/features/matches/intel-card/resource";

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
  context: { params: Promise<{ matchId: string }> },
): Promise<NextResponse> {
  const { matchId } = await context.params;
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  const scenario = normalizeMatchIntelScenario(request.nextUrl.searchParams.get("scenario"));

  if (scenario === "slow") await new Promise((resolve) => setTimeout(resolve, 1_200));
  if (scenario === "error") {
    return errorResponse(
      requestId,
      503,
      "MATCH_INTEL_UNAVAILABLE",
      "Match intel is temporarily unavailable.",
      true,
    );
  }
  if (scenario === "not-found") {
    return errorResponse(
      requestId,
      404,
      "MATCH_INTEL_NOT_FOUND",
      "Match intel was not found.",
      false,
    );
  }
  if (scenario === "malformed") {
    return NextResponse.json(
      { data: { id: matchId }, meta: { request_id: requestId } },
      { status: 200, headers: { "Cache-Control": "no-store", "X-Request-ID": requestId } },
    );
  }

  const freshness = scenario === "stale" ? "stale" : scenario === "partial" ? "partial" : "fresh";
  const model = createMatchIntelModel(matchId);

  return NextResponse.json(
    {
      data: serializeMatchIntelModel(model),
      meta: {
        request_id: requestId,
        fetched_at: new Date().toISOString(),
        freshness,
        source: "mock-match-intel",
      },
    },
    { status: 200, headers: { "Cache-Control": "no-store", "X-Request-ID": requestId } },
  );
}
