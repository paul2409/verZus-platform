// VERZUS M9.4 CREW RESOURCE HTTP HANDLER

import { randomUUID } from "node:crypto";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { CrewResourceName } from "../model/crew-resource.types";
import { normalizeCrewResourceScenario, serializeCrewResource } from "./crew-resource.service";

function errorResponse(
  requestId: string,
  resource: CrewResourceName,
  status: number,
  code: string,
  message: string,
  retryable: boolean,
) {
  return NextResponse.json(
    { error: { code, message, request_id: requestId, retryable } },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        "X-Request-ID": requestId,
        "X-Crew-Resource": resource,
      },
    },
  );
}

export async function handleCrewResourceGet(
  request: NextRequest,
  context: { params: Promise<{ crewId: string }> },
  resource: CrewResourceName,
): Promise<NextResponse> {
  const { crewId } = await context.params;
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  const scenario = normalizeCrewResourceScenario(request.nextUrl.searchParams.get("scenario"));

  if (scenario === "slow") await new Promise((resolve) => setTimeout(resolve, 1_000));
  if (scenario === "error") {
    return errorResponse(
      requestId,
      resource,
      503,
      `CREW_${resource.toUpperCase()}_UNAVAILABLE`,
      `${resource} is temporarily unavailable.`,
      true,
    );
  }

  const data =
    scenario === "malformed"
      ? { resource, invalid: true }
      : serializeCrewResource(crewId, resource, scenario);

  return NextResponse.json(
    {
      data,
      meta: {
        request_id: requestId,
        fetched_at: new Date().toISOString(),
        freshness: scenario === "stale" ? "stale" : "fresh",
        source: "mock-crew-resource",
      },
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "X-Request-ID": requestId,
        "X-Crew-Resource": resource,
      },
    },
  );
}
