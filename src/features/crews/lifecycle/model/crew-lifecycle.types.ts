// VERZUS M9.7 CREW LIFECYCLE TYPES

import type { CrewLifecycle, CrewRole } from "../../foundation";

export const crewLifecycleScenarios = [
  "normal",
  "stale",
  "error",
  "offline",
  "slow",
  "forming",
  "inactive",
  "suspended",
  "archived",
  "disbanded",
  "blocked",
] as const;

export type CrewLifecycleScenario = (typeof crewLifecycleScenarios)[number];
export type CrewLifecycleTarget = Extract<CrewLifecycle, "active" | "inactive" | "archived">;
export type CrewActivityMode = "live" | "read_only" | "historical";

export type CrewLifecycleAuditAction =
  "crew_activated" | "crew_deactivated" | "crew_archived" | "crew_restored" | "crew_disbanded";

export type CrewLifecycleAuditEvent = {
  id: string;
  crewId: string;
  actorId: string;
  action: CrewLifecycleAuditAction;
  previousState: CrewLifecycle;
  nextState: CrewLifecycle;
  reason: string;
  createdAt: string;
};

export type CrewLifecycleBlocker = {
  code: "ACTIVE_MATCHES" | "OPEN_DISPUTES";
  label: string;
  count: number;
  active: boolean;
};

export type CrewLifecycleSnapshot = {
  crewId: string;
  crewName: string;
  version: number;
  serverNow: string;
  state: CrewLifecycle;
  freshness: "fresh" | "stale";
  viewer: {
    playerId: string;
    role: CrewRole;
    canManageLifecycle: boolean;
    canDisband: boolean;
  };
  controls: {
    allowedTransitions: readonly CrewLifecycleTarget[];
    disbandConfirmation: string;
    blockedReason: string | null;
  };
  operations: {
    recruiting: boolean;
    membershipMutationsAllowed: boolean;
    leaveAllowed: boolean;
    activityMode: CrewActivityMode;
  };
  blockers: readonly CrewLifecycleBlocker[];
  auditEvents: readonly CrewLifecycleAuditEvent[];
};

export type CrewLifecycleOutcome = "lifecycle_changed" | "crew_disbanded";

export type CrewLifecycleMutationResult = {
  outcome: CrewLifecycleOutcome;
  snapshot: CrewLifecycleSnapshot;
  eventId: string;
  replayed: boolean;
};

export type CrewLifecycleErrorShape = {
  code: string;
  message: string;
  requestId: string;
  retryable: boolean;
  fieldErrors?: Record<string, string[]>;
};

export function parseCrewLifecycleScenario(value: unknown): CrewLifecycleScenario {
  return typeof value === "string" &&
    crewLifecycleScenarios.includes(value as CrewLifecycleScenario)
    ? (value as CrewLifecycleScenario)
    : "normal";
}
