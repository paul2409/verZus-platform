// VERZUS M9.5 CREW MEMBERSHIP API CLIENT

import type {
  CrewMembershipErrorShape,
  CrewMembershipMutationResult,
  CrewMembershipSnapshot,
} from "../model/crew-membership.types";
import {
  crewMembershipEnvelopeRawSchema,
  crewMembershipErrorEnvelopeRawSchema,
} from "../schema/crew-membership.schema";

export class CrewMembershipClientError extends Error {
  readonly code: string;
  readonly requestId: string;
  readonly retryable: boolean;
  readonly fieldErrors: Record<string, string[]> | undefined;

  constructor(input: CrewMembershipErrorShape) {
    super(input.message);
    this.name = "CrewMembershipClientError";
    this.code = input.code;
    this.requestId = input.requestId;
    this.retryable = input.retryable;
    this.fieldErrors = input.fieldErrors;
  }
}

function adaptSnapshot(
  raw: ReturnType<typeof crewMembershipEnvelopeRawSchema.parse>["data"],
): CrewMembershipSnapshot {
  return {
    crewId: raw.crew_id,
    version: raw.version,
    capacity: raw.capacity,
    memberCount: raw.member_count,
    serverNow: raw.server_now,
    viewer: {
      playerId: raw.viewer.player_id,
      playerName: raw.viewer.player_name,
      handle: raw.viewer.handle,
      crewId: raw.viewer.crew_id,
      role: raw.viewer.role,
      joinedAt: raw.viewer.joined_at,
    },
    applications: raw.applications.map((item) => ({
      id: item.id,
      crewId: item.crew_id,
      playerId: item.player_id,
      playerName: item.player_name,
      handle: item.handle,
      game: item.game,
      trust: item.trust,
      message: item.message,
      status: item.status,
      createdAt: item.created_at,
      expiresAt: item.expires_at,
      decidedAt: item.decided_at,
      decidedBy: item.decided_by,
    })),
    invites: raw.invites.map((item) => ({
      id: item.id,
      crewId: item.crew_id,
      playerId: item.player_id,
      playerName: item.player_name,
      handle: item.handle,
      role: item.role,
      status: item.status,
      createdAt: item.created_at,
      expiresAt: item.expires_at,
      decidedAt: item.decided_at,
      invitedBy: item.invited_by,
    })),
    auditEvents: raw.audit_events.map((item) => ({
      id: item.id,
      crewId: item.crew_id,
      actorId: item.actor_id,
      action: item.action,
      subjectId: item.subject_id,
      createdAt: item.created_at,
    })),
  };
}

async function parseResponse(
  response: Response,
): Promise<ReturnType<typeof crewMembershipEnvelopeRawSchema.parse>> {
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new CrewMembershipClientError({
      code: "CREW_MEMBERSHIP_INVALID_JSON",
      message: "Crew membership returned unreadable data.",
      requestId: response.headers.get("x-request-id") ?? "crew-membership-invalid-json",
      retryable: true,
    });
  }

  if (!response.ok) {
    const parsedError = crewMembershipErrorEnvelopeRawSchema.safeParse(payload);
    if (parsedError.success) {
      throw new CrewMembershipClientError({
        code: parsedError.data.error.code,
        message: parsedError.data.error.message,
        requestId: parsedError.data.error.request_id,
        retryable: parsedError.data.error.retryable,
        ...(parsedError.data.error.field_errors
          ? { fieldErrors: parsedError.data.error.field_errors }
          : {}),
      });
    }
    throw new CrewMembershipClientError({
      code: "CREW_MEMBERSHIP_REQUEST_FAILED",
      message: "Crew membership request failed.",
      requestId: response.headers.get("x-request-id") ?? "crew-membership-request-failed",
      retryable: response.status >= 500,
    });
  }

  const parsed = crewMembershipEnvelopeRawSchema.safeParse(payload);
  if (!parsed.success) {
    throw new CrewMembershipClientError({
      code: "CREW_MEMBERSHIP_SCHEMA_INVALID",
      message: "Crew membership response failed validation.",
      requestId: response.headers.get("x-request-id") ?? "crew-membership-schema-invalid",
      retryable: false,
    });
  }
  return parsed.data;
}

async function postMembershipCommand(
  url: string,
  body: unknown,
): Promise<CrewMembershipMutationResult> {
  const idempotencyKey = crypto.randomUUID();
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      credentials: "same-origin",
      cache: "no-store",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "idempotency-key": idempotencyKey,
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new CrewMembershipClientError({
      code: "CREW_MEMBERSHIP_OFFLINE",
      message: "Crew membership is unavailable while offline.",
      requestId: "crew-membership-offline",
      retryable: true,
    });
  }
  const parsed = await parseResponse(response);
  return {
    outcome: parsed.outcome ?? "pending_items_expired",
    snapshot: adaptSnapshot(parsed.data),
    eventId: parsed.event_id ?? parsed.request_id,
    replayed: parsed.replayed ?? false,
  };
}

export async function getCrewMembership(
  crewId: string,
  signal?: AbortSignal,
): Promise<CrewMembershipSnapshot> {
  let response: Response;
  try {
    response = await fetch(`/api/crews/${encodeURIComponent(crewId)}/membership`, {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
      headers: { accept: "application/json" },
      ...(signal ? { signal } : {}),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new CrewMembershipClientError({
      code: "CREW_MEMBERSHIP_OFFLINE",
      message: "Crew membership is unavailable while offline.",
      requestId: "crew-membership-offline",
      retryable: true,
    });
  }
  return adaptSnapshot((await parseResponse(response)).data);
}

export const crewMembershipCommands = {
  submitApplication: (
    crewId: string,
    input: { expectedVersion: number; game: string; message: string },
  ) =>
    postMembershipCommand(`/api/crews/${encodeURIComponent(crewId)}/applications`, {
      expected_version: input.expectedVersion,
      game: input.game,
      message: input.message,
    }),
  decideApplication: (
    crewId: string,
    applicationId: string,
    input: { expectedVersion: number; decision: "accept" | "decline" },
  ) =>
    postMembershipCommand(
      `/api/crews/${encodeURIComponent(crewId)}/applications/${encodeURIComponent(applicationId)}/decision`,
      { expected_version: input.expectedVersion, decision: input.decision },
    ),
  createInvite: (
    crewId: string,
    input: {
      expectedVersion: number;
      playerHandle: string;
      role: "captain" | "manager" | "member" | "trial";
    },
  ) =>
    postMembershipCommand(`/api/crews/${encodeURIComponent(crewId)}/invites`, {
      expected_version: input.expectedVersion,
      player_handle: input.playerHandle,
      role: input.role,
    }),
  decideInvite: (
    crewId: string,
    inviteId: string,
    input: { expectedVersion: number; decision: "accept" | "decline" },
  ) =>
    postMembershipCommand(
      `/api/crews/${encodeURIComponent(crewId)}/invites/${encodeURIComponent(inviteId)}/decision`,
      { expected_version: input.expectedVersion, decision: input.decision },
    ),
  leave: (crewId: string, expectedVersion: number) =>
    postMembershipCommand(`/api/crews/${encodeURIComponent(crewId)}/membership/leave`, {
      expected_version: expectedVersion,
      confirmation: "LEAVE CREW",
    }),
  expire: (crewId: string, expectedVersion: number) =>
    postMembershipCommand(`/api/crews/${encodeURIComponent(crewId)}/membership/expire`, {
      expected_version: expectedVersion,
    }),
};
