// VERZUS M9.6 CREW GOVERNANCE ZOD SCHEMAS

import { z } from "zod";

const roleSchema = z.enum(["owner", "captain", "manager", "member", "trial"]);
const assignableRoleSchema = z.enum(["captain", "manager", "member", "trial"]);

const memberSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  handle: z.string().min(1),
  initials: z.string().min(1).max(4),
  role: roleSchema,
  status: z.enum(["online", "away", "offline"]),
  contribution: z.number().int().nonnegative(),
  joined_at: z.string().datetime(),
  management: z.object({
    allowed_roles: z.array(assignableRoleSchema),
    can_remove: z.boolean(),
    can_transfer_ownership: z.boolean(),
    block_reason: z.string().nullable(),
  }),
});

export const crewGovernanceSnapshotRawSchema = z.object({
  crew_id: z.string().min(1),
  version: z.number().int().nonnegative(),
  server_now: z.string().datetime(),
  owner_id: z.string().min(1),
  viewer: z.object({
    player_id: z.string().min(1),
    role: roleSchema,
    can_manage_members: z.boolean(),
    can_transfer_ownership: z.boolean(),
  }),
  members: z.array(memberSchema).min(1),
  audit_events: z.array(
    z.object({
      id: z.string().min(1),
      crew_id: z.string().min(1),
      actor_id: z.string().min(1),
      action: z.enum(["member_role_changed", "member_removed", "ownership_transferred"]),
      subject_id: z.string().min(1),
      detail: z.string().min(1),
      created_at: z.string().datetime(),
    }),
  ),
});

export const crewGovernanceEnvelopeRawSchema = z.object({
  ok: z.literal(true),
  request_id: z.string().min(1),
  data: crewGovernanceSnapshotRawSchema,
  outcome: z.enum(["member_role_changed", "member_removed", "ownership_transferred"]).optional(),
  event_id: z.string().optional(),
  replayed: z.boolean().optional(),
});

export const crewGovernanceErrorEnvelopeRawSchema = z.object({
  ok: z.literal(false),
  error: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
    request_id: z.string().min(1),
    retryable: z.boolean(),
    field_errors: z.record(z.string(), z.array(z.string())).optional(),
  }),
});

export const changeCrewMemberRoleRawSchema = z.object({
  expected_version: z.number().int().nonnegative(),
  role: assignableRoleSchema,
  reason: z.string().trim().min(8).max(240),
});

export const removeCrewMemberRawSchema = z.object({
  expected_version: z.number().int().nonnegative(),
  reason: z.string().trim().min(8).max(240),
  confirmation: z.literal("REMOVE MEMBER"),
});

export const transferCrewOwnershipRawSchema = z.object({
  expected_version: z.number().int().nonnegative(),
  target_member_id: z.string().min(1),
  reason: z.string().trim().min(8).max(240),
  confirmation: z.literal("TRANSFER OWNERSHIP"),
});
