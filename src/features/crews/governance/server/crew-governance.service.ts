// VERZUS M9.6 SERVER-AUTHORITATIVE CREW GOVERNANCE SERVICE

import type { CrewRole } from "../../foundation";
import type {
  CrewAssignableRole,
  CrewGovernanceMutationResult,
  CrewGovernanceSnapshot,
} from "../model/crew-governance.types";
import {
  appendCrewGovernanceAudit,
  getCrewGovernanceReplay,
  getCrewGovernanceSnapshot,
  persistCrewGovernanceMutation,
} from "./crew-governance.store";

export class CrewGovernanceServiceError extends Error {
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
    this.name = "CrewGovernanceServiceError";
    this.code = input.code;
    this.status = input.status;
    this.retryable = input.retryable;
    this.fieldErrors = input.fieldErrors;
  }
}

function fail(code: string, message: string, status = 409, retryable = false): never {
  throw new CrewGovernanceServiceError({ code, message, status, retryable });
}

function assertVersion(snapshot: CrewGovernanceSnapshot, expectedVersion: number): void {
  if (snapshot.version !== expectedVersion) {
    fail(
      "CREW_GOVERNANCE_STALE_VERSION",
      "Crew membership changed. Refresh before retrying this action.",
      409,
      true,
    );
  }
}

function getTarget(snapshot: CrewGovernanceSnapshot, memberId: string) {
  const target = snapshot.members.find((member) => member.id === memberId);
  if (!target) fail("CREW_MEMBER_NOT_FOUND", "The selected Crew member no longer exists.", 404);
  return target;
}

function replayOrSnapshot(crewId: string, idempotencyKey: string, now: Date) {
  return {
    replay: getCrewGovernanceReplay(crewId, idempotencyKey, now),
    snapshot: getCrewGovernanceSnapshot(crewId, now),
  };
}

function assertRoleAllowed(
  snapshot: CrewGovernanceSnapshot,
  memberId: string,
  role: CrewAssignableRole,
): void {
  const target = getTarget(snapshot, memberId);
  if (!target.management.allowedRoles.includes(role)) {
    fail(
      "CREW_ROLE_CHANGE_FORBIDDEN",
      target.management.blockReason ?? "Your role cannot assign that Crew role.",
      403,
    );
  }
}

export function changeCrewMemberRole(
  input: {
    crewId: string;
    memberId: string;
    expectedVersion: number;
    role: CrewAssignableRole;
    reason: string;
    idempotencyKey: string;
  },
  now: Date = new Date(),
): CrewGovernanceMutationResult {
  const { replay, snapshot } = replayOrSnapshot(input.crewId, input.idempotencyKey, now);
  if (replay) return replay;
  assertVersion(snapshot, input.expectedVersion);
  const target = getTarget(snapshot, input.memberId);
  if (target.role === input.role) {
    fail("CREW_ROLE_UNCHANGED", "The member already has that Crew role.");
  }
  assertRoleAllowed(snapshot, input.memberId, input.role);

  return persistCrewGovernanceMutation(input.crewId, input.idempotencyKey, {
    outcome: "member_role_changed",
    now,
    mutate: (next) => {
      const nextTarget = getTarget(next, input.memberId);
      const previousRole = nextTarget.role;
      nextTarget.role = input.role;
      appendCrewGovernanceAudit(next, {
        crewId: input.crewId,
        actorId: next.viewer.playerId,
        action: "member_role_changed",
        subjectId: input.memberId,
        detail: `${previousRole} -> ${input.role}: ${input.reason}`,
        createdAt: now.toISOString(),
      });
    },
  });
}

export function removeCrewMember(
  input: {
    crewId: string;
    memberId: string;
    expectedVersion: number;
    reason: string;
    idempotencyKey: string;
  },
  now: Date = new Date(),
): CrewGovernanceMutationResult {
  const { replay, snapshot } = replayOrSnapshot(input.crewId, input.idempotencyKey, now);
  if (replay) return replay;
  assertVersion(snapshot, input.expectedVersion);
  const target = getTarget(snapshot, input.memberId);
  if (!target.management.canRemove) {
    fail(
      "CREW_MEMBER_REMOVE_FORBIDDEN",
      target.management.blockReason ?? "Your role cannot remove this Crew member.",
      403,
    );
  }

  return persistCrewGovernanceMutation(input.crewId, input.idempotencyKey, {
    outcome: "member_removed",
    now,
    mutate: (next) => {
      next.members = next.members.filter((member) => member.id !== input.memberId);
      appendCrewGovernanceAudit(next, {
        crewId: input.crewId,
        actorId: next.viewer.playerId,
        action: "member_removed",
        subjectId: input.memberId,
        detail: `${target.handle}: ${input.reason}`,
        createdAt: now.toISOString(),
      });
    },
  });
}

export function transferCrewOwnership(
  input: {
    crewId: string;
    targetMemberId: string;
    expectedVersion: number;
    reason: string;
    idempotencyKey: string;
  },
  now: Date = new Date(),
): CrewGovernanceMutationResult {
  const { replay, snapshot } = replayOrSnapshot(input.crewId, input.idempotencyKey, now);
  if (replay) return replay;
  assertVersion(snapshot, input.expectedVersion);
  if (!snapshot.viewer.canTransferOwnership || snapshot.viewer.playerId !== snapshot.ownerId) {
    fail(
      "CREW_OWNERSHIP_TRANSFER_FORBIDDEN",
      "Only the current Crew owner can transfer ownership.",
      403,
    );
  }
  if (input.targetMemberId === snapshot.ownerId) {
    fail("CREW_OWNER_ALREADY_SELECTED", "Select a different Crew member as the new owner.");
  }
  const target = getTarget(snapshot, input.targetMemberId);
  if (!target.management.canTransferOwnership) {
    fail("CREW_OWNERSHIP_TARGET_FORBIDDEN", "That member cannot receive Crew ownership.", 403);
  }

  return persistCrewGovernanceMutation(input.crewId, input.idempotencyKey, {
    outcome: "ownership_transferred",
    now,
    mutate: (next) => {
      const previousOwner = getTarget(next, next.ownerId);
      const nextOwner = getTarget(next, input.targetMemberId);
      previousOwner.role = "captain";
      nextOwner.role = "owner";
      next.ownerId = nextOwner.id;
      appendCrewGovernanceAudit(next, {
        crewId: input.crewId,
        actorId: next.viewer.playerId,
        action: "ownership_transferred",
        subjectId: nextOwner.id,
        detail: `${previousOwner.handle} -> ${nextOwner.handle}: ${input.reason}`,
        createdAt: now.toISOString(),
      });
    },
  });
}

export function getCrewGovernanceForRead(crewId: string, now: Date = new Date()) {
  return getCrewGovernanceSnapshot(crewId, now);
}

export function canRoleManageRole(viewerRole: CrewRole, targetRole: CrewRole): boolean {
  if (viewerRole === "owner") return targetRole !== "owner";
  if (viewerRole === "captain") return ["member", "trial"].includes(targetRole);
  if (viewerRole === "manager") return targetRole === "trial";
  return false;
}
