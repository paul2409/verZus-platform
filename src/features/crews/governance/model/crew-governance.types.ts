// VERZUS M9.6 CREW GOVERNANCE TYPES

import type { CrewRole } from "../../foundation";

export const crewAssignableRoles = ["captain", "manager", "member", "trial"] as const;

export type CrewAssignableRole = (typeof crewAssignableRoles)[number];

export type CrewGovernanceMember = {
  id: string;
  name: string;
  handle: string;
  initials: string;
  role: CrewRole;
  status: "online" | "away" | "offline";
  contribution: number;
  joinedAt: string;
  management: {
    allowedRoles: readonly CrewAssignableRole[];
    canRemove: boolean;
    canTransferOwnership: boolean;
    blockReason: string | null;
  };
};

export type CrewGovernanceAuditEvent = {
  id: string;
  crewId: string;
  actorId: string;
  action: "member_role_changed" | "member_removed" | "ownership_transferred";
  subjectId: string;
  detail: string;
  createdAt: string;
};

export type CrewGovernanceSnapshot = {
  crewId: string;
  version: number;
  serverNow: string;
  ownerId: string;
  viewer: {
    playerId: string;
    role: CrewRole;
    canManageMembers: boolean;
    canTransferOwnership: boolean;
  };
  members: readonly CrewGovernanceMember[];
  auditEvents: readonly CrewGovernanceAuditEvent[];
};

export type CrewGovernanceOutcome =
  "member_role_changed" | "member_removed" | "ownership_transferred";

export type CrewGovernanceMutationResult = {
  outcome: CrewGovernanceOutcome;
  snapshot: CrewGovernanceSnapshot;
  eventId: string;
  replayed: boolean;
};

export type CrewGovernanceErrorShape = {
  code: string;
  message: string;
  requestId: string;
  retryable: boolean;
  fieldErrors?: Record<string, string[]>;
};
