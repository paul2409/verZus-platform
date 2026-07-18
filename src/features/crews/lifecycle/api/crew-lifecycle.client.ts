// VERZUS M9.7 CREW LIFECYCLE API CLIENT

import type {
  CrewLifecycleErrorShape,
  CrewLifecycleMutationResult,
  CrewLifecycleScenario,
  CrewLifecycleSnapshot,
  CrewLifecycleTarget,
} from "../model/crew-lifecycle.types";
import {
  crewLifecycleEnvelopeRawSchema,
  crewLifecycleErrorEnvelopeRawSchema,
} from "../schema/crew-lifecycle.schema";

export class CrewLifecycleClientError extends Error {
  readonly code: string;
  readonly requestId: string;
  readonly retryable: boolean;
  readonly fieldErrors: Record<string, string[]> | undefined;

  constructor(input: CrewLifecycleErrorShape) {
    super(input.message);
    this.name = "CrewLifecycleClientError";
    this.code = input.code;
    this.requestId = input.requestId;
    this.retryable = input.retryable;
    this.fieldErrors = input.fieldErrors;
  }
}

function adaptSnapshot(
  raw: ReturnType<typeof crewLifecycleEnvelopeRawSchema.parse>["data"],
): CrewLifecycleSnapshot {
  return {
    crewId: raw.crew_id,
    crewName: raw.crew_name,
    version: raw.version,
    serverNow: raw.server_now,
    state: raw.state,
    freshness: raw.freshness,
    viewer: {
      playerId: raw.viewer.player_id,
      role: raw.viewer.role,
      canManageLifecycle: raw.viewer.can_manage_lifecycle,
      canDisband: raw.viewer.can_disband,
    },
    controls: {
      allowedTransitions: raw.controls.allowed_transitions,
      disbandConfirmation: raw.controls.disband_confirmation,
      blockedReason: raw.controls.blocked_reason,
    },
    operations: {
      recruiting: raw.operations.recruiting,
      membershipMutationsAllowed: raw.operations.membership_mutations_allowed,
      leaveAllowed: raw.operations.leave_allowed,
      activityMode: raw.operations.activity_mode,
    },
    blockers: raw.blockers,
    auditEvents: raw.audit_events.map((event) => ({
      id: event.id,
      crewId: event.crew_id,
      actorId: event.actor_id,
      action: event.action,
      previousState: event.previous_state,
      nextState: event.next_state,
      reason: event.reason,
      createdAt: event.created_at,
    })),
  };
}

async function parseResponse(response: Response) {
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new CrewLifecycleClientError({
      code: "CREW_LIFECYCLE_INVALID_JSON",
      message: "Crew lifecycle returned unreadable data.",
      requestId: response.headers.get("x-request-id") ?? "crew-lifecycle-invalid-json",
      retryable: true,
    });
  }

  if (!response.ok) {
    const parsedError = crewLifecycleErrorEnvelopeRawSchema.safeParse(payload);
    if (parsedError.success) {
      throw new CrewLifecycleClientError({
        code: parsedError.data.error.code,
        message: parsedError.data.error.message,
        requestId: parsedError.data.error.request_id,
        retryable: parsedError.data.error.retryable,
        ...(parsedError.data.error.field_errors
          ? { fieldErrors: parsedError.data.error.field_errors }
          : {}),
      });
    }
    throw new CrewLifecycleClientError({
      code: "CREW_LIFECYCLE_REQUEST_FAILED",
      message: "Crew lifecycle request failed.",
      requestId: response.headers.get("x-request-id") ?? "crew-lifecycle-request-failed",
      retryable: response.status >= 500,
    });
  }

  const parsed = crewLifecycleEnvelopeRawSchema.safeParse(payload);
  if (!parsed.success) {
    throw new CrewLifecycleClientError({
      code: "CREW_LIFECYCLE_SCHEMA_INVALID",
      message: "Crew lifecycle response failed validation.",
      requestId: response.headers.get("x-request-id") ?? "crew-lifecycle-schema-invalid",
      retryable: false,
    });
  }
  return parsed.data;
}

async function postCommand(url: string, body: unknown): Promise<CrewLifecycleMutationResult> {
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
    throw new CrewLifecycleClientError({
      code: "CREW_LIFECYCLE_OFFLINE",
      message: "Crew lifecycle is unavailable while offline.",
      requestId: "crew-lifecycle-offline",
      retryable: true,
    });
  }
  const parsed = await parseResponse(response);
  return {
    outcome: parsed.outcome ?? "lifecycle_changed",
    snapshot: adaptSnapshot(parsed.data),
    eventId: parsed.event_id ?? parsed.request_id,
    replayed: parsed.replayed ?? false,
  };
}

export async function getCrewLifecycle(
  crewId: string,
  scenario: CrewLifecycleScenario,
  signal?: AbortSignal,
): Promise<CrewLifecycleSnapshot> {
  const params = new URLSearchParams();
  if (scenario !== "normal") params.set("scenario", scenario);
  const suffix = params.size > 0 ? `?${params.toString()}` : "";
  let response: Response;
  try {
    response = await fetch(`/api/crews/${encodeURIComponent(crewId)}/lifecycle${suffix}`, {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
      headers: { accept: "application/json" },
      ...(signal ? { signal } : {}),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new CrewLifecycleClientError({
      code: "CREW_LIFECYCLE_OFFLINE",
      message: "Crew lifecycle is unavailable while offline.",
      requestId: "crew-lifecycle-offline",
      retryable: true,
    });
  }
  return adaptSnapshot((await parseResponse(response)).data);
}

export const crewLifecycleCommands = {
  transition: (
    crewId: string,
    input: { expectedVersion: number; targetState: CrewLifecycleTarget; reason: string },
  ) =>
    postCommand(`/api/crews/${encodeURIComponent(crewId)}/lifecycle/transition`, {
      expected_version: input.expectedVersion,
      target_state: input.targetState,
      reason: input.reason,
    }),
  disband: (
    crewId: string,
    input: { expectedVersion: number; reason: string; confirmation: string },
  ) =>
    postCommand(`/api/crews/${encodeURIComponent(crewId)}/disband`, {
      expected_version: input.expectedVersion,
      reason: input.reason,
      confirmation: input.confirmation,
    }),
};
