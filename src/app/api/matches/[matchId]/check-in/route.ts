// VERZUS M7.3 INDEPENDENT CHECK-IN RESOURCE ROUTE
// VERZUS M7.4 IDEMPOTENT CHECK-IN MUTATION ROUTE

import { randomUUID } from "node:crypto";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { matchCheckInRequestRawSchema } from "@/features/matches/operations/api/match-check-in-api.schema";
import { parseMatchOperationState } from "@/features/matches/operations/model/match-operations.state";
import {
  executeMatchCheckIn,
  handleMatchResourceRead,
  MatchCheckInServiceError,
  getTerminalMutationBlock,
} from "@/features/matches/operations/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function headers(requestId: string) {
  return {
    "Cache-Control": "no-store, max-age=0",
    "X-Request-ID": requestId,
  };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ matchId: string }> },
): Promise<NextResponse> {
  return handleMatchResourceRead("check-in", request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ matchId: string }> },
): Promise<NextResponse> {
  const { matchId } = await context.params;
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  const idempotencyKey = request.headers.get("idempotency-key")?.trim();

  if (!idempotencyKey || idempotencyKey.length < 16 || idempotencyKey.length > 128) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "INVALID_IDEMPOTENCY_KEY",
          message: "A 16 to 128 character Idempotency-Key header is required.",
          request_id: requestId,
          retryable: false,
          field_errors: { idempotencyKey: ["Provide a valid idempotency key."] },
        },
      },
      { status: 400, headers: headers(requestId) },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = null;
  }
  const parsed = matchCheckInRequestRawSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "The check-in command is invalid.",
          request_id: requestId,
          retryable: false,
          field_errors: parsed.error.flatten().fieldErrors,
        },
      },
      { status: 400, headers: headers(requestId) },
    );
  }

  const seedState = parseMatchOperationState(
    request.nextUrl.searchParams.get("state") ?? undefined,
  );

  // VERZUS M7.7 TERMINAL MUTATION GUARD
  const terminalBlock = getTerminalMutationBlock(matchId, seedState);
  if (terminalBlock) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: terminalBlock.code,
          message: terminalBlock.message,
          request_id: requestId,
          retryable: terminalBlock.retryable,
          current_state: terminalBlock.state,
          current_version: terminalBlock.matchVersion,
        },
      },
      { status: terminalBlock.status, headers: headers(requestId) },
    );
  }

  try {
    const result = executeMatchCheckIn({
      matchId,
      seedState,
      expectedState: parsed.data.expected_state,
      expectedVersion: parsed.data.expected_version,
      idempotencyKey,
    });

    return NextResponse.json(
      {
        ok: true,
        request_id: requestId,
        data: {
          outcome: result.outcome,
          match_id: result.snapshot.matchId,
          seed_state: result.snapshot.seedState,
          state: result.snapshot.state,
          match_version: result.snapshot.matchVersion,
          current_user: {
            participant_id: result.snapshot.currentUser.participantId,
            checked_in: result.snapshot.currentUser.checkedIn,
            ready: result.snapshot.currentUser.ready,
          },
          opponent: {
            participant_id: result.snapshot.opponent.participantId,
            checked_in: result.snapshot.opponent.checkedIn,
            ready: result.snapshot.opponent.ready,
          },
          check_in_event_count: result.snapshot.checkInEventCount,
          last_event_id: result.snapshot.lastEventId,
          last_updated_at: result.snapshot.lastUpdatedAt,
          clock: result.snapshot.clock,
          event: {
            event_id: result.event.eventId,
            created_at: result.event.createdAt,
            replayed: result.event.replayed,
          },
        },
      },
      { status: 200, headers: headers(requestId) },
    );
  } catch (error) {
    if (error instanceof MatchCheckInServiceError) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: error.code,
            message: error.message,
            request_id: requestId,
            retryable: error.retryable,
            field_errors: error.fieldErrors,
          },
        },
        { status: error.status, headers: headers(requestId) },
      );
    }
    throw error;
  }
}
