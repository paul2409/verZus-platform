// VERZUS M9.6 CREW GOVERNANCE API CLIENT

import type {
  CrewAssignableRole,
  CrewGovernanceErrorShape,
  CrewGovernanceMutationResult,
  CrewGovernanceSnapshot,
} from "../model/crew-governance.types";
import {
  crewGovernanceEnvelopeRawSchema,
  crewGovernanceErrorEnvelopeRawSchema,
} from "../schema/crew-governance.schema";

export class CrewGovernanceClientError extends Error {
  readonly code: string;
  readonly requestId: string;
  readonly retryable: boolean;
  readonly fieldErrors: Record<string, string[]> | undefined;

  constructor(input: CrewGovernanceErrorShape) {
    super(input.message);
    this.name = "CrewGovernanceClientError";
    this.code = input.code;
    this.requestId = input.requestId;
    this.retryable = input.retryable;
    this.fieldErrors = input.fieldErrors;
  }
}

function adaptSnapshot(
  raw: ReturnType<typeof crewGovernanceEnvelopeRawSchema.parse>["data"],
): CrewGovernanceSnapshot {
  return {
    crewId: raw.crew_id,
    version: raw.version,
    serverNow: raw.server_now,
    ownerId: raw.owner_id,
    viewer: {
      playerId: raw.viewer.player_id,
      role: raw.viewer.role,
      canManageMembers: raw.viewer.can_manage_members,
      canTransferOwnership: raw.viewer.can_transfer_ownership,
    },
    members: raw.members.map((member) => ({
      id: member.id,
      name: member.name,
      handle: member.handle,
      initials: member.initials,
      role: member.role,
      status: member.status,
      contribution: member.contribution,
      joinedAt: member.joined_at,
      management: {
        allowedRoles: member.management.allowed_roles,
        canRemove: member.management.can_remove,
        canTransferOwnership: member.management.can_transfer_ownership,
        blockReason: member.management.block_reason,
      },
    })),
    auditEvents: raw.audit_events.map((event) => ({
      id: event.id,
      crewId: event.crew_id,
      actorId: event.actor_id,
      action: event.action,
      subjectId: event.subject_id,
      detail: event.detail,
      createdAt: event.created_at,
    })),
  };
}

async function parseResponse(response: Response) {
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new CrewGovernanceClientError({
      code: "CREW_GOVERNANCE_INVALID_JSON",
      message: "Crew governance returned unreadable data.",
      requestId: response.headers.get("x-request-id") ?? "crew-governance-invalid-json",
      retryable: true,
    });
  }

  if (!response.ok) {
    const parsedError = crewGovernanceErrorEnvelopeRawSchema.safeParse(payload);
    if (parsedError.success) {
      throw new CrewGovernanceClientError({
        code: parsedError.data.error.code,
        message: parsedError.data.error.message,
        requestId: parsedError.data.error.request_id,
        retryable: parsedError.data.error.retryable,
        ...(parsedError.data.error.field_errors
          ? { fieldErrors: parsedError.data.error.field_errors }
          : {}),
      });
    }
    throw new CrewGovernanceClientError({
      code: "CREW_GOVERNANCE_REQUEST_FAILED",
      message: "Crew governance request failed.",
      requestId: response.headers.get("x-request-id") ?? "crew-governance-request-failed",
      retryable: response.status >= 500,
    });
  }

  const parsed = crewGovernanceEnvelopeRawSchema.safeParse(payload);
  if (!parsed.success) {
    throw new CrewGovernanceClientError({
      code: "CREW_GOVERNANCE_SCHEMA_INVALID",
      message: "Crew governance response failed validation.",
      requestId: response.headers.get("x-request-id") ?? "crew-governance-schema-invalid",
      retryable: false,
    });
  }
  return parsed.data;
}

async function postGovernanceCommand(
  url: string,
  body: unknown,
): Promise<CrewGovernanceMutationResult> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "idempotency-key": crypto.randomUUID(),
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new CrewGovernanceClientError({
      code: "CREW_GOVERNANCE_OFFLINE",
      message: "Crew governance is unavailable while offline.",
      requestId: "crew-governance-offline",
      retryable: true,
    });
  }
  const parsed = await parseResponse(response);
  return {
    outcome: parsed.outcome ?? "member_role_changed",
    snapshot: adaptSnapshot(parsed.data),
    eventId: parsed.event_id ?? parsed.request_id,
    replayed: parsed.replayed ?? false,
  };
}

export async function getCrewGovernance(
  crewId: string,
  signal?: AbortSignal,
): Promise<CrewGovernanceSnapshot> {
  let response: Response;
  try {
    response = await fetch(`/api/crews/${encodeURIComponent(crewId)}/governance`, {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
      headers: { accept: "application/json" },
      ...(signal ? { signal } : {}),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new CrewGovernanceClientError({
      code: "CREW_GOVERNANCE_OFFLINE",
      message: "Crew governance is unavailable while offline.",
      requestId: "crew-governance-offline",
      retryable: true,
    });
  }
  return adaptSnapshot((await parseResponse(response)).data);
}

export const crewGovernanceCommands = {
  changeRole: (
    crewId: string,
    memberId: string,
    input: { expectedVersion: number; role: CrewAssignableRole; reason: string },
  ) =>
    postGovernanceCommand(
      `/api/crews/${encodeURIComponent(crewId)}/members/${encodeURIComponent(memberId)}/role`,
      {
        expected_version: input.expectedVersion,
        role: input.role,
        reason: input.reason,
      },
    ),
  removeMember: (
    crewId: string,
    memberId: string,
    input: { expectedVersion: number; reason: string },
  ) =>
    postGovernanceCommand(
      `/api/crews/${encodeURIComponent(crewId)}/members/${encodeURIComponent(memberId)}/remove`,
      {
        expected_version: input.expectedVersion,
        reason: input.reason,
        confirmation: "REMOVE MEMBER",
      },
    ),
  transferOwnership: (
    crewId: string,
    input: { expectedVersion: number; targetMemberId: string; reason: string },
  ) =>
    postGovernanceCommand(`/api/crews/${encodeURIComponent(crewId)}/ownership/transfer`, {
      expected_version: input.expectedVersion,
      target_member_id: input.targetMemberId,
      reason: input.reason,
      confirmation: "TRANSFER OWNERSHIP",
    }),
};
