// VERZUS M7.2 MATCH CLOCK API ROUTE
// VERZUS M7.4 PERSISTED CHECK-IN CLOCK INTEGRATION
// VERZUS M7.5 LOBBY CLOCK INTEGRATION
// VERZUS M7.7 TERMINAL CLOCK INTEGRATION

import { randomUUID } from "node:crypto";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { parseMatchOperationState } from "@/features/matches";
import {
  createMatchClockEnvelope,
  getMatchTerminalSnapshot,
} from "@/features/matches/operations/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ matchId: string }> },
): Promise<NextResponse> {
  const { matchId } = await context.params;
  const seedState = parseMatchOperationState(
    request.nextUrl.searchParams.get("state") ?? undefined,
  );
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  const clock = getMatchTerminalSnapshot(matchId, seedState).clock;

  return NextResponse.json(createMatchClockEnvelope(clock, requestId), {
    status: 200,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "X-Request-ID": requestId,
    },
  });
}
