import "server-only";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  crewOperationHeaders,
  handleCrewOperationFailure,
  parseCrewOperationBody,
  requestIdFor,
  requireCrewApiActor,
  requireCrewIdempotencyKey,
} from "../../server/crew-operation.http";
import {
  changeCrewMemberRoleRawSchema,
  removeCrewMemberRawSchema,
  transferCrewOwnershipRawSchema,
} from "../schema/crew-governance.schema";
import {
  changeCrewMemberRole,
  getCrewGovernanceForRead,
  removeCrewMember,
  transferCrewOwnership,
} from "./crew-governance.service";

const STAGE = "governance";

function serializeSnapshot(snapshot: Awaited<ReturnType<typeof getCrewGovernanceForRead>>) {
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

function successResponse(
  requestId: string,
  result: Awaited<ReturnType<typeof changeCrewMemberRole>>,
) {
  return NextResponse.json(
    {
      ok: true,
      request_id: requestId,
      outcome: result.outcome,
      event_id: result.eventId,
      replayed: result.replayed,
      data: serializeSnapshot(result.snapshot),
    },
    { headers: crewOperationHeaders(requestId, STAGE) },
  );
}

async function prepareMutation(request: NextRequest) {
  const requestId = requestIdFor(request);
  const auth = await requireCrewApiActor(request, requestId, STAGE);
  if ("response" in auth) return { requestId, response: auth.response } as const;
  const key = requireCrewIdempotencyKey(request, requestId, STAGE);
  if ("response" in key) return { requestId, response: key.response } as const;
  return { requestId, userId: auth.userId, idempotencyKey: key.idempotencyKey } as const;
}

export async function handleCrewGovernanceGet(
  request: NextRequest,
  context: { params: Promise<{ crewId: string }> },
) {
  const requestId = requestIdFor(request);
  const auth = await requireCrewApiActor(request, requestId, STAGE);
  if ("response" in auth) return auth.response;
  try {
    const { crewId } = await context.params;
    const snapshot = await getCrewGovernanceForRead(crewId, auth.userId);
    return NextResponse.json(
      { ok: true, request_id: requestId, data: serializeSnapshot(snapshot) },
      { headers: crewOperationHeaders(requestId, STAGE) },
    );
  } catch (error) {
    return handleCrewOperationFailure(requestId, STAGE, error);
  }
}

export async function handleChangeCrewMemberRole(
  request: NextRequest,
  context: { params: Promise<{ crewId: string; memberId: string }> },
) {
  const prepared = await prepareMutation(request);
  if ("response" in prepared) return prepared.response;
  const parsed = await parseCrewOperationBody(request, changeCrewMemberRoleRawSchema, prepared.requestId, STAGE);
  if ("response" in parsed) return parsed.response;
  const params = await context.params;
  try {
    return successResponse(
      prepared.requestId,
      await changeCrewMemberRole({
        crewId: params.crewId,
        memberId: params.memberId,
        actorUserId: prepared.userId,
        expectedVersion: parsed.data.expected_version,
        role: parsed.data.role,
        reason: parsed.data.reason,
        idempotencyKey: prepared.idempotencyKey,
      }),
    );
  } catch (error) {
    return handleCrewOperationFailure(prepared.requestId, STAGE, error);
  }
}

export async function handleRemoveCrewMember(
  request: NextRequest,
  context: { params: Promise<{ crewId: string; memberId: string }> },
) {
  const prepared = await prepareMutation(request);
  if ("response" in prepared) return prepared.response;
  const parsed = await parseCrewOperationBody(request, removeCrewMemberRawSchema, prepared.requestId, STAGE);
  if ("response" in parsed) return parsed.response;
  const params = await context.params;
  try {
    return successResponse(
      prepared.requestId,
      await removeCrewMember({
        crewId: params.crewId,
        memberId: params.memberId,
        actorUserId: prepared.userId,
        expectedVersion: parsed.data.expected_version,
        reason: parsed.data.reason,
        idempotencyKey: prepared.idempotencyKey,
      }),
    );
  } catch (error) {
    return handleCrewOperationFailure(prepared.requestId, STAGE, error);
  }
}

export async function handleTransferCrewOwnership(
  request: NextRequest,
  context: { params: Promise<{ crewId: string }> },
) {
  const prepared = await prepareMutation(request);
  if ("response" in prepared) return prepared.response;
  const parsed = await parseCrewOperationBody(request, transferCrewOwnershipRawSchema, prepared.requestId, STAGE);
  if ("response" in parsed) return parsed.response;
  const { crewId } = await context.params;
  try {
    return successResponse(
      prepared.requestId,
      await transferCrewOwnership({
        crewId,
        targetMemberId: parsed.data.target_member_id,
        actorUserId: prepared.userId,
        expectedVersion: parsed.data.expected_version,
        reason: parsed.data.reason,
        idempotencyKey: prepared.idempotencyKey,
      }),
    );
  } catch (error) {
    return handleCrewOperationFailure(prepared.requestId, STAGE, error);
  }
}
