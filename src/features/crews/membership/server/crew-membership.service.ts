// VERZUS M9.5 SERVER-AUTHORITATIVE CREW MEMBERSHIP SERVICE

import { randomUUID } from "node:crypto";

import type { CrewRole } from "../../foundation";
import type {
  CrewApplication,
  CrewInvite,
  CrewMembershipMutationResult,
  CrewMembershipSnapshot,
} from "../model/crew-membership.types";
import {
  addCrewApplication,
  addCrewInvite,
  appendCrewMembershipAudit,
  getCrewMembershipRecord,
  getCrewMembershipReplay,
  getCrewMembershipSnapshot,
  persistCrewMembershipMutation,
} from "./crew-membership.store";

export class CrewMembershipServiceError extends Error {
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
    this.name = "CrewMembershipServiceError";
    this.code = input.code;
    this.status = input.status;
    this.retryable = input.retryable;
    this.fieldErrors = input.fieldErrors;
  }
}

function assertVersion(snapshot: CrewMembershipSnapshot, expectedVersion: number): void {
  if (snapshot.version !== expectedVersion) {
    throw new CrewMembershipServiceError({
      code: "CREW_MEMBERSHIP_STALE_VERSION",
      message: "Crew membership changed. Refresh before retrying this action.",
      status: 409,
      retryable: true,
    });
  }
}

function assertManager(snapshot: CrewMembershipSnapshot): void {
  if (!snapshot.viewer.role || !["owner", "captain", "manager"].includes(snapshot.viewer.role)) {
    throw new CrewMembershipServiceError({
      code: "CREW_MEMBERSHIP_FORBIDDEN",
      message: "Owner, captain or manager permission is required.",
      status: 403,
      retryable: false,
    });
  }
}

function assertCapacity(snapshot: CrewMembershipSnapshot): void {
  if (snapshot.memberCount >= snapshot.capacity) {
    throw new CrewMembershipServiceError({
      code: "CREW_CAPACITY_FULL",
      message: "This Crew has reached its member capacity.",
      status: 409,
      retryable: false,
    });
  }
}

function replayOrSnapshot(
  crewId: string,
  idempotencyKey: string,
  now: Date,
): { replay: CrewMembershipMutationResult | null; snapshot: CrewMembershipSnapshot } {
  return {
    replay: getCrewMembershipReplay(crewId, idempotencyKey, now),
    snapshot: getCrewMembershipSnapshot(crewId, now),
  };
}

export function submitCrewApplication(
  input: {
    crewId: string;
    expectedVersion: number;
    game: string;
    message: string;
    idempotencyKey: string;
  },
  now: Date = new Date(),
): CrewMembershipMutationResult {
  const { replay, snapshot } = replayOrSnapshot(input.crewId, input.idempotencyKey, now);
  if (replay) return replay;
  assertVersion(snapshot, input.expectedVersion);

  if (snapshot.viewer.crewId === input.crewId) {
    throw new CrewMembershipServiceError({
      code: "CREW_ALREADY_MEMBER",
      message: "You are already a member of this Crew.",
      status: 409,
      retryable: false,
    });
  }

  const existing = snapshot.applications.find(
    (application) =>
      application.playerId === snapshot.viewer.playerId && application.status === "pending",
  );
  if (existing) {
    return persistCrewMembershipMutation(input.crewId, input.idempotencyKey, {
      outcome: "application_already_pending",
      now,
      mutate: () => undefined,
    });
  }

  const application: CrewApplication = {
    id: randomUUID(),
    crewId: input.crewId,
    playerId: snapshot.viewer.playerId,
    playerName: snapshot.viewer.playerName,
    handle: snapshot.viewer.handle,
    game: input.game,
    trust: 96,
    message: input.message,
    status: "pending",
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 7 * 86_400_000).toISOString(),
    decidedAt: null,
    decidedBy: null,
  };

  return persistCrewMembershipMutation(input.crewId, input.idempotencyKey, {
    outcome: "application_submitted",
    now,
    mutate: (next) => {
      addCrewApplication(next, application);
      appendCrewMembershipAudit(next, {
        crewId: input.crewId,
        actorId: next.viewer.playerId,
        action: "application_submitted",
        subjectId: application.id,
        createdAt: now.toISOString(),
      });
    },
  });
}

export function decideCrewApplication(
  input: {
    crewId: string;
    applicationId: string;
    expectedVersion: number;
    decision: "accept" | "decline";
    idempotencyKey: string;
  },
  now: Date = new Date(),
): CrewMembershipMutationResult {
  const { replay, snapshot } = replayOrSnapshot(input.crewId, input.idempotencyKey, now);
  if (replay) return replay;
  assertVersion(snapshot, input.expectedVersion);
  assertManager(snapshot);

  const application = snapshot.applications.find((item) => item.id === input.applicationId);
  if (!application) {
    throw new CrewMembershipServiceError({
      code: "CREW_APPLICATION_NOT_FOUND",
      message: "The application no longer exists.",
      status: 404,
      retryable: false,
    });
  }
  if (application.status !== "pending") {
    throw new CrewMembershipServiceError({
      code: "CREW_APPLICATION_ALREADY_DECIDED",
      message: "This application has already been decided.",
      status: 409,
      retryable: false,
    });
  }
  if (Date.parse(application.expiresAt) <= now.getTime()) {
    throw new CrewMembershipServiceError({
      code: "CREW_APPLICATION_EXPIRED",
      message: "This application has expired.",
      status: 409,
      retryable: false,
    });
  }
  if (input.decision === "accept") assertCapacity(snapshot);

  return persistCrewMembershipMutation(input.crewId, input.idempotencyKey, {
    outcome: input.decision === "accept" ? "application_accepted" : "application_declined",
    now,
    mutate: (next) => {
      const target = next.applications.find((item) => item.id === input.applicationId);
      if (!target) return;
      target.status = input.decision === "accept" ? "accepted" : "declined";
      target.decidedAt = now.toISOString();
      target.decidedBy = next.viewer.playerId;
      if (input.decision === "accept") next.memberCount += 1;
      appendCrewMembershipAudit(next, {
        crewId: input.crewId,
        actorId: next.viewer.playerId,
        action: `application_${input.decision}ed`,
        subjectId: target.playerId,
        createdAt: now.toISOString(),
      });
    },
  });
}

export function createCrewInvite(
  input: {
    crewId: string;
    expectedVersion: number;
    playerHandle: string;
    role: Exclude<CrewRole, "owner">;
    idempotencyKey: string;
  },
  now: Date = new Date(),
): CrewMembershipMutationResult {
  const { replay, snapshot } = replayOrSnapshot(input.crewId, input.idempotencyKey, now);
  if (replay) return replay;
  assertVersion(snapshot, input.expectedVersion);
  assertManager(snapshot);
  assertCapacity(snapshot);

  const existing = snapshot.invites.find(
    (invite) =>
      invite.handle.toLowerCase() === input.playerHandle.toLowerCase() &&
      invite.status === "pending",
  );
  if (existing) {
    return persistCrewMembershipMutation(input.crewId, input.idempotencyKey, {
      outcome: "invite_already_pending",
      now,
      mutate: () => undefined,
    });
  }

  const handle = input.playerHandle.toLowerCase();
  const invite: CrewInvite = {
    id: randomUUID(),
    crewId: input.crewId,
    playerId: `player-${handle.slice(1)}`,
    playerName: handle.slice(1).replace(/[-_]/g, " "),
    handle,
    role: input.role,
    status: "pending",
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 3 * 86_400_000).toISOString(),
    decidedAt: null,
    invitedBy: snapshot.viewer.playerId,
  };

  return persistCrewMembershipMutation(input.crewId, input.idempotencyKey, {
    outcome: "invite_created",
    now,
    mutate: (next) => {
      addCrewInvite(next, invite);
      appendCrewMembershipAudit(next, {
        crewId: input.crewId,
        actorId: next.viewer.playerId,
        action: "invite_created",
        subjectId: invite.playerId,
        createdAt: now.toISOString(),
      });
    },
  });
}

export function decideCrewInvite(
  input: {
    crewId: string;
    inviteId: string;
    expectedVersion: number;
    decision: "accept" | "decline";
    idempotencyKey: string;
  },
  now: Date = new Date(),
): CrewMembershipMutationResult {
  const { replay, snapshot } = replayOrSnapshot(input.crewId, input.idempotencyKey, now);
  if (replay) return replay;
  assertVersion(snapshot, input.expectedVersion);

  const invite = snapshot.invites.find((item) => item.id === input.inviteId);
  if (!invite) {
    throw new CrewMembershipServiceError({
      code: "CREW_INVITE_NOT_FOUND",
      message: "The invite no longer exists.",
      status: 404,
      retryable: false,
    });
  }
  if (invite.status !== "pending") {
    throw new CrewMembershipServiceError({
      code: "CREW_INVITE_ALREADY_DECIDED",
      message: "This invite has already been decided.",
      status: 409,
      retryable: false,
    });
  }
  if (Date.parse(invite.expiresAt) <= now.getTime()) {
    throw new CrewMembershipServiceError({
      code: "CREW_INVITE_EXPIRED",
      message: "This invite has expired.",
      status: 409,
      retryable: false,
    });
  }
  if (input.decision === "accept") assertCapacity(snapshot);

  return persistCrewMembershipMutation(input.crewId, input.idempotencyKey, {
    outcome: input.decision === "accept" ? "invite_accepted" : "invite_declined",
    now,
    mutate: (next) => {
      const target = next.invites.find((item) => item.id === input.inviteId);
      if (!target) return;
      target.status = input.decision === "accept" ? "accepted" : "declined";
      target.decidedAt = now.toISOString();
      if (input.decision === "accept") {
        next.memberCount += 1;
        if (target.playerId === next.viewer.playerId) {
          next.viewer.crewId = next.crewId;
          next.viewer.role = target.role;
          next.viewer.joinedAt = now.toISOString();
        }
      }
      appendCrewMembershipAudit(next, {
        crewId: input.crewId,
        actorId: next.viewer.playerId,
        action: `invite_${input.decision}ed`,
        subjectId: target.playerId,
        createdAt: now.toISOString(),
      });
    },
  });
}

export function leaveCrewMembership(
  input: {
    crewId: string;
    expectedVersion: number;
    idempotencyKey: string;
  },
  now: Date = new Date(),
): CrewMembershipMutationResult {
  const { replay, snapshot } = replayOrSnapshot(input.crewId, input.idempotencyKey, now);
  if (replay) return replay;
  assertVersion(snapshot, input.expectedVersion);

  if (snapshot.viewer.crewId !== input.crewId || !snapshot.viewer.role) {
    throw new CrewMembershipServiceError({
      code: "CREW_NOT_A_MEMBER",
      message: "You are not a member of this Crew.",
      status: 409,
      retryable: false,
    });
  }
  if (snapshot.viewer.role === "owner") {
    throw new CrewMembershipServiceError({
      code: "CREW_OWNER_TRANSFER_REQUIRED",
      message: "Transfer ownership before leaving this Crew.",
      status: 409,
      retryable: false,
    });
  }

  return persistCrewMembershipMutation(input.crewId, input.idempotencyKey, {
    outcome: "membership_left",
    now,
    mutate: (next) => {
      next.memberCount = Math.max(0, next.memberCount - 1);
      appendCrewMembershipAudit(next, {
        crewId: input.crewId,
        actorId: next.viewer.playerId,
        action: "membership_left",
        subjectId: next.viewer.playerId,
        createdAt: now.toISOString(),
      });
      next.viewer.crewId = null;
      next.viewer.role = null;
      next.viewer.joinedAt = null;
    },
  });
}

export function expireCrewMembershipItems(
  input: { crewId: string; expectedVersion: number; idempotencyKey: string },
  now: Date = new Date(),
): CrewMembershipMutationResult {
  const { replay, snapshot } = replayOrSnapshot(input.crewId, input.idempotencyKey, now);
  if (replay) return replay;
  assertVersion(snapshot, input.expectedVersion);
  assertManager(snapshot);

  return persistCrewMembershipMutation(input.crewId, input.idempotencyKey, {
    outcome: "pending_items_expired",
    now,
    mutate: (next) => {
      for (const application of next.applications) {
        if (
          application.status === "pending" &&
          Date.parse(application.expiresAt) <= now.getTime()
        ) {
          application.status = "expired";
        }
      }
      for (const invite of next.invites) {
        if (invite.status === "pending" && Date.parse(invite.expiresAt) <= now.getTime()) {
          invite.status = "expired";
        }
      }
      appendCrewMembershipAudit(next, {
        crewId: input.crewId,
        actorId: next.viewer.playerId,
        action: "pending_items_expired",
        subjectId: input.crewId,
        createdAt: now.toISOString(),
      });
    },
  });
}

export function getCrewMembershipForRead(crewId: string, now: Date = new Date()) {
  return getCrewMembershipRecord(crewId, now).snapshot;
}
