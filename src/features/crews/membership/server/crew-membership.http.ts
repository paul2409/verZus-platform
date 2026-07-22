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
  createCrewInviteRawSchema,
  decideCrewApplicationRawSchema,
  decideCrewInviteRawSchema,
  expireCrewMembershipRawSchema,
  leaveCrewRawSchema,
  submitCrewApplicationRawSchema,
} from "../schema/crew-membership.schema";
import {
  createCrewInvite,
  decideCrewApplication,
  decideCrewInvite,
  expireCrewMembershipItems,
  getCrewMembershipForRead,
  leaveCrewMembership,
  submitCrewApplication,
} from "./crew-membership.service";

const STAGE = "membership";

function serializeSnapshot(snapshot: Awaited<ReturnType<typeof getCrewMembershipForRead>>) {
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

function successResponse(
  requestId: string,
  result: Awaited<ReturnType<typeof submitCrewApplication>>,
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

async function contextCrewId(context: { params: Promise<{ crewId: string }> }) {
  return (await context.params).crewId;
}

export async function handleCrewMembershipGet(
  request: NextRequest,
  context: { params: Promise<{ crewId: string }> },
) {
  const requestId = requestIdFor(request);
  const auth = await requireCrewApiActor(request, requestId, STAGE);
  if ("response" in auth) return auth.response;
  try {
    const snapshot = await getCrewMembershipForRead(await contextCrewId(context), auth.userId);
    return NextResponse.json(
      { ok: true, request_id: requestId, data: serializeSnapshot(snapshot) },
      { headers: crewOperationHeaders(requestId, STAGE) },
    );
  } catch (error) {
    return handleCrewOperationFailure(requestId, STAGE, error);
  }
}

async function prepareMutation(
  request: NextRequest,
  stage = STAGE,
) {
  const requestId = requestIdFor(request);
  const auth = await requireCrewApiActor(request, requestId, stage);
  if ("response" in auth) return { requestId, response: auth.response } as const;
  const key = requireCrewIdempotencyKey(request, requestId, stage);
  if ("response" in key) return { requestId, response: key.response } as const;
  return { requestId, userId: auth.userId, idempotencyKey: key.idempotencyKey } as const;
}

export async function handleSubmitCrewApplication(
  request: NextRequest,
  context: { params: Promise<{ crewId: string }> },
) {
  const prepared = await prepareMutation(request);
  if ("response" in prepared) return prepared.response;
  const parsed = await parseCrewOperationBody(request, submitCrewApplicationRawSchema, prepared.requestId, STAGE);
  if ("response" in parsed) return parsed.response;
  try {
    return successResponse(
      prepared.requestId,
      await submitCrewApplication({
        crewId: await contextCrewId(context),
        actorUserId: prepared.userId,
        expectedVersion: parsed.data.expected_version,
        game: parsed.data.game,
        message: parsed.data.message,
        idempotencyKey: prepared.idempotencyKey,
      }),
    );
  } catch (error) {
    return handleCrewOperationFailure(prepared.requestId, STAGE, error);
  }
}

export async function handleDecideCrewApplication(
  request: NextRequest,
  context: { params: Promise<{ crewId: string; applicationId: string }> },
) {
  const prepared = await prepareMutation(request);
  if ("response" in prepared) return prepared.response;
  const parsed = await parseCrewOperationBody(request, decideCrewApplicationRawSchema, prepared.requestId, STAGE);
  if ("response" in parsed) return parsed.response;
  const params = await context.params;
  try {
    return successResponse(
      prepared.requestId,
      await decideCrewApplication({
        crewId: params.crewId,
        applicationId: params.applicationId,
        actorUserId: prepared.userId,
        expectedVersion: parsed.data.expected_version,
        decision: parsed.data.decision,
        idempotencyKey: prepared.idempotencyKey,
      }),
    );
  } catch (error) {
    return handleCrewOperationFailure(prepared.requestId, STAGE, error);
  }
}

export async function handleCreateCrewInvite(
  request: NextRequest,
  context: { params: Promise<{ crewId: string }> },
) {
  const prepared = await prepareMutation(request);
  if ("response" in prepared) return prepared.response;
  const parsed = await parseCrewOperationBody(request, createCrewInviteRawSchema, prepared.requestId, STAGE);
  if ("response" in parsed) return parsed.response;
  try {
    return successResponse(
      prepared.requestId,
      await createCrewInvite({
        crewId: await contextCrewId(context),
        actorUserId: prepared.userId,
        expectedVersion: parsed.data.expected_version,
        playerHandle: parsed.data.player_handle,
        role: parsed.data.role,
        idempotencyKey: prepared.idempotencyKey,
      }),
    );
  } catch (error) {
    return handleCrewOperationFailure(prepared.requestId, STAGE, error);
  }
}

export async function handleDecideCrewInvite(
  request: NextRequest,
  context: { params: Promise<{ crewId: string; inviteId: string }> },
) {
  const prepared = await prepareMutation(request);
  if ("response" in prepared) return prepared.response;
  const parsed = await parseCrewOperationBody(request, decideCrewInviteRawSchema, prepared.requestId, STAGE);
  if ("response" in parsed) return parsed.response;
  const params = await context.params;
  try {
    return successResponse(
      prepared.requestId,
      await decideCrewInvite({
        crewId: params.crewId,
        inviteId: params.inviteId,
        actorUserId: prepared.userId,
        expectedVersion: parsed.data.expected_version,
        decision: parsed.data.decision,
        idempotencyKey: prepared.idempotencyKey,
      }),
    );
  } catch (error) {
    return handleCrewOperationFailure(prepared.requestId, STAGE, error);
  }
}

export async function handleLeaveCrewMembership(
  request: NextRequest,
  context: { params: Promise<{ crewId: string }> },
) {
  const prepared = await prepareMutation(request);
  if ("response" in prepared) return prepared.response;
  const parsed = await parseCrewOperationBody(request, leaveCrewRawSchema, prepared.requestId, STAGE);
  if ("response" in parsed) return parsed.response;
  try {
    return successResponse(
      prepared.requestId,
      await leaveCrewMembership({
        crewId: await contextCrewId(context),
        actorUserId: prepared.userId,
        expectedVersion: parsed.data.expected_version,
        idempotencyKey: prepared.idempotencyKey,
      }),
    );
  } catch (error) {
    return handleCrewOperationFailure(prepared.requestId, STAGE, error);
  }
}

export async function handleExpireCrewMembership(
  request: NextRequest,
  context: { params: Promise<{ crewId: string }> },
) {
  const prepared = await prepareMutation(request);
  if ("response" in prepared) return prepared.response;
  const parsed = await parseCrewOperationBody(request, expireCrewMembershipRawSchema, prepared.requestId, STAGE);
  if ("response" in parsed) return parsed.response;
  try {
    return successResponse(
      prepared.requestId,
      await expireCrewMembershipItems({
        crewId: await contextCrewId(context),
        actorUserId: prepared.userId,
        expectedVersion: parsed.data.expected_version,
        idempotencyKey: prepared.idempotencyKey,
      }),
    );
  } catch (error) {
    return handleCrewOperationFailure(prepared.requestId, STAGE, error);
  }
}
