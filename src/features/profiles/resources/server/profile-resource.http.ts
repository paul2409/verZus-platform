import { randomUUID } from "node:crypto";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { readRuntimeSession, readRuntimeSessionToken } from "@/lib/session/runtime-session.server";

import type { ProfileResourceName } from "../model/profile-resource.types";
import { serializeProfileResource } from "./profile-resource.service";

function errorResponse(input: {
  requestId: string;
  status: number;
  code: string;
  message: string;
  retryable: boolean;
}): NextResponse {
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

export async function handleProfileResourceGet(
  request: NextRequest,
  resource: ProfileResourceName,
): Promise<NextResponse> {
  const requestId = `profile-${resource}-${randomUUID()}`;
  const session = await readRuntimeSession(readRuntimeSessionToken(request));

  if (!session.user || !session.session) {
    return errorResponse({
      requestId,
      status: 401,
      code: "PROFILE_RESOURCE_UNAUTHORIZED",
      message: "Authentication is required to access this profile resource.",
      retryable: false,
    });
  }

  if (session.state !== "authenticated") {
    return errorResponse({
      requestId,
      status: 403,
      code: "PROFILE_RESOURCE_FORBIDDEN",
      message: "Complete account verification and onboarding before accessing this profile.",
      retryable: false,
    });
  }

  try {
    const data = await serializeProfileResource(session.user.id, resource);
    if (data === null) {
      return errorResponse({
        requestId,
        status: 404,
        code: "PROFILE_RESOURCE_NOT_FOUND",
        message: "The player profile could not be found.",
        retryable: false,
      });
    }

    return NextResponse.json(
      {
        data,
        meta: {
          request_id: requestId,
          fetched_at: new Date().toISOString(),
          freshness: "fresh",
          source: "postgres-profile-resource",
          version: 1,
        },
      },
      { headers: { "cache-control": "no-store", "x-request-id": requestId } },
    );
  } catch (error) {
    console.error(
      JSON.stringify({
        level: "error",
        feature: "profiles",
        resource,
        requestId,
        message: error instanceof Error ? error.message : "Unknown profile resource failure",
      }),
    );
    return errorResponse({
      requestId,
      status: 503,
      code: "PROFILE_RESOURCE_UNAVAILABLE",
      message: `${resource} is temporarily unavailable.`,
      retryable: true,
    });
  }
}
