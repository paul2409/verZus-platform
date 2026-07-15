// VERZUS M5 STEPS 5.9-5.13

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getPlayAccessFailure, readPlayScenario } from "./mock-play.http";
import { readStoredMockCheckIn, writeStoredMockCheckIn } from "./mock-check-in.cookie";
import { decideMockPlayCheckIn } from "./mock-check-in.service";

export async function handleMockPlayCheckIn(request: NextRequest): Promise<NextResponse> {
  const accessFailure = getPlayAccessFailure(request);

  if (accessFailure) {
    return accessFailure;
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    payload = null;
  }

  const decision = decideMockPlayCheckIn({
    scenario: readPlayScenario(request),
    payload,
    idempotencyHeader: request.headers.get("idempotency-key"),
    existingRecord: readStoredMockCheckIn(request),
  });

  const response = NextResponse.json(decision.body, {
    status: decision.status,
    headers: {
      "cache-control": "no-store",
      "x-verzus-resource": "current-check-in",
    },
  });

  if (decision.recordToPersist) {
    writeStoredMockCheckIn(response, decision.recordToPersist);
  }

  const body = decision.body as {
    ok?: boolean;
    request_id?: string;
    error?: { request_id?: string; code?: string };
  };

  console.warn(
    JSON.stringify({
      event: "play.check_in.completed",
      route: "/api/check-ins/current",
      status: decision.status,
      success: body.ok === true,
      requestId: body.request_id ?? body.error?.request_id ?? "unknown",
      errorCode: body.error?.code ?? null,
      release: process.env.NEXT_PUBLIC_RELEASE_SHA ?? "local",
    }),
  );

  return response;
}
