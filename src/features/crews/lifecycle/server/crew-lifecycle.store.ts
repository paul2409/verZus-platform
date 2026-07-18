// VERZUS M9.7 REFRESH-PERSISTENT CREW LIFECYCLE STORE

import { randomUUID } from "node:crypto";

import { getCrewFoundationMock, type CrewLifecycle } from "../../foundation";
import { getCrewGovernanceSnapshot } from "../../governance/server/crew-governance.store";
import type {
  CrewLifecycleAuditEvent,
  CrewLifecycleMutationResult,
  CrewLifecycleScenario,
  CrewLifecycleSnapshot,
  CrewLifecycleTarget,
} from "../model/crew-lifecycle.types";

export type StoredCrewLifecycle = {
  snapshot: CrewLifecycleSnapshot;
  idempotencyResults: Map<string, CrewLifecycleMutationResult>;
};

type LifecycleGlobal = typeof globalThis & {
  __verzusM97CrewLifecycleStore?: Map<string, StoredCrewLifecycle>;
};

const globalScope = globalThis as LifecycleGlobal;
const store = globalScope.__verzusM97CrewLifecycleStore ?? new Map<string, StoredCrewLifecycle>();
globalScope.__verzusM97CrewLifecycleStore = store;

const transitionMap: Record<CrewLifecycle, readonly CrewLifecycleTarget[]> = {
  forming: ["active", "archived"],
  active: ["inactive", "archived"],
  inactive: ["active", "archived"],
  suspended: [],
  disbanded: [],
  archived: ["active"],
};

function operationsFor(state: CrewLifecycle) {
  switch (state) {
    case "forming":
    case "active":
      return {
        recruiting: true,
        membershipMutationsAllowed: true,
        leaveAllowed: true,
        activityMode: "live" as const,
      };
    case "inactive":
      return {
        recruiting: false,
        membershipMutationsAllowed: false,
        leaveAllowed: true,
        activityMode: "read_only" as const,
      };
    case "suspended":
      return {
        recruiting: false,
        membershipMutationsAllowed: false,
        leaveAllowed: true,
        activityMode: "read_only" as const,
      };
    case "archived":
      return {
        recruiting: false,
        membershipMutationsAllowed: false,
        leaveAllowed: true,
        activityMode: "historical" as const,
      };
    case "disbanded":
      return {
        recruiting: false,
        membershipMutationsAllowed: false,
        leaveAllowed: false,
        activityMode: "historical" as const,
      };
  }
}

function decorate(snapshot: CrewLifecycleSnapshot): CrewLifecycleSnapshot {
  const governance = getCrewGovernanceSnapshot(snapshot.crewId, new Date(snapshot.serverNow));
  const stateBlocksOwnerControls = ["suspended", "disbanded"].includes(snapshot.state);
  const activeBlockers = snapshot.blockers.filter((blocker) => blocker.active);
  const canManageLifecycle = governance.viewer.role === "owner" && !stateBlocksOwnerControls;
  const canDisband =
    governance.viewer.role === "owner" && !stateBlocksOwnerControls && activeBlockers.length === 0;
  const blockedReason =
    governance.viewer.role !== "owner"
      ? "Only the current Crew owner can change lifecycle state."
      : snapshot.state === "suspended"
        ? "Suspension is controlled by platform operations. Owner mutations are frozen."
        : snapshot.state === "disbanded"
          ? "A disbanded Crew is terminal and remains available only as historical data."
          : activeBlockers.length > 0
            ? "Resolve active matches and disputes before disbanding."
            : null;

  return {
    ...snapshot,
    viewer: {
      playerId: governance.viewer.playerId,
      role: governance.viewer.role,
      canManageLifecycle,
      canDisband,
    },
    controls: {
      allowedTransitions: canManageLifecycle ? transitionMap[snapshot.state] : [],
      disbandConfirmation: `DISBAND ${snapshot.crewName.toUpperCase()}`,
      blockedReason,
    },
    operations: operationsFor(snapshot.state),
  };
}

function createRecord(crewId: string, now: Date): StoredCrewLifecycle {
  const model = getCrewFoundationMock(crewId);
  const snapshot = decorate({
    crewId,
    crewName: model.identity.name,
    version: 1,
    serverNow: now.toISOString(),
    state: model.identity.lifecycle,
    freshness: "fresh",
    viewer: {
      playerId: "player-prismo",
      role: "owner",
      canManageLifecycle: true,
      canDisband: true,
    },
    controls: {
      allowedTransitions: transitionMap[model.identity.lifecycle],
      disbandConfirmation: `DISBAND ${model.identity.name.toUpperCase()}`,
      blockedReason: null,
    },
    operations: operationsFor(model.identity.lifecycle),
    blockers: [
      { code: "ACTIVE_MATCHES", label: "Active or scheduled matches", count: 0, active: false },
      { code: "OPEN_DISPUTES", label: "Open match disputes", count: 0, active: false },
    ],
    auditEvents: [],
  });

  return { snapshot, idempotencyResults: new Map() };
}

export function getCrewLifecycleRecord(
  crewId: string,
  now: Date = new Date(),
): StoredCrewLifecycle {
  const existing = store.get(crewId);
  if (existing) {
    existing.snapshot.serverNow = now.toISOString();
    existing.snapshot.freshness = "fresh";
    existing.snapshot = decorate(existing.snapshot);
    return existing;
  }
  const created = createRecord(crewId, now);
  store.set(crewId, created);
  return created;
}

function applyScenario(
  snapshot: CrewLifecycleSnapshot,
  scenario: CrewLifecycleScenario,
): CrewLifecycleSnapshot {
  const next = structuredClone(snapshot);
  if (scenario === "stale") next.freshness = "stale";
  if (["forming", "inactive", "suspended", "archived", "disbanded"].includes(scenario)) {
    next.state = scenario as CrewLifecycle;
  }
  if (scenario === "blocked") {
    next.blockers = [
      { code: "ACTIVE_MATCHES", label: "Active or scheduled matches", count: 2, active: true },
      { code: "OPEN_DISPUTES", label: "Open match disputes", count: 1, active: true },
    ];
  }
  return decorate(next);
}

export function getCrewLifecycleSnapshot(
  crewId: string,
  now: Date = new Date(),
  scenario: CrewLifecycleScenario = "normal",
): CrewLifecycleSnapshot {
  return applyScenario(structuredClone(getCrewLifecycleRecord(crewId, now).snapshot), scenario);
}

export function getCrewLifecycleReplay(
  crewId: string,
  idempotencyKey: string,
  now: Date,
): CrewLifecycleMutationResult | null {
  const result = getCrewLifecycleRecord(crewId, now).idempotencyResults.get(idempotencyKey);
  return result ? { ...structuredClone(result), replayed: true } : null;
}

export function appendCrewLifecycleAudit(
  snapshot: CrewLifecycleSnapshot,
  input: Omit<CrewLifecycleAuditEvent, "id">,
): string {
  const id = randomUUID();
  snapshot.auditEvents = [{ id, ...input }, ...snapshot.auditEvents].slice(0, 50);
  return id;
}

export function persistCrewLifecycleMutation(
  crewId: string,
  idempotencyKey: string,
  input: {
    outcome: CrewLifecycleMutationResult["outcome"];
    now: Date;
    mutate: (snapshot: CrewLifecycleSnapshot) => void;
  },
): CrewLifecycleMutationResult {
  const record = getCrewLifecycleRecord(crewId, input.now);
  const next = structuredClone(record.snapshot);
  input.mutate(next);
  next.version += 1;
  next.serverNow = input.now.toISOString();
  next.freshness = "fresh";
  const decorated = decorate(next);
  record.snapshot = decorated;
  const eventId = decorated.auditEvents[0]?.id ?? randomUUID();
  const result: CrewLifecycleMutationResult = {
    outcome: input.outcome,
    snapshot: structuredClone(decorated),
    eventId,
    replayed: false,
  };
  record.idempotencyResults.set(idempotencyKey, structuredClone(result));
  return result;
}

export function resetCrewLifecycleStore(): void {
  store.clear();
}
