// VERZUS M9.6 CREW GOVERNANCE HTTP HANDLERS

import { randomUUID } from "node:crypto";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { z } from "zod";

import {
  changeCrewMemberRoleRawSchema,
  removeCrewMemberRawSchema,
  transferCrewOwnershipRawSchema,
} from "../schema/crew-governance.schema";
import {
  changeCrewMemberRole,
  CrewGovernanceServiceError,
  getCrewGovernanceForRead,
  removeCrewMember,
  transferCrewOwnership,
} from "./crew-governance.service";

function responseHeaders(requestId: string) {
  return {
    "Cache-Control": "no-store, max-age=0",
    "X-Request-ID": requestId,
    "X-Crew-Governance-Stage": "9.6",
  };
}

function serializeSnapshot(snapshot: ReturnType<typeof getCrewGovernanceForRead>) {
  return {
    crew_id: snapshot.crewId,
    version: snapshot.version,
    server_now: snapshot.serverNow,
    owner_id: snapshot.ownerId,
    viewer: {
      player_id: snapshot.viewer.playerId,
      role: snapshot.viewer.role,
      can_manage_members: snapshot.viewer.canManageMembers,
      can_transfer_ownership: snapshot.viewer.canTransferOwnership,
    },
    members: snapshot.members.map((member) => ({
      id: member.id,
      name: member.name,
      handle: member.handle,
      initials: member.initials,
      role: member.role,
      status: member.status,
      contribution: member.contribution,
      joined_at: member.joinedAt,
      management: {
        allowed_roles: member.management.allowedRoles,
        can_remove: member.management.canRemove,
        can_transfer_ownership: member.management.canTransferOwnership,
        block_reason: member.management.blockReason,
      },
    })),
    audit_events: snapshot.auditEvents.map((event) => ({
      id: event.id,
      crew_id: event.crewId,
      actor_id: event.actorId,
      action: event.action,
      subject_id: event.subjectId,
      detail: event.detail,
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
        message: "The Crew governance command is invalid.",
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

function successResponse(requestId: string, result: ReturnType<typeof changeCrewMemberRole>) {
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

function executeSafely(requestId: string, action: () => ReturnType<typeof changeCrewMemberRole>) {
  try {
    return successResponse(requestId, action());
  } catch (error) {
    if (error instanceof CrewGovernanceServiceError) {
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

export async function handleCrewGovernanceGet(
  request: NextRequest,
  context: { params: Promise<{ crewId: string }> },
) {
  const { crewId } = await context.params;
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  return NextResponse.json(
    { ok: true, request_id: requestId, data: serializeSnapshot(getCrewGovernanceForRead(crewId)) },
    { status: 200, headers: responseHeaders(requestId) },
  );
}

export async function handleChangeCrewMemberRole(
  request: NextRequest,
  context: { params: Promise<{ crewId: string; memberId: string }> },
) {
  const { crewId, memberId } = await context.params;
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  const key = requireIdempotencyKey(request, requestId);
  if ("response" in key) return key.response;
  const parsed = await parseBody(request, changeCrewMemberRoleRawSchema, requestId);
  if ("response" in parsed) return parsed.response;
  return executeSafely(requestId, () =>
    changeCrewMemberRole({
      crewId,
      memberId,
      expectedVersion: parsed.data.expected_version,
      role: parsed.data.role,
      reason: parsed.data.reason,
      idempotencyKey: key.idempotencyKey,
    }),
  );
}

export async function handleRemoveCrewMember(
  request: NextRequest,
  context: { params: Promise<{ crewId: string; memberId: string }> },
) {
  const { crewId, memberId } = await context.params;
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  const key = requireIdempotencyKey(request, requestId);
  if ("response" in key) return key.response;
  const parsed = await parseBody(request, removeCrewMemberRawSchema, requestId);
  if ("response" in parsed) return parsed.response;
  return executeSafely(requestId, () =>
    removeCrewMember({
      crewId,
      memberId,
      expectedVersion: parsed.data.expected_version,
      reason: parsed.data.reason,
      idempotencyKey: key.idempotencyKey,
    }),
  );
}

export async function handleTransferCrewOwnership(
  request: NextRequest,
  context: { params: Promise<{ crewId: string }> },
) {
  const { crewId } = await context.params;
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  const key = requireIdempotencyKey(request, requestId);
  if ("response" in key) return key.response;
  const parsed = await parseBody(request, transferCrewOwnershipRawSchema, requestId);
  if ("response" in parsed) return parsed.response;
  return executeSafely(requestId, () =>
    transferCrewOwnership({
      crewId,
      targetMemberId: parsed.data.target_member_id,
      expectedVersion: parsed.data.expected_version,
      reason: parsed.data.reason,
      idempotencyKey: key.idempotencyKey,
    }),
  );
}
