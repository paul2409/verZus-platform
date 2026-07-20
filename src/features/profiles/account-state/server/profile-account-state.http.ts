// VERZUS M11.7 PROFILE ACCOUNT-STATE HTTP HANDLER

import { randomUUID } from "node:crypto";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  normalizeProfileAccountStateScenario,
  serializeProfileAccountState,
} from "./profile-account-state.service";

function errorResponse(
  requestId: string,
  input: { code: string; message: string; status: number; retryable: boolean },
) {
  return NextResponse.json(
    {
      error: {
        code: input.code,
        message: input.message,
        request_id: requestId,
        retryable: input.retryable,
      },
    },
    {
      status: input.status,
      headers: { "cache-control": "no-store", "x-request-id": requestId },
    },
  );
}

export async function handleProfileAccountStateGet(request: NextRequest): Promise<NextResponse> {
  const requestId = `profile-account-state-${randomUUID()}`;
  const scenario = normalizeProfileAccountStateScenario(
    request.nextUrl.searchParams.get("scenario"),
  );

  if (scenario === "slow") await new Promise((resolve) => setTimeout(resolve, 1_200));
  if (scenario === "error") {
    return errorResponse(requestId, {
      code: "PROFILE_ACCOUNT_STATE_UNAVAILABLE",
      message: "Profile access status could not be confirmed.",
      status: 503,
      retryable: true,
    });
  }
  if (scenario === "offline") {
    return errorResponse(requestId, {
      code: "PROFILE_ACCOUNT_STATE_OFFLINE",
      message: "Profile access status is unavailable while offline.",
      status: 503,
      retryable: true,
    });
  }
  if (scenario === "maintenance") {
    return errorResponse(requestId, {
      code: "PROFILE_ACCOUNT_STATE_MAINTENANCE",
      message: "Profile access checks are temporarily under maintenance.",
      status: 503,
      retryable: true,
    });
  }
  if (scenario === "malformed") {
    return NextResponse.json(
      { data: { state: false }, meta: { request_id: requestId, source: "malformed" } },
      { headers: { "cache-control": "no-store", "x-request-id": requestId } },
    );
  }

  return NextResponse.json(
    {
      data: serializeProfileAccountState(scenario),
      meta: { request_id: requestId, source: "mock-profile-account-state" },
    },
    { headers: { "cache-control": "no-store", "x-request-id": requestId } },
  );
}
