import "server-only";

import { randomUUID } from "node:crypto";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { z } from "zod";

import { readRuntimeSession, readRuntimeSessionToken } from "@/lib/session/runtime-session.server";

import { CrewOperationError } from "./crew-operation.service";

export function crewOperationHeaders(requestId: string, stage: string) {
  return {
    "cache-control": "no-store, max-age=0",
    "x-request-id": requestId,
    "x-crew-operation-stage": stage,
  };
}

export function crewOperationErrorResponse(
  requestId: string,
  stage: string,
  input: {
    code: string;
    message: string;
    status: number;
    retryable: boolean;
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
    { status: input.status, headers: crewOperationHeaders(requestId, stage) },
  );
}

export async function requireCrewApiActor(
  request: NextRequest,
  requestId: string,
  stage: string,
) {
  const session = await readRuntimeSession(readRuntimeSessionToken(request));
  if (!session.user || !session.session) {
    return {
      response: crewOperationErrorResponse(requestId, stage, {
        code: "CREW_UNAUTHORIZED",
        message: "Authentication is required to manage Crews.",
        status: 401,
        retryable: false,
      }),
    } as const;
  }
  if (session.state !== "authenticated") {
    return {
      response: crewOperationErrorResponse(requestId, stage, {
        code: "CREW_FORBIDDEN",
        message: "Complete account verification and onboarding before managing Crews.",
        status: 403,
        retryable: false,
      }),
    } as const;
  }
  return { userId: session.user.id } as const;
}

export function requestIdFor(request: NextRequest) {
  return request.headers.get("x-request-id") ?? randomUUID();
}

export function requireCrewIdempotencyKey(
  request: NextRequest,
  requestId: string,
  stage: string,
) {
  const idempotencyKey = request.headers.get("idempotency-key")?.trim();
  if (!idempotencyKey || idempotencyKey.length < 16 || idempotencyKey.length > 128) {
    return {
      response: crewOperationErrorResponse(requestId, stage, {
        code: "INVALID_IDEMPOTENCY_KEY",
        message: "A 16 to 128 character Idempotency-Key header is required.",
        status: 400,
        retryable: false,
        fieldErrors: { idempotencyKey: ["Provide a valid idempotency key."] },
      }),
    } as const;
  }
  return { idempotencyKey } as const;
}

export async function parseCrewOperationBody<TSchema extends z.ZodTypeAny>(
  request: NextRequest,
  schema: TSchema,
  requestId: string,
  stage: string,
) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = null;
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return {
      response: crewOperationErrorResponse(requestId, stage, {
        code: "VALIDATION_ERROR",
        message: "The Crew operation payload is invalid.",
        status: 400,
        retryable: false,
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      }),
    } as const;
  }
  return { data: parsed.data as z.infer<TSchema> } as const;
}

export function handleCrewOperationFailure(
  requestId: string,
  stage: string,
  error: unknown,
) {
  if (error instanceof CrewOperationError) {
    return crewOperationErrorResponse(requestId, stage, {
      code: error.code,
      message: error.message,
      status: error.status,
      retryable: error.retryable,
      ...(error.fieldErrors ? { fieldErrors: error.fieldErrors } : {}),
    });
  }
  console.error(
    JSON.stringify({
      level: "error",
      feature: "crews",
      stage,
      requestId,
      message: error instanceof Error ? error.message : "Unknown Crew operation failure",
    }),
  );
  return crewOperationErrorResponse(requestId, stage, {
    code: "CREW_OPERATION_UNAVAILABLE",
    message: "Crew operations are temporarily unavailable.",
    status: 503,
    retryable: true,
  });
}
