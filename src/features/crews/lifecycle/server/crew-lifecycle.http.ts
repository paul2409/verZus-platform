// VERZUS M9.7 CREW LIFECYCLE HTTP HANDLERS

import { randomUUID } from "node:crypto";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { z } from "zod";

import { parseCrewLifecycleScenario } from "../model/crew-lifecycle.types";
import {
  crewLifecycleErrorEnvelopeRawSchema,
  disbandCrewRawSchema,
  transitionCrewLifecycleRawSchema,
} from "../schema/crew-lifecycle.schema";
import {
  CrewLifecycleServiceError,
  disbandCrew,
  getCrewLifecycleForRead,
  transitionCrewLifecycle,
} from "./crew-lifecycle.service";

void crewLifecycleErrorEnvelopeRawSchema;

function responseHeaders(requestId: string) {
  return {
    "Cache-Control": "no-store, max-age=0",
    "X-Request-ID": requestId,
    "X-Crew-Lifecycle-Stage": "9.7",
  };
}

function serializeSnapshot(snapshot: ReturnType<typeof getCrewLifecycleForRead>) {
  return {
    crew_id: snapshot.crewId,
    crew_name: snapshot.crewName,
    version: snapshot.version,
    server_now: snapshot.serverNow,
    state: snapshot.state,
    freshness: snapshot.freshness,
    viewer: {
      player_id: snapshot.viewer.playerId,
      role: snapshot.viewer.role,
      can_manage_lifecycle: snapshot.viewer.canManageLifecycle,
      can_disband: snapshot.viewer.canDisband,
    },
    controls: {
      allowed_transitions: snapshot.controls.allowedTransitions,
      disband_confirmation: snapshot.controls.disbandConfirmation,
      blocked_reason: snapshot.controls.blockedReason,
    },
    operations: {
      recruiting: snapshot.operations.recruiting,
      membership_mutations_allowed: snapshot.operations.membershipMutationsAllowed,
      leave_allowed: snapshot.operations.leaveAllowed,
      activity_mode: snapshot.operations.activityMode,
    },
    blockers: snapshot.blockers,
    audit_events: snapshot.auditEvents.map((event) => ({
      id: event.id,
      crew_id: event.crewId,
      actor_id: event.actorId,
      action: event.action,
      previous_state: event.previousState,
      next_state: event.nextState,
      reason: event.reason,
      created_at: event.createdAt,
    })),
  };
}

function errorResponse(
  requestId: string,
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
        field_errors: input.fieldErrors,
      },
    },
    { status: input.status, headers: responseHeaders(requestId) },
  );
}

async function parseBody<T extends z.ZodType>(request: NextRequest, schema: T, requestId: string) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = null;
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return {
      response: errorResponse(requestId, {
        code: "VALIDATION_ERROR",
        message: "The Crew lifecycle command is invalid.",
        status: 400,
        retryable: false,
        fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      }),
    } as const;
  }
  return { data: parsed.data } as const;
}

function requireIdempotencyKey(request: NextRequest, requestId: string) {
  const idempotencyKey = request.headers.get("idempotency-key")?.trim();
  if (!idempotencyKey || idempotencyKey.length < 16 || idempotencyKey.length > 128) {
    return {
      response: errorResponse(requestId, {
        code: "INVALID_IDEMPOTENCY_KEY",
        message: "A 16 to 128 character Idempotency-Key header is required.",
        status: 400,
        retryable: false,
      }),
    } as const;
  }
  return { idempotencyKey } as const;
}

function successResponse(requestId: string, result: ReturnType<typeof transitionCrewLifecycle>) {
  return NextResponse.json(
    {
      ok: true,
      request_id: requestId,
      outcome: result.outcome,
      event_id: result.eventId,
      replayed: result.replayed,
      data: serializeSnapshot(result.snapshot),
    },
    { status: 200, headers: responseHeaders(requestId) },
  );
}

function executeSafely(
  requestId: string,
  action: () => ReturnType<typeof transitionCrewLifecycle>,
) {
  try {
    return successResponse(requestId, action());
  } catch (error) {
    if (error instanceof CrewLifecycleServiceError) {
      return errorResponse(requestId, {
        code: error.code,
        message: error.message,
        status: error.status,
        retryable: error.retryable,
        ...(error.fieldErrors ? { fieldErrors: error.fieldErrors } : {}),
      });
    }
    throw error;
  }
}

export async function handleCrewLifecycleGet(
  request: NextRequest,
  context: { params: Promise<{ crewId: string }> },
) {
  const { crewId } = await context.params;
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  const scenario = parseCrewLifecycleScenario(request.nextUrl.searchParams.get("scenario"));
  if (scenario === "slow") await new Promise((resolve) => setTimeout(resolve, 1_000));
  if (scenario === "error" || scenario === "offline") {
    return errorResponse(requestId, {
      code: scenario === "offline" ? "CREW_LIFECYCLE_OFFLINE" : "CREW_LIFECYCLE_UNAVAILABLE",
      message:
        scenario === "offline"
          ? "Crew lifecycle is unavailable while offline."
          : "Crew lifecycle is temporarily unavailable.",
      status: 503,
      retryable: true,
    });
  }
  return NextResponse.json(
    {
      ok: true,
      request_id: requestId,
      data: serializeSnapshot(getCrewLifecycleForRead(crewId, scenario)),
    },
    { status: 200, headers: responseHeaders(requestId) },
  );
}

export async function handleCrewLifecycleTransition(
  request: NextRequest,
  context: { params: Promise<{ crewId: string }> },
) {
  const { crewId } = await context.params;
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  const key = requireIdempotencyKey(request, requestId);
  if ("response" in key) return key.response;
  const parsed = await parseBody(request, transitionCrewLifecycleRawSchema, requestId);
  if ("response" in parsed) return parsed.response;
  return executeSafely(requestId, () =>
    transitionCrewLifecycle({
      crewId,
      expectedVersion: parsed.data.expected_version,
      targetState: parsed.data.target_state,
      reason: parsed.data.reason,
      idempotencyKey: key.idempotencyKey,
    }),
  );
}

export async function handleCrewDisband(
  request: NextRequest,
  context: { params: Promise<{ crewId: string }> },
) {
  const { crewId } = await context.params;
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  const key = requireIdempotencyKey(request, requestId);
  if ("response" in key) return key.response;
  const parsed = await parseBody(request, disbandCrewRawSchema, requestId);
  if ("response" in parsed) return parsed.response;
  return executeSafely(requestId, () =>
    disbandCrew({
      crewId,
      expectedVersion: parsed.data.expected_version,
      reason: parsed.data.reason,
      confirmation: parsed.data.confirmation,
      idempotencyKey: key.idempotencyKey,
    }),
  );
}
