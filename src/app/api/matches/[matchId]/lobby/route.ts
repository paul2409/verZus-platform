// VERZUS M7.3 INDEPENDENT LOBBY RESOURCE ROUTE
// VERZUS M7.5 IDEMPOTENT LOBBY AND MATCH-START MUTATION ROUTE

import { randomUUID } from "node:crypto";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { matchLobbyRequestRawSchema } from "@/features/matches/operations/api/match-lobby-api.schema";
import { parseMatchOperationState } from "@/features/matches/operations/model/match-operations.state";
import {
  executeMatchLobbyOperation,
  handleMatchResourceRead,
  MatchLobbyServiceError,
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

export function GET(request: NextRequest, context: { params: Promise<{ matchId: string }> }) {
  return handleMatchResourceRead("lobby", request, context);
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
  const parsed = matchLobbyRequestRawSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "The lobby command is invalid.",
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
    const result = executeMatchLobbyOperation({
      matchId,
      seedState,
      expectedState: parsed.data.expected_state,
      expectedVersion: parsed.data.expected_version,
      idempotencyKey,
      action: parsed.data.action,
      ...(parsed.data.issue ? { issue: parsed.data.issue } : {}),
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
            entered: result.snapshot.currentUser.entered,
            ready: result.snapshot.currentUser.ready,
          },
          opponent: {
            participant_id: result.snapshot.opponent.participantId,
            checked_in: result.snapshot.opponent.checkedIn,
            entered: result.snapshot.opponent.entered,
            ready: result.snapshot.opponent.ready,
          },
          connection: {
            lobby_code: result.snapshot.connection.lobbyCode,
            platform: result.snapshot.connection.platform,
            server_region: result.snapshot.connection.serverRegion,
            join_method: result.snapshot.connection.joinMethod,
          },
          action_event_count: result.snapshot.actionEventCount,
          issue_count: result.snapshot.issueCount,
          last_issue: result.snapshot.lastIssue
            ? {
                issue_id: result.snapshot.lastIssue.issueId,
                category: result.snapshot.lastIssue.category,
                summary: result.snapshot.lastIssue.summary,
                status: result.snapshot.lastIssue.status,
                created_at: result.snapshot.lastIssue.createdAt,
              }
            : null,
          last_event_id: result.snapshot.lastEventId,
          last_updated_at: result.snapshot.lastUpdatedAt,
          clock: result.snapshot.clock,
          event: {
            event_id: result.event.eventId,
            action: result.event.action,
            created_at: result.event.createdAt,
            replayed: result.event.replayed,
          },
        },
      },
      { status: 200, headers: headers(requestId) },
    );
  } catch (error) {
    if (error instanceof MatchLobbyServiceError) {
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
