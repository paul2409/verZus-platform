// VERZUS M9.7 CREW LIFECYCLE ZOD SCHEMAS

import { z } from "zod";

const lifecycleSchema = z.enum([
  "forming",
  "active",
  "inactive",
  "suspended",
  "disbanded",
  "archived",
]);
const targetSchema = z.enum(["active", "inactive", "archived"]);
const roleSchema = z.enum(["owner", "captain", "manager", "member", "trial"]);

export const crewLifecycleSnapshotRawSchema = z.object({
  crew_id: z.string().min(1),
  crew_name: z.string().min(1),
  version: z.number().int().positive(),
  server_now: z.string().datetime(),
  state: lifecycleSchema,
  freshness: z.enum(["fresh", "stale"]),
  viewer: z.object({
    player_id: z.string().min(1),
    role: roleSchema,
    can_manage_lifecycle: z.boolean(),
    can_disband: z.boolean(),
  }),
  controls: z.object({
    allowed_transitions: z.array(targetSchema),
    disband_confirmation: z.string().min(1),
    blocked_reason: z.string().nullable(),
  }),
  operations: z.object({
    recruiting: z.boolean(),
    membership_mutations_allowed: z.boolean(),
    leave_allowed: z.boolean(),
    activity_mode: z.enum(["live", "read_only", "historical"]),
  }),
  blockers: z.array(
    z.object({
      code: z.enum(["ACTIVE_MATCHES", "OPEN_DISPUTES"]),
      label: z.string().min(1),
      count: z.number().int().nonnegative(),
      active: z.boolean(),
    }),
  ),
  audit_events: z.array(
    z.object({
      id: z.string().min(1),
      crew_id: z.string().min(1),
      actor_id: z.string().min(1),
      action: z.enum([
        "crew_activated",
        "crew_deactivated",
        "crew_archived",
        "crew_restored",
        "crew_disbanded",
      ]),
      previous_state: lifecycleSchema,
      next_state: lifecycleSchema,
      reason: z.string().min(1),
      created_at: z.string().datetime(),
    }),
  ),
});

export const crewLifecycleEnvelopeRawSchema = z.object({
  ok: z.literal(true),
  request_id: z.string().min(1),
  data: crewLifecycleSnapshotRawSchema,
  outcome: z.enum(["lifecycle_changed", "crew_disbanded"]).optional(),
  event_id: z.string().optional(),
  replayed: z.boolean().optional(),
});

export const crewLifecycleErrorEnvelopeRawSchema = z.object({
  ok: z.literal(false),
  error: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
    request_id: z.string().min(1),
    retryable: z.boolean(),
    field_errors: z.record(z.string(), z.array(z.string())).optional(),
  }),
});

export const transitionCrewLifecycleRawSchema = z.object({
  expected_version: z.number().int().positive(),
  target_state: targetSchema,
  reason: z.string().trim().min(8).max(240),
});

export const disbandCrewRawSchema = z.object({
  expected_version: z.number().int().positive(),
  reason: z.string().trim().min(12).max(240),
  confirmation: z.string().trim().min(1).max(120),
});
