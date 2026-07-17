// VERZUS M7.7 TERMINAL OPERATIONS API ROUTE

import { randomUUID } from "node:crypto";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { parseMatchOperationState } from "@/features/matches";
import { matchTerminalRequestRawSchema } from "@/features/matches/operations/api";
import {
  matchTerminalRoles,
  type MatchTerminalRole,
} from "@/features/matches/operations/model/match-terminal-operations.types";
import {
  executeMatchTerminalCommand,
  getMatchTerminalSnapshot,
  MatchTerminalOperationError,
} from "@/features/matches/operations/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

function responseHeaders(requestId: string) {
  return { "Cache-Control": "no-store, max-age=0", "X-Request-ID": requestId };
}

function roleFrom(request: NextRequest): MatchTerminalRole | null {
  const value = request.headers.get("x-verzus-role");
  return matchTerminalRoles.includes(value as MatchTerminalRole)
    ? (value as MatchTerminalRole)
    : null;
}

function presentSnapshot(snapshot: ReturnType<typeof getMatchTerminalSnapshot>) {
  return {
    match_id: snapshot.matchId,
    seed_state: snapshot.seedState,
    state: snapshot.state,
    match_version: snapshot.matchVersion,
    terminal_reason: snapshot.terminalReason,
    terminal_at: snapshot.terminalAt,
    actor_role: snapshot.actorRole,
    audit_event_id: snapshot.auditEventId,
    terminal_event_count: snapshot.terminalEventCount,
    last_updated_at: snapshot.lastUpdatedAt,
    clock: snapshot.clock,
  };
}

function failure(
  requestId: string,
  input: { code: string; message: string; retryable: boolean; status: number },
) {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: input.code,
        message: input.message,
        request_id: requestId,
        retryable: input.retryable,
      },
    },
    { status: input.status, headers: responseHeaders(requestId) },
  );
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ matchId: string }> },
): Promise<NextResponse> {
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  const role = roleFrom(request);
  if (!role) {
    return failure(requestId, {
      code: "MATCH_TERMINAL_UNAUTHORIZED",
      message: "Authentication is required to read terminal match operations.",
      retryable: false,
      status: 401,
    });
  }
  const { matchId } = await context.params;
  const seedState = parseMatchOperationState(
    request.nextUrl.searchParams.get("state") ?? undefined,
  );
  return NextResponse.json(
    {
      ok: true,
      data: presentSnapshot(getMatchTerminalSnapshot(matchId, seedState)),
      request_id: requestId,
    },
    { status: 200, headers: responseHeaders(requestId) },
  );
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ matchId: string }> },
): Promise<NextResponse> {
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  const role = roleFrom(request);
  if (!role) {
    return failure(requestId, {
      code: "MATCH_TERMINAL_UNAUTHORIZED",
      message: "Authentication is required for terminal match operations.",
      retryable: false,
      status: 401,
    });
  }
  const idempotencyKey = request.headers.get("idempotency-key")?.trim();
  if (!idempotencyKey || idempotencyKey.length < 16 || idempotencyKey.length > 128) {
    return failure(requestId, {
      code: "INVALID_IDEMPOTENCY_KEY",
      message: "A 16 to 128 character Idempotency-Key header is required.",
      retryable: false,
      status: 400,
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = null;
  }
  const parsed = matchTerminalRequestRawSchema.safeParse(body);
  if (!parsed.success) {
    return failure(requestId, {
      code: "MATCH_TERMINAL_VALIDATION_FAILED",
      message: parsed.error.issues.map((issue) => issue.message).join(" "),
      retryable: false,
      status: 400,
    });
  }

  const { matchId } = await context.params;
  const seedState = parseMatchOperationState(
    request.nextUrl.searchParams.get("state") ?? undefined,
  );
  try {
    const result = executeMatchTerminalCommand({
      matchId,
      seedState,
      expectedState: parsed.data.expected_state,
      expectedVersion: parsed.data.expected_version,
      idempotencyKey,
      action: parsed.data.action,
      actorRole: role,
      reason: parsed.data.reason,
    });
    return NextResponse.json(
      {
        ok: true,
        request_id: requestId,
        data: {
          outcome: result.outcome,
          snapshot: presentSnapshot(result.snapshot),
          event: {
            audit_event_id: result.event.auditEventId,
            action: result.event.action,
            actor_role: result.event.actorRole,
            reason: result.event.reason,
            previous_state: result.event.previousState,
            next_state: result.event.nextState,
            previous_version: result.event.previousVersion,
            next_version: result.event.nextVersion,
            created_at: result.event.createdAt,
            replayed: result.event.replayed,
          },
        },
      },
      { status: 200, headers: responseHeaders(requestId) },
    );
  } catch (error) {
    if (error instanceof MatchTerminalOperationError) {
      return failure(requestId, {
        code: error.code,
        message: error.message,
        retryable: error.retryable,
        status: error.status,
      });
    }
    return failure(requestId, {
      code: "MATCH_TERMINAL_INTERNAL_ERROR",
      message: "The terminal match operation could not be completed.",
      retryable: true,
      status: 500,
    });
  }
}
