import "server-only";

import { randomUUID } from "node:crypto";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { proactiveRuleKeys } from "../model";
import { authorizeProactiveOperations } from "./proactive-operations.auth";
import { runProactiveOperations } from "./proactive-operations.service";

function errorResponse(input: {
  status: number;
  code: string;
  message: string;
  requestId: string;
  retryable: boolean;
}) {
  return NextResponse.json(
    {
      error: {
        code: input.code,
        message: input.message,
        request_id: input.requestId,
        retryable: input.retryable,
      },
    },
    {
      status: input.status,
      headers: { "cache-control": "no-store", "x-request-id": input.requestId },
    },
  );
}

export async function handleProactiveOperationsPost(request: NextRequest): Promise<NextResponse> {
  const requestId = request.headers.get("x-request-id") || `proactive-${randomUUID()}`;

  if (!authorizeProactiveOperations(request.headers.get("authorization"))) {
    return errorResponse({
      status: 401,
      code: "PROACTIVE_OPERATIONS_UNAUTHORIZED",
      message: "The proactive-operations runner could not be authorized.",
      requestId,
      retryable: false,
    });
  }

  try {
    const result = await runProactiveOperations({ requestId, trigger: "scheduler" });
    return NextResponse.json(
      {
        data: {
          run_id: result.runId,
          request_id: result.requestId,
          status: result.status,
          trigger: result.trigger,
          candidate_count: result.candidateCount,
          reminder_count: result.reminderCount,
          created_count: result.createdCount,
          updated_count: result.updatedCount,
          resolved_count: result.resolvedCount,
          started_at: result.startedAt,
          completed_at: result.completedAt,
        },
        meta: { request_id: requestId, rules: proactiveRuleKeys },
      },
      { headers: { "cache-control": "no-store", "x-request-id": requestId } },
    );
  } catch (error) {
    console.error("Proactive operations run failed", { requestId, error });
    return errorResponse({
      status: 503,
      code: "PROACTIVE_OPERATIONS_UNAVAILABLE",
      message: "Proactive operations could not complete. Retry the same scheduled run.",
      requestId,
      retryable: true,
    });
  }
}
