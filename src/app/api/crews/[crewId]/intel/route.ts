// VERZUS M8.9 CREW INTEL API ROUTE

import { randomUUID } from "node:crypto";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  createCrewIntelModel,
  normalizeCrewIntelScenario,
  serializeCrewIntelModel,
} from "@/features/crews/intel-card/resource";

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
  context: { params: Promise<{ crewId: string }> },
): Promise<NextResponse> {
  const { crewId } = await context.params;
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  const scenario = normalizeCrewIntelScenario(request.nextUrl.searchParams.get("scenario"));

  if (scenario === "slow") await new Promise((resolve) => setTimeout(resolve, 1_200));
  if (scenario === "error") {
    return errorResponse(
      requestId,
      503,
      "CREW_INTEL_UNAVAILABLE",
      "Crew intel is temporarily unavailable.",
      true,
    );
  }
  if (scenario === "not-found") {
    return errorResponse(
      requestId,
      404,
      "CREW_INTEL_NOT_FOUND",
      "Crew intel was not found.",
      false,
    );
  }
  if (scenario === "malformed") {
    return NextResponse.json(
      { data: { id: crewId }, meta: { request_id: requestId } },
      { status: 200, headers: { "Cache-Control": "no-store", "X-Request-ID": requestId } },
    );
  }

  const freshness = scenario === "stale" ? "stale" : scenario === "partial" ? "partial" : "fresh";
  const model = createCrewIntelModel(crewId);

  return NextResponse.json(
    {
      data: serializeCrewIntelModel(model),
      meta: {
        request_id: requestId,
        fetched_at: new Date().toISOString(),
        freshness,
        source: "mock-crew-intel",
      },
    },
    { status: 200, headers: { "Cache-Control": "no-store", "X-Request-ID": requestId } },
  );
}
