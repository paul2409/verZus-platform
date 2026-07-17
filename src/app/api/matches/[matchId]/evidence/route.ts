// VERZUS M7.3 INDEPENDENT EVIDENCE RESOURCE ROUTE
// VERZUS M7.6 RESTRICTED INDEPENDENT EVIDENCE UPLOAD

import { randomUUID } from "node:crypto";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  matchOperationStates,
  parseMatchOperationState,
  type MatchOperationState,
} from "@/features/matches";
import {
  MatchResultOperationError,
  executeMatchEvidenceUpload,
  handleMatchResourceRead,
  presentEvidenceMutation,
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
  return handleMatchResourceRead("evidence", request, context);
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
      message: "Evidence uploads require an Idempotency-Key header.",
      retryable: false,
      status: 400,
    });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return failure(requestId, {
      code: "MATCH_EVIDENCE_INVALID_FORM",
      message: "The evidence upload form could not be read.",
      retryable: false,
      status: 400,
    });
  }

  const expectedStateValue = form.get("expected_state");
  const expectedVersionValue = form.get("expected_version");
  const file = form.get("file");
  if (
    typeof expectedStateValue !== "string" ||
    !matchOperationStates.includes(expectedStateValue as MatchOperationState) ||
    typeof expectedVersionValue !== "string" ||
    !/^\d+$/.test(expectedVersionValue) ||
    !(file instanceof File)
  ) {
    return failure(requestId, {
      code: "MATCH_EVIDENCE_VALIDATION_FAILED",
      message: "Evidence requires a valid match state, version and file.",
      retryable: false,
      status: 400,
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
    const result = await executeMatchEvidenceUpload({
      matchId,
      seedState,
      expectedState: expectedStateValue as MatchOperationState,
      expectedVersion: Number(expectedVersionValue),
      idempotencyKey,
      fileName: file.name,
      mimeType: file.type,
      bytes: new Uint8Array(await file.arrayBuffer()),
    });
    return NextResponse.json(
      { ok: true, data: presentEvidenceMutation(result), request_id: requestId },
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
      code: "MATCH_EVIDENCE_INTERNAL_ERROR",
      message: "The evidence upload could not be completed.",
      retryable: true,
      status: 500,
    });
  }
}
