// VERZUS M9.7 SERVER-AUTHORITATIVE CREW LIFECYCLE SERVICE

import type { CrewLifecycle } from "../../foundation";
import type {
  CrewLifecycleMutationResult,
  CrewLifecycleScenario,
  CrewLifecycleSnapshot,
  CrewLifecycleTarget,
} from "../model/crew-lifecycle.types";
import {
  appendCrewLifecycleAudit,
  getCrewLifecycleReplay,
  getCrewLifecycleSnapshot,
  persistCrewLifecycleMutation,
} from "./crew-lifecycle.store";

export class CrewLifecycleServiceError extends Error {
  readonly code: string;
  readonly status: number;
  readonly retryable: boolean;
  readonly fieldErrors: Record<string, string[]> | undefined;

  constructor(input: {
    code: string;
    message: string;
    status: number;
    retryable: boolean;
    fieldErrors?: Record<string, string[]>;
  }) {
    super(input.message);
    this.name = "CrewLifecycleServiceError";
    this.code = input.code;
    this.status = input.status;
    this.retryable = input.retryable;
    this.fieldErrors = input.fieldErrors;
  }
}

function fail(code: string, message: string, status = 409, retryable = false): never {
  throw new CrewLifecycleServiceError({ code, message, status, retryable });
}

function assertVersion(snapshot: CrewLifecycleSnapshot, expectedVersion: number): void {
  if (snapshot.version !== expectedVersion) {
    fail(
      "CREW_LIFECYCLE_STALE_VERSION",
      "Crew lifecycle changed. Refresh before retrying this action.",
      409,
      true,
    );
  }
}

function actionFor(previous: CrewLifecycle, next: CrewLifecycleTarget) {
  if (next === "active" && previous === "archived") return "crew_restored" as const;
  if (next === "active") return "crew_activated" as const;
  if (next === "inactive") return "crew_deactivated" as const;
  return "crew_archived" as const;
}

export function transitionCrewLifecycle(
  input: {
    crewId: string;
    expectedVersion: number;
    targetState: CrewLifecycleTarget;
    reason: string;
    idempotencyKey: string;
  },
  now: Date = new Date(),
): CrewLifecycleMutationResult {
  const replay = getCrewLifecycleReplay(input.crewId, input.idempotencyKey, now);
  if (replay) return replay;
  const snapshot = getCrewLifecycleSnapshot(input.crewId, now);
  assertVersion(snapshot, input.expectedVersion);
  if (!snapshot.viewer.canManageLifecycle) {
    fail(
      "CREW_LIFECYCLE_FORBIDDEN",
      snapshot.controls.blockedReason ?? "Only the Crew owner can change lifecycle state.",
      403,
    );
  }
  if (!snapshot.controls.allowedTransitions.includes(input.targetState)) {
    fail(
      "CREW_LIFECYCLE_TRANSITION_INVALID",
      `${snapshot.state} cannot transition directly to ${input.targetState}.`,
    );
  }

  return persistCrewLifecycleMutation(input.crewId, input.idempotencyKey, {
    outcome: "lifecycle_changed",
    now,
    mutate: (next) => {
      const previousState = next.state;
      next.state = input.targetState;
      appendCrewLifecycleAudit(next, {
        crewId: input.crewId,
        actorId: next.viewer.playerId,
        action: actionFor(previousState, input.targetState),
        previousState,
        nextState: input.targetState,
        reason: input.reason,
        createdAt: now.toISOString(),
      });
    },
  });
}

export function disbandCrew(
  input: {
    crewId: string;
    expectedVersion: number;
    reason: string;
    confirmation: string;
    idempotencyKey: string;
  },
  now: Date = new Date(),
): CrewLifecycleMutationResult {
  const replay = getCrewLifecycleReplay(input.crewId, input.idempotencyKey, now);
  if (replay) return replay;
  const snapshot = getCrewLifecycleSnapshot(input.crewId, now);
  assertVersion(snapshot, input.expectedVersion);
  if (!snapshot.viewer.canDisband) {
    fail(
      "CREW_DISBAND_FORBIDDEN",
      snapshot.controls.blockedReason ?? "This Crew cannot be disbanded in its current state.",
      403,
    );
  }
  if (snapshot.blockers.some((blocker) => blocker.active)) {
    fail("CREW_DISBAND_BLOCKED", "Resolve active matches and disputes before disbanding.");
  }
  if (input.confirmation !== snapshot.controls.disbandConfirmation) {
    fail(
      "CREW_DISBAND_CONFIRMATION_INVALID",
      `Type ${snapshot.controls.disbandConfirmation} to confirm disbanding.`,
      400,
    );
  }

  return persistCrewLifecycleMutation(input.crewId, input.idempotencyKey, {
    outcome: "crew_disbanded",
    now,
    mutate: (next) => {
      const previousState = next.state;
      next.state = "disbanded";
      appendCrewLifecycleAudit(next, {
        crewId: input.crewId,
        actorId: next.viewer.playerId,
        action: "crew_disbanded",
        previousState,
        nextState: "disbanded",
        reason: input.reason,
        createdAt: now.toISOString(),
      });
    },
  });
}

export function getCrewLifecycleForRead(
  crewId: string,
  scenario: CrewLifecycleScenario = "normal",
  now: Date = new Date(),
): CrewLifecycleSnapshot {
  return getCrewLifecycleSnapshot(crewId, now, scenario);
}

export function assertCrewMembershipOperationAllowed(
  crewId: string,
  operation: "join" | "manage" | "leave",
  now: Date = new Date(),
): void {
  const snapshot = getCrewLifecycleSnapshot(crewId, now);
  if (operation === "leave") {
    if (!snapshot.operations.leaveAllowed) {
      fail(
        "CREW_LEAVE_UNAVAILABLE",
        "Membership has already been closed because this Crew is disbanded.",
      );
    }
    return;
  }
  if (!snapshot.operations.membershipMutationsAllowed) {
    fail(
      "CREW_MEMBERSHIP_FROZEN",
      `Membership operations are frozen while the Crew is ${snapshot.state}.`,
      409,
      snapshot.state === "suspended",
    );
  }
}
