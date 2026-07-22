import "server-only";

import { randomUUID } from "node:crypto";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { readRuntimeSession, readRuntimeSessionToken } from "@/lib/session/runtime-session.server";

import type { CrewResourceName } from "../resources/model/crew-resource.types";
import {
  CrewServiceError,
  createCrewForUser,
  getCrewRootState,
  readCrewSummaryForPlay,
  serializeCrewResource,
} from "./crew.service";

function headers(requestId: string, extra: Record<string, string> = {}) {
  return {
    "cache-control": "no-store, max-age=0",
    "x-request-id": requestId,
    ...extra,
  };
}

function errorResponse(input: {
  requestId: string;
  status: number;
  code: string;
  message: string;
  retryable: boolean;
  fieldErrors?: Record<string, string[]>;
}) {
  return NextResponse.json(
    {
      error: {
        code: input.code,
        message: input.message,
        request_id: input.requestId,
        retryable: input.retryable,
        ...(input.fieldErrors ? { field_errors: input.fieldErrors } : {}),
      },
    },
    { status: input.status, headers: headers(input.requestId) },
  );
}

async function requireApiUser(request: NextRequest, requestId: string) {
  const session = await readRuntimeSession(readRuntimeSessionToken(request));
  if (!session.user || !session.session) {
    return {
      response: errorResponse({
        requestId,
        status: 401,
        code: "CREW_UNAUTHORIZED",
        message: "Authentication is required to access Crew resources.",
        retryable: false,
      }),
    } as const;
  }
  if (session.state !== "authenticated") {
    return {
      response: errorResponse({
        requestId,
        status: 403,
        code: "CREW_FORBIDDEN",
        message: "Complete account verification and onboarding before using Crews.",
        retryable: false,
      }),
    } as const;
  }
  return { userId: session.user.id } as const;
}

export async function handleCrewCollectionGet(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  const auth = await requireApiUser(request, requestId);
  if ("response" in auth) return auth.response;

  const data = await getCrewRootState(auth.userId);
  return NextResponse.json(
    { ok: true, request_id: requestId, data },
    { headers: headers(requestId) },
  );
}

export async function handleCrewCreate(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  const auth = await requireApiUser(request, requestId);
  if ("response" in auth) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  try {
    const data = await createCrewForUser({
      userId: auth.userId,
      body,
      idempotencyKey: request.headers.get("idempotency-key"),
      requestId,
    });
    return NextResponse.json(
      { ok: true, request_id: requestId, data },
      { status: 201, headers: headers(requestId) },
    );
  } catch (error) {
    if (error instanceof CrewServiceError) {
      return errorResponse({
        requestId,
        status: error.status,
        code: error.code,
        message: error.message,
        retryable: error.retryable,
        ...(error.fieldErrors ? { fieldErrors: error.fieldErrors } : {}),
      });
    }
    console.error(
      JSON.stringify({
        level: "error",
        feature: "crews",
        operation: "create",
        requestId,
        message: error instanceof Error ? error.message : "Unknown Crew creation failure",
      }),
    );
    return errorResponse({
      requestId,
      status: 503,
      code: "CREW_CREATE_UNAVAILABLE",
      message: "Crew creation is temporarily unavailable.",
      retryable: true,
    });
  }
}

export async function handleCrewResourceGet(
  request: NextRequest,
  context: { params: Promise<{ crewId: string }> },
  resource: CrewResourceName,
): Promise<NextResponse> {
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  const auth = await requireApiUser(request, requestId);
  if ("response" in auth) return auth.response;
  const { crewId } = await context.params;

  try {
    const data = await serializeCrewResource(auth.userId, crewId, resource);
    if (data === null) {
      return errorResponse({
        requestId,
        status: 404,
        code: "CREW_NOT_FOUND",
        message: "The requested Crew could not be found.",
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
          source: "postgres-crew-resource",
        },
      },
      {
        status: 200,
        headers: headers(requestId, { "x-crew-resource": resource }),
      },
    );
  } catch (error) {
    console.error(
      JSON.stringify({
        level: "error",
        feature: "crews",
        resource,
        requestId,
        message: error instanceof Error ? error.message : "Unknown Crew resource failure",
      }),
    );
    return errorResponse({
      requestId,
      status: 503,
      code: "CREW_RESOURCE_UNAVAILABLE",
      message: `${resource} is temporarily unavailable.`,
      retryable: true,
    });
  }
}

export async function handleCrewSummaryGet(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  const auth = await requireApiUser(request, requestId);
  if ("response" in auth) return auth.response;

  const data = await readCrewSummaryForPlay(auth.userId);
  return NextResponse.json(
    { ok: true, request_id: requestId, data },
    { headers: headers(requestId) },
  );
}
