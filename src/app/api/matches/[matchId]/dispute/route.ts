// VERZUS M7.3 INDEPENDENT DISPUTE RESOURCE ROUTE
// VERZUS M7.6 AUDITABLE DISPUTE CREATION

import { randomUUID } from "node:crypto";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { matchDisputeRequestRawSchema } from "@/features/matches/operations/api";
import { parseMatchOperationState } from "@/features/matches";
import {
  MatchResultOperationError,
  executeMatchDisputeCommand,
  handleMatchResourceRead,
  presentDisputeMutation,
  getTerminalMutationBlock,
} from "@/features/matches/operations/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

function headers(requestId: string) {
  return { "Cache-Control": "no-store, max-age=0", "X-Request-ID": requestId };
}

function failure(
  requestId: string,
  input: {
    code: string;
    message: string;
    retryable: boolean;
    status: number;
    fieldErrors?: Record<string, string[]>;
  },
) {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: input.code,
        message: input.message,
        request_id: requestId,
        retryable: input.retryable,
        ...(input.fieldErrors ? { field_errors: input.fieldErrors } : {}),
      },
    },
    { status: input.status, headers: headers(requestId) },
  );
}

export function GET(request: NextRequest, context: { params: Promise<{ matchId: string }> }) {
  return handleMatchResourceRead("dispute", request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ matchId: string }> },
): Promise<NextResponse> {
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  const idempotencyKey = request.headers.get("idempotency-key")?.trim();
  if (!idempotencyKey) {
    return failure(requestId, {
      code: "IDEMPOTENCY_KEY_REQUIRED",
      message: "Dispute creation requires an Idempotency-Key header.",
      retryable: false,
      status: 400,
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return failure(requestId, {
      code: "INVALID_JSON",
      message: "The dispute request body is not valid JSON.",
      retryable: false,
      status: 400,
    });
  }
  const parsed = matchDisputeRequestRawSchema.safeParse(body);
  if (!parsed.success) {
    return failure(requestId, {
      code: "MATCH_DISPUTE_VALIDATION_FAILED",
      message: "The dispute request is invalid.",
      retryable: false,
      status: 400,
      fieldErrors: { request: parsed.error.issues.map((issue) => issue.message) },
    });
  }

  const { matchId } = await context.params;
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
    const result = executeMatchDisputeCommand({
      matchId,
      seedState,
      expectedState: parsed.data.expected_state,
      expectedVersion: parsed.data.expected_version,
      idempotencyKey,
      reason: parsed.data.reason,
      summary: parsed.data.summary,
      claimedScore: parsed.data.claimed_score,
    });
    return NextResponse.json(
      { ok: true, data: presentDisputeMutation(result), request_id: requestId },
      { status: 200, headers: headers(requestId) },
    );
  } catch (error) {
    if (error instanceof MatchResultOperationError) {
      return failure(requestId, {
        code: error.code,
        message: error.message,
        retryable: error.retryable,
        status: error.status,
        ...(error.fieldErrors ? { fieldErrors: error.fieldErrors } : {}),
      });
    }
    return failure(requestId, {
      code: "MATCH_DISPUTE_INTERNAL_ERROR",
      message: "The dispute could not be created.",
      retryable: true,
      status: 500,
    });
  }
}
