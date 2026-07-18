// VERZUS M9.5 REFRESH-PERSISTENT CREW MEMBERSHIP STORE

import { randomUUID } from "node:crypto";

import { getCrewFoundationMock } from "../../foundation";
import type {
  CrewApplication,
  CrewInvite,
  CrewMembershipAuditEvent,
  CrewMembershipMutationResult,
  CrewMembershipSnapshot,
} from "../model/crew-membership.types";

export type StoredCrewMembership = {
  snapshot: CrewMembershipSnapshot;
  idempotencyResults: Map<string, CrewMembershipMutationResult>;
};

type MembershipGlobal = typeof globalThis & {
  __verzusM95CrewMembershipStore?: Map<string, StoredCrewMembership>;
};

const globalScope = globalThis as MembershipGlobal;
const store = globalScope.__verzusM95CrewMembershipStore ?? new Map<string, StoredCrewMembership>();
globalScope.__verzusM95CrewMembershipStore = store;

function addDays(date: Date, days: number): string {
  return new Date(date.getTime() + days * 86_400_000).toISOString();
}

function createSeedApplications(crewId: string, now: Date): CrewApplication[] {
  const model = getCrewFoundationMock(crewId);
  return model.requests.map((request, index) => ({
    id: request.id,
    crewId,
    playerId: `seed-player-${index + 1}`,
    playerName: request.playerName,
    handle: request.handle,
    game: request.game,
    trust: request.trust,
    message: "I can contribute consistently to verified Crew matches.",
    status: "pending",
    createdAt: new Date(now.getTime() - (index + 1) * 3_600_000).toISOString(),
    expiresAt: addDays(now, 7),
    decidedAt: null,
    decidedBy: null,
  }));
}

function createRecord(crewId: string, now: Date): StoredCrewMembership {
  const model = getCrewFoundationMock(crewId);
  const viewerInCrew = crewId === "crew-xenon-esports";
  const snapshot: CrewMembershipSnapshot = {
    crewId,
    version: 1,
    capacity: 30,
    memberCount: model.identity.memberCount,
    serverNow: now.toISOString(),
    viewer: {
      playerId: "player-prismo",
      playerName: "Prismo",
      handle: "@prismo",
      crewId: viewerInCrew ? crewId : null,
      role: viewerInCrew ? "owner" : null,
      joinedAt: viewerInCrew ? "2024-11-18T12:00:00.000Z" : null,
    },
    applications: viewerInCrew ? createSeedApplications(crewId, now) : [],
    invites: [],
    auditEvents: [],
  };
  return { snapshot, idempotencyResults: new Map() };
}

export function getCrewMembershipRecord(
  crewId: string,
  now: Date = new Date(),
): StoredCrewMembership {
  const existing = store.get(crewId);
  if (existing) {
    existing.snapshot.serverNow = now.toISOString();
    return existing;
  }
  const created = createRecord(crewId, now);
  store.set(crewId, created);
  return created;
}

export function getCrewMembershipSnapshot(
  crewId: string,
  now: Date = new Date(),
): CrewMembershipSnapshot {
  return structuredClone(getCrewMembershipRecord(crewId, now).snapshot);
}

export function getCrewMembershipReplay(
  crewId: string,
  idempotencyKey: string,
  now: Date,
): CrewMembershipMutationResult | null {
  const result = getCrewMembershipRecord(crewId, now).idempotencyResults.get(idempotencyKey);
  return result ? { ...structuredClone(result), replayed: true } : null;
}

export function persistCrewMembershipMutation(
  crewId: string,
  idempotencyKey: string,
  input: {
    outcome: CrewMembershipMutationResult["outcome"];
    eventId?: string;
    mutate: (snapshot: CrewMembershipSnapshot) => void;
    now: Date;
  },
): CrewMembershipMutationResult {
  const record = getCrewMembershipRecord(crewId, input.now);
  input.mutate(record.snapshot);
  record.snapshot.version += 1;
  record.snapshot.serverNow = input.now.toISOString();
  const eventId = input.eventId ?? randomUUID();
  const result: CrewMembershipMutationResult = {
    outcome: input.outcome,
    snapshot: structuredClone(record.snapshot),
    eventId,
    replayed: false,
  };
  record.idempotencyResults.set(idempotencyKey, structuredClone(result));
  return result;
}

export function appendCrewMembershipAudit(
  snapshot: CrewMembershipSnapshot,
  input: Omit<CrewMembershipAuditEvent, "id" | "createdAt"> & { createdAt: string },
): string {
  const id = randomUUID();
  snapshot.auditEvents = [{ id, ...input }, ...snapshot.auditEvents].slice(0, 30);
  return id;
}

export function addCrewApplication(
  snapshot: CrewMembershipSnapshot,
  application: CrewApplication,
): void {
  snapshot.applications = [application, ...snapshot.applications];
}

export function addCrewInvite(snapshot: CrewMembershipSnapshot, invite: CrewInvite): void {
  snapshot.invites = [invite, ...snapshot.invites];
}

export function resetCrewMembershipStore(): void {
  store.clear();
}
