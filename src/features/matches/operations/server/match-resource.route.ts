// VERZUS M7.3 INDEPENDENT MATCH RESOURCE ROUTE HANDLER

import { randomUUID } from "node:crypto";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { parseMatchOperationState } from "../model/match-operations.state";
import type { MatchOperationResourceName } from "../model/match-resource.types";
import {
  buildMatchResourceFixtures,
  getMatchResourceFixture,
  parseMatchOperationReadScenario,
} from "./match-resource.fixture";

const failurePolicy = {
  offline: { status: 503, code: "offline", retryable: true },
  unauthorized: { status: 401, code: "unauthorized", retryable: false },
  forbidden: { status: 403, code: "forbidden", retryable: false },
  not_found: { status: 404, code: "not_found", retryable: false },
  maintenance: { status: 503, code: "maintenance", retryable: true },
  partial_failure: { status: 502, code: "upstream_unavailable", retryable: true },
} as const;

function noStoreHeaders(requestId: string) {
  return {
    "Cache-Control": "no-store, max-age=0",
    "X-Request-ID": requestId,
  };
}

export async function handleMatchResourceRead(
  resource: Exclude<MatchOperationResourceName, "clock">,
  request: NextRequest,
  context: { params: Promise<{ matchId: string }> },
): Promise<NextResponse> {
  const { matchId } = await context.params;
  const state = parseMatchOperationState(request.nextUrl.searchParams.get("state") ?? undefined);
  const scenario = parseMatchOperationReadScenario(request.nextUrl.searchParams.get("scenario"));
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  const now = new Date();
  const fixtures = buildMatchResourceFixtures(matchId, state, now);

  if (scenario === "malformed") {
    return NextResponse.json(
      { ok: true, data: { malformed: true }, request_id: requestId },
      { status: 200, headers: noStoreHeaders(requestId) },
    );
  }

  if (scenario in failurePolicy) {
    const policy = failurePolicy[scenario as keyof typeof failurePolicy];
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: policy.code,
          message: `The match ${resource} resource is unavailable for this controlled scenario.`,
          request_id: requestId,
          retryable: policy.retryable,
        },
      },
      { status: policy.status, headers: noStoreHeaders(requestId) },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      data: getMatchResourceFixture(fixtures, resource),
      request_id: requestId,
      meta: {
        server_now: fixtures.clock.serverNow,
        last_updated_at: fixtures.clock.issuedAt,
        freshness: scenario === "stale" ? "stale" : "fresh",
      },
    },
    { status: 200, headers: noStoreHeaders(requestId) },
  );
}
