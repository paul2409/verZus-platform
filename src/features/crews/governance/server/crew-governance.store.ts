// VERZUS M9.6 REFRESH-PERSISTENT CREW GOVERNANCE STORE

import { randomUUID } from "node:crypto";

import { getCrewFoundationMock, type CrewRole } from "../../foundation";
import { synchronizeCrewMembershipGovernance } from "../../membership/server/crew-membership.store";
import type {
  CrewGovernanceAuditEvent,
  CrewGovernanceMutationResult,
  CrewGovernanceSnapshot,
} from "../model/crew-governance.types";

export type StoredCrewGovernance = {
  snapshot: CrewGovernanceSnapshot;
  idempotencyResults: Map<string, CrewGovernanceMutationResult>;
};

type GovernanceGlobal = typeof globalThis & {
  __verzusM96CrewGovernanceStore?: Map<string, StoredCrewGovernance>;
};

const globalScope = globalThis as GovernanceGlobal;
const store = globalScope.__verzusM96CrewGovernanceStore ?? new Map<string, StoredCrewGovernance>();
globalScope.__verzusM96CrewGovernanceStore = store;

function managementFor(
  viewerRole: CrewRole,
  viewerId: string,
  memberId: string,
  memberRole: CrewRole,
) {
  if (memberRole === "owner") {
    return {
      allowedRoles: [] as const,
      canRemove: false,
      canTransferOwnership: false,
      blockReason: "The owner can only change through transactional ownership transfer.",
    };
  }
  if (viewerId === memberId) {
    return {
      allowedRoles: [] as const,
      canRemove: false,
      canTransferOwnership: false,
      blockReason: "You cannot change or remove your own membership from this panel.",
    };
  }
  if (viewerRole === "owner") {
    return {
      allowedRoles: ["captain", "manager", "member", "trial"] as const,
      canRemove: true,
      canTransferOwnership: true,
      blockReason: null,
    };
  }
  if (viewerRole === "captain" && ["member", "trial"].includes(memberRole)) {
    return {
      allowedRoles: ["member", "trial"] as const,
      canRemove: true,
      canTransferOwnership: false,
      blockReason: null,
    };
  }
  if (viewerRole === "manager" && memberRole === "trial") {
    return {
      allowedRoles: ["member", "trial"] as const,
      canRemove: true,
      canTransferOwnership: false,
      blockReason: null,
    };
  }
  return {
    allowedRoles: [] as const,
    canRemove: false,
    canTransferOwnership: false,
    blockReason: "Your role cannot manage this member.",
  };
}

function decorate(snapshot: CrewGovernanceSnapshot): CrewGovernanceSnapshot {
  const viewer = snapshot.members.find((member) => member.id === snapshot.viewer.playerId);
  const viewerRole = viewer?.role ?? snapshot.viewer.role;
  return {
    ...snapshot,
    viewer: {
      playerId: snapshot.viewer.playerId,
      role: viewerRole,
      canManageMembers: ["owner", "captain", "manager"].includes(viewerRole),
      canTransferOwnership: viewerRole === "owner",
    },
    members: snapshot.members.map((member) => ({
      ...member,
      management: managementFor(viewerRole, snapshot.viewer.playerId, member.id, member.role),
    })),
  };
}

function createRecord(crewId: string, now: Date): StoredCrewGovernance {
  const model = getCrewFoundationMock(crewId);
  const members = model.members.map((member, index) => ({
    ...member,
    joinedAt: new Date(Date.UTC(2024, 10, 18 + index)).toISOString(),
    management: {
      allowedRoles: [] as const,
      canRemove: false,
      canTransferOwnership: false,
      blockReason: null,
    },
  }));
  const owner = members.find((member) => member.role === "owner");
  if (!owner) throw new Error("Crew governance seed requires exactly one owner.");
  const snapshot = decorate({
    crewId,
    version: 1,
    serverNow: now.toISOString(),
    ownerId: owner.id,
    viewer: {
      playerId: "player-prismo",
      role: owner.id === "player-prismo" ? "owner" : "member",
      canManageMembers: true,
      canTransferOwnership: true,
    },
    members,
    auditEvents: [],
  });
  return { snapshot, idempotencyResults: new Map() };
}

export function getCrewGovernanceRecord(
  crewId: string,
  now: Date = new Date(),
): StoredCrewGovernance {
  const existing = store.get(crewId);
  if (existing) {
    existing.snapshot.serverNow = now.toISOString();
    existing.snapshot = decorate(existing.snapshot);
    return existing;
  }
  const created = createRecord(crewId, now);
  store.set(crewId, created);
  return created;
}

export function getCrewGovernanceSnapshot(
  crewId: string,
  now: Date = new Date(),
): CrewGovernanceSnapshot {
  return structuredClone(getCrewGovernanceRecord(crewId, now).snapshot);
}

export function getCrewGovernanceReplay(
  crewId: string,
  idempotencyKey: string,
  now: Date,
): CrewGovernanceMutationResult | null {
  const result = getCrewGovernanceRecord(crewId, now).idempotencyResults.get(idempotencyKey);
  return result ? { ...structuredClone(result), replayed: true } : null;
}

function assertOwnerInvariant(snapshot: CrewGovernanceSnapshot): void {
  const owners = snapshot.members.filter((member) => member.role === "owner");
  if (owners.length !== 1 || owners[0]?.id !== snapshot.ownerId) {
    throw new Error("Crew governance owner invariant violated.");
  }
}

export function persistCrewGovernanceMutation(
  crewId: string,
  idempotencyKey: string,
  input: {
    outcome: CrewGovernanceMutationResult["outcome"];
    now: Date;
    mutate: (snapshot: CrewGovernanceSnapshot) => void;
  },
): CrewGovernanceMutationResult {
  const record = getCrewGovernanceRecord(crewId, input.now);
  const next = structuredClone(record.snapshot);
  input.mutate(next);
  assertOwnerInvariant(next);
  next.version += 1;
  next.serverNow = input.now.toISOString();
  const decorated = decorate(next);
  record.snapshot = decorated;
  const eventId = randomUUID();
  const result: CrewGovernanceMutationResult = {
    outcome: input.outcome,
    snapshot: structuredClone(decorated),
    eventId,
    replayed: false,
  };
  record.idempotencyResults.set(idempotencyKey, structuredClone(result));
  synchronizeCrewMembershipGovernance(crewId, {
    memberCount: decorated.members.length,
    viewerRole: decorated.viewer.role,
    now: input.now,
  });
  return result;
}

export function appendCrewGovernanceAudit(
  snapshot: CrewGovernanceSnapshot,
  input: Omit<CrewGovernanceAuditEvent, "id">,
): string {
  const id = randomUUID();
  snapshot.auditEvents = [{ id, ...input }, ...snapshot.auditEvents].slice(0, 50);
  return id;
}

export function resetCrewGovernanceStore(): void {
  store.clear();
}
