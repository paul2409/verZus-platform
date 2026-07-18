// VERZUS M9.5 CREW MEMBERSHIP HTTP HANDLERS

import { randomUUID } from "node:crypto";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { z } from "zod";

import {
  createCrewInviteRawSchema,
  decideCrewApplicationRawSchema,
  decideCrewInviteRawSchema,
  expireCrewMembershipRawSchema,
  leaveCrewRawSchema,
  submitCrewApplicationRawSchema,
} from "../schema/crew-membership.schema";
import {
  createCrewInvite,
  CrewMembershipServiceError,
  decideCrewApplication,
  decideCrewInvite,
  expireCrewMembershipItems,
  getCrewMembershipForRead,
  leaveCrewMembership,
  submitCrewApplication,
} from "./crew-membership.service";

function responseHeaders(requestId: string) {
  return {
    "Cache-Control": "no-store, max-age=0",
    "X-Request-ID": requestId,
    "X-Crew-Membership-Stage": "9.5",
  };
}

function serializeSnapshot(snapshot: ReturnType<typeof getCrewMembershipForRead>) {
  return {
    crew_id: snapshot.crewId,
    version: snapshot.version,
    capacity: snapshot.capacity,
    member_count: snapshot.memberCount,
    server_now: snapshot.serverNow,
    viewer: {
      player_id: snapshot.viewer.playerId,
      player_name: snapshot.viewer.playerName,
      handle: snapshot.viewer.handle,
      crew_id: snapshot.viewer.crewId,
      role: snapshot.viewer.role,
      joined_at: snapshot.viewer.joinedAt,
    },
    applications: snapshot.applications.map((item) => ({
      id: item.id,
      crew_id: item.crewId,
      player_id: item.playerId,
      player_name: item.playerName,
      handle: item.handle,
      game: item.game,
      trust: item.trust,
      message: item.message,
      status: item.status,
      created_at: item.createdAt,
      expires_at: item.expiresAt,
      decided_at: item.decidedAt,
      decided_by: item.decidedBy,
    })),
    invites: snapshot.invites.map((item) => ({
      id: item.id,
      crew_id: item.crewId,
      player_id: item.playerId,
      player_name: item.playerName,
      handle: item.handle,
      role: item.role,
      status: item.status,
      created_at: item.createdAt,
      expires_at: item.expiresAt,
      decided_at: item.decidedAt,
      invited_by: item.invitedBy,
    })),
    audit_events: snapshot.auditEvents.map((item) => ({
      id: item.id,
      crew_id: item.crewId,
      actor_id: item.actorId,
      action: item.action,
      subject_id: item.subjectId,
      created_at: item.createdAt,
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
        message: "The Crew membership command is invalid.",
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
        fieldErrors: { idempotencyKey: ["Provide a valid idempotency key."] },
      }),
    } as const;
  }
  return { idempotencyKey } as const;
}

function successResponse(requestId: string, result: ReturnType<typeof submitCrewApplication>) {
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

function executeSafely(requestId: string, action: () => ReturnType<typeof submitCrewApplication>) {
  try {
    return successResponse(requestId, action());
  } catch (error) {
    if (error instanceof CrewMembershipServiceError) {
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

export async function handleCrewMembershipGet(
  request: NextRequest,
  context: { params: Promise<{ crewId: string }> },
) {
  const { crewId } = await context.params;
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  return NextResponse.json(
    { ok: true, request_id: requestId, data: serializeSnapshot(getCrewMembershipForRead(crewId)) },
    { status: 200, headers: responseHeaders(requestId) },
  );
}

export async function handleSubmitCrewApplication(
  request: NextRequest,
  context: { params: Promise<{ crewId: string }> },
) {
  const { crewId } = await context.params;
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  const key = requireIdempotencyKey(request, requestId);
  if ("response" in key) return key.response;
  const parsed = await parseBody(request, submitCrewApplicationRawSchema, requestId);
  if ("response" in parsed) return parsed.response;
  return executeSafely(requestId, () =>
    submitCrewApplication({
      crewId,
      expectedVersion: parsed.data.expected_version,
      game: parsed.data.game,
      message: parsed.data.message,
      idempotencyKey: key.idempotencyKey,
    }),
  );
}

export async function handleDecideCrewApplication(
  request: NextRequest,
  context: { params: Promise<{ crewId: string; applicationId: string }> },
) {
  const { crewId, applicationId } = await context.params;
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  const key = requireIdempotencyKey(request, requestId);
  if ("response" in key) return key.response;
  const parsed = await parseBody(request, decideCrewApplicationRawSchema, requestId);
  if ("response" in parsed) return parsed.response;
  return executeSafely(requestId, () =>
    decideCrewApplication({
      crewId,
      applicationId,
      expectedVersion: parsed.data.expected_version,
      decision: parsed.data.decision,
      idempotencyKey: key.idempotencyKey,
    }),
  );
}

export async function handleCreateCrewInvite(
  request: NextRequest,
  context: { params: Promise<{ crewId: string }> },
) {
  const { crewId } = await context.params;
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  const key = requireIdempotencyKey(request, requestId);
  if ("response" in key) return key.response;
  const parsed = await parseBody(request, createCrewInviteRawSchema, requestId);
  if ("response" in parsed) return parsed.response;
  return executeSafely(requestId, () =>
    createCrewInvite({
      crewId,
      expectedVersion: parsed.data.expected_version,
      playerHandle: parsed.data.player_handle,
      role: parsed.data.role,
      idempotencyKey: key.idempotencyKey,
    }),
  );
}

export async function handleDecideCrewInvite(
  request: NextRequest,
  context: { params: Promise<{ crewId: string; inviteId: string }> },
) {
  const { crewId, inviteId } = await context.params;
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  const key = requireIdempotencyKey(request, requestId);
  if ("response" in key) return key.response;
  const parsed = await parseBody(request, decideCrewInviteRawSchema, requestId);
  if ("response" in parsed) return parsed.response;
  return executeSafely(requestId, () =>
    decideCrewInvite({
      crewId,
      inviteId,
      expectedVersion: parsed.data.expected_version,
      decision: parsed.data.decision,
      idempotencyKey: key.idempotencyKey,
    }),
  );
}

export async function handleLeaveCrewMembership(
  request: NextRequest,
  context: { params: Promise<{ crewId: string }> },
) {
  const { crewId } = await context.params;
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  const key = requireIdempotencyKey(request, requestId);
  if ("response" in key) return key.response;
  const parsed = await parseBody(request, leaveCrewRawSchema, requestId);
  if ("response" in parsed) return parsed.response;
  return executeSafely(requestId, () =>
    leaveCrewMembership({
      crewId,
      expectedVersion: parsed.data.expected_version,
      idempotencyKey: key.idempotencyKey,
    }),
  );
}

export async function handleExpireCrewMembership(
  request: NextRequest,
  context: { params: Promise<{ crewId: string }> },
) {
  const { crewId } = await context.params;
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  const key = requireIdempotencyKey(request, requestId);
  if ("response" in key) return key.response;
  const parsed = await parseBody(request, expireCrewMembershipRawSchema, requestId);
  if ("response" in parsed) return parsed.response;
  return executeSafely(requestId, () =>
    expireCrewMembershipItems({
      crewId,
      expectedVersion: parsed.data.expected_version,
      idempotencyKey: key.idempotencyKey,
    }),
  );
}
