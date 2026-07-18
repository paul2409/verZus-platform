// VERZUS M9.5 CREW MEMBERSHIP ZOD SCHEMAS

import { z } from "zod";

const roleSchema = z.enum(["owner", "captain", "manager", "member", "trial"]);
const applicationStatusSchema = z.enum(["pending", "accepted", "declined", "withdrawn", "expired"]);
const inviteStatusSchema = z.enum(["pending", "accepted", "declined", "expired"]);

export const crewMembershipSnapshotRawSchema = z.object({
  crew_id: z.string().min(1),
  version: z.number().int().nonnegative(),
  capacity: z.number().int().positive(),
  member_count: z.number().int().nonnegative(),
  server_now: z.string().datetime(),
  viewer: z.object({
    player_id: z.string().min(1),
    player_name: z.string().min(1),
    handle: z.string().min(1),
    crew_id: z.string().nullable(),
    role: roleSchema.nullable(),
    joined_at: z.string().datetime().nullable(),
  }),
  applications: z.array(
    z.object({
      id: z.string().min(1),
      crew_id: z.string().min(1),
      player_id: z.string().min(1),
      player_name: z.string().min(1),
      handle: z.string().min(1),
      game: z.string().min(1),
      trust: z.number().min(0).max(100),
      message: z.string(),
      status: applicationStatusSchema,
      created_at: z.string().datetime(),
      expires_at: z.string().datetime(),
      decided_at: z.string().datetime().nullable(),
      decided_by: z.string().nullable(),
    }),
  ),
  invites: z.array(
    z.object({
      id: z.string().min(1),
      crew_id: z.string().min(1),
      player_id: z.string().min(1),
      player_name: z.string().min(1),
      handle: z.string().min(1),
      role: roleSchema.exclude(["owner"]),
      status: inviteStatusSchema,
      created_at: z.string().datetime(),
      expires_at: z.string().datetime(),
      decided_at: z.string().datetime().nullable(),
      invited_by: z.string().min(1),
    }),
  ),
  audit_events: z.array(
    z.object({
      id: z.string().min(1),
      crew_id: z.string().min(1),
      actor_id: z.string().min(1),
      action: z.string().min(1),
      subject_id: z.string().min(1),
      created_at: z.string().datetime(),
    }),
  ),
});

export const crewMembershipEnvelopeRawSchema = z.object({
  ok: z.literal(true),
  request_id: z.string().min(1),
  data: crewMembershipSnapshotRawSchema,
  outcome: z
    .enum([
      "application_submitted",
      "application_already_pending",
      "application_accepted",
      "application_declined",
      "invite_created",
      "invite_already_pending",
      "invite_accepted",
      "invite_declined",
      "membership_left",
      "pending_items_expired",
    ])
    .optional(),
  event_id: z.string().optional(),
  replayed: z.boolean().optional(),
});

export const crewMembershipErrorEnvelopeRawSchema = z.object({
  ok: z.literal(false),
  error: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
    request_id: z.string().min(1),
    retryable: z.boolean(),
    field_errors: z.record(z.string(), z.array(z.string())).optional(),
  }),
});

export const submitCrewApplicationRawSchema = z.object({
  expected_version: z.number().int().nonnegative(),
  game: z.string().trim().min(2).max(40),
  message: z.string().trim().max(300).default(""),
});

export const decideCrewApplicationRawSchema = z.object({
  expected_version: z.number().int().nonnegative(),
  decision: z.enum(["accept", "decline"]),
});

export const createCrewInviteRawSchema = z.object({
  expected_version: z.number().int().nonnegative(),
  player_handle: z
    .string()
    .trim()
    .regex(/^@[a-z0-9_-]{2,24}$/i),
  role: z.enum(["captain", "manager", "member", "trial"]),
});

export const decideCrewInviteRawSchema = z.object({
  expected_version: z.number().int().nonnegative(),
  decision: z.enum(["accept", "decline"]),
});

export const leaveCrewRawSchema = z.object({
  expected_version: z.number().int().nonnegative(),
  confirmation: z.literal("LEAVE CREW"),
});

export const expireCrewMembershipRawSchema = z.object({
  expected_version: z.number().int().nonnegative(),
});
