// VERZUS M9.5 CREW MEMBERSHIP TYPES

import type { CrewRole } from "../../foundation";

export const crewApplicationStatuses = [
  "pending",
  "accepted",
  "declined",
  "withdrawn",
  "expired",
] as const;
export const crewInviteStatuses = ["pending", "accepted", "declined", "expired"] as const;

export type CrewApplicationStatus = (typeof crewApplicationStatuses)[number];
export type CrewInviteStatus = (typeof crewInviteStatuses)[number];

export type CrewMembershipViewer = {
  playerId: string;
  playerName: string;
  handle: string;
  crewId: string | null;
  role: CrewRole | null;
  joinedAt: string | null;
};

export type CrewApplication = {
  id: string;
  crewId: string;
  playerId: string;
  playerName: string;
  handle: string;
  game: string;
  trust: number;
  message: string;
  status: CrewApplicationStatus;
  createdAt: string;
  expiresAt: string;
  decidedAt: string | null;
  decidedBy: string | null;
};

export type CrewInvite = {
  id: string;
  crewId: string;
  playerId: string;
  playerName: string;
  handle: string;
  role: Exclude<CrewRole, "owner">;
  status: CrewInviteStatus;
  createdAt: string;
  expiresAt: string;
  decidedAt: string | null;
  invitedBy: string;
};

export type CrewMembershipAuditEvent = {
  id: string;
  crewId: string;
  actorId: string;
  action: string;
  subjectId: string;
  createdAt: string;
};

export type CrewMembershipSnapshot = {
  crewId: string;
  version: number;
  capacity: number;
  memberCount: number;
  serverNow: string;
  viewer: CrewMembershipViewer;
  applications: readonly CrewApplication[];
  invites: readonly CrewInvite[];
  auditEvents: readonly CrewMembershipAuditEvent[];
};

export type CrewMembershipOutcome =
  | "application_submitted"
  | "application_already_pending"
  | "application_accepted"
  | "application_declined"
  | "invite_created"
  | "invite_already_pending"
  | "invite_accepted"
  | "invite_declined"
  | "membership_left"
  | "pending_items_expired";

export type CrewMembershipMutationResult = {
  outcome: CrewMembershipOutcome;
  snapshot: CrewMembershipSnapshot;
  eventId: string;
  replayed: boolean;
};

export type CrewMembershipErrorShape = {
  code: string;
  message: string;
  requestId: string;
  retryable: boolean;
  fieldErrors?: Record<string, string[]>;
};
