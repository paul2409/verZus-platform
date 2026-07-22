import "server-only";

import { randomUUID } from "node:crypto";

import type { PoolClient, QueryResultRow } from "pg";

import { queryDatabase, withDatabaseTransaction } from "@/lib/db";

import type { CrewRole } from "../foundation";
import type {
  CrewGovernanceMutationResult,
  CrewGovernanceSnapshot,
  CrewAssignableRole,
} from "../governance/model/crew-governance.types";
import type {
  CrewLifecycleMutationResult,
  CrewLifecycleSnapshot,
  CrewLifecycleTarget,
} from "../lifecycle/model/crew-lifecycle.types";
import type {
  CrewMembershipMutationResult,
  CrewMembershipSnapshot,
} from "../membership/model/crew-membership.types";

export class CrewOperationError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status = 409,
    readonly retryable = false,
    readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "CrewOperationError";
  }
}

function fail(
  code: string,
  message: string,
  status = 409,
  retryable = false,
  fieldErrors?: Record<string, string[]>,
): never {
  throw new CrewOperationError(code, message, status, retryable, fieldErrors);
}

async function runQuery<TRow extends QueryResultRow>(
  client: PoolClient | null,
  text: string,
  values: readonly unknown[] = [],
) {
  return client
    ? client.query<TRow>(text, [...values])
    : queryDatabase<TRow>(text, values);
}

type CrewState = {
  id: string;
  name: string;
  primary_game: string;
  capacity: number;
  owner_user_id: string;
  lifecycle: "forming" | "active" | "inactive" | "suspended" | "disbanded" | "archived";
  recruiting: boolean;
  version: number;
};

async function readCrewState(
  crewId: string,
  client: PoolClient | null = null,
  lock = false,
): Promise<CrewState> {
  const result = await runQuery<CrewState>(
    client,
    `SELECT id, name, primary_game, capacity, owner_user_id, lifecycle, recruiting, version
       FROM crews
      WHERE id = $1
      ${lock ? "FOR UPDATE" : ""}`,
    [crewId],
  );
  const crew = result.rows[0];
  if (!crew) fail("CREW_NOT_FOUND", "The requested Crew could not be found.", 404);
  return crew;
}

type MemberRow = {
  user_id: string;
  role: CrewRole;
  contribution: number;
  joined_at: Date;
  display_name: string;
  handle: string;
};

async function listActiveMembers(crewId: string, client: PoolClient | null = null) {
  const result = await runQuery<MemberRow>(
    client,
    `SELECT cm.user_id,
            cm.role,
            cm.contribution,
            cm.joined_at,
            COALESCE(pp.display_name, u.gamer_tag) AS display_name,
            COALESCE(pp.handle, '@' || LOWER(u.normalized_gamer_tag)) AS handle
       FROM crew_members cm
       JOIN users u ON u.id = cm.user_id
       LEFT JOIN player_profiles pp ON pp.user_id = cm.user_id
      WHERE cm.crew_id = $1
        AND cm.left_at IS NULL
      ORDER BY CASE cm.role
        WHEN 'owner' THEN 0
        WHEN 'captain' THEN 1
        WHEN 'manager' THEN 2
        WHEN 'member' THEN 3
        ELSE 4
      END, cm.joined_at ASC`,
    [crewId],
  );
  return result.rows;
}

async function readViewerIdentity(userId: string, client: PoolClient | null = null) {
  const result = await runQuery<{
    id: string;
    display_name: string;
    handle: string;
    trust_score: string;
  }>(
    client,
    `SELECT u.id,
            COALESCE(pp.display_name, u.gamer_tag) AS display_name,
            COALESCE(pp.handle, '@' || LOWER(u.normalized_gamer_tag)) AS handle,
            COALESCE(pcs.trust_score, 0)::text AS trust_score
       FROM users u
       LEFT JOIN player_profiles pp ON pp.user_id = u.id
       LEFT JOIN player_competitive_summaries pcs ON pcs.user_id = u.id
      WHERE u.id = $1`,
    [userId],
  );
  const viewer = result.rows[0];
  if (!viewer) fail("PLAYER_NOT_FOUND", "The authenticated player could not be found.", 404);
  return viewer;
}

async function readActiveMembershipForUser(userId: string, client: PoolClient | null = null) {
  const result = await runQuery<{ crew_id: string; role: CrewRole; joined_at: Date }>(
    client,
    `SELECT crew_id, role, joined_at
       FROM crew_members
      WHERE user_id = $1
        AND left_at IS NULL
      LIMIT 1`,
    [userId],
  );
  return result.rows[0] ?? null;
}

function isManager(role: CrewRole | null): boolean {
  return role === "owner" || role === "captain" || role === "manager";
}

function assertVersion(actual: number, expected: number, code: string) {
  if (actual !== expected) {
    fail(code, "Crew state changed. Refresh before retrying this action.", 409, true);
  }
}

function assertMembershipMutationsAllowed(crew: CrewState) {
  if (!crew.recruiting || !["forming", "active"].includes(crew.lifecycle)) {
    fail(
      "CREW_MEMBERSHIP_FROZEN",
      `Membership operations are unavailable while the Crew is ${crew.lifecycle}.`,
      409,
      crew.lifecycle === "suspended",
    );
  }
}

function assertLeaveAllowed(crew: CrewState) {
  if (crew.lifecycle === "disbanded") {
    fail("CREW_LEAVE_UNAVAILABLE", "This Crew is already disbanded.");
  }
}

async function readReplay(
  client: PoolClient,
  actorUserId: string,
  idempotencyKey: string,
) {
  const result = await client.query<{ outcome: string; event_id: string }>(
    `SELECT outcome, event_id
       FROM crew_operation_commands
      WHERE actor_user_id = $1
        AND idempotency_key = $2`,
    [actorUserId, idempotencyKey],
  );
  return result.rows[0] ?? null;
}

async function recordCrewEvent(
  client: PoolClient,
  input: {
    crew: CrewState;
    actorUserId: string;
    eventType: string;
    title: string;
    subjectId: string;
    metadata?: Record<string, unknown>;
  },
) {
  const eventId = randomUUID();
  await client.query(
    `INSERT INTO crew_events (
       id, crew_id, actor_user_id, event_type, title, game, tone, metadata
     ) VALUES ($1, $2, $3, $4, $5, $6, 'neutral', $7::jsonb)`,
    [
      eventId,
      input.crew.id,
      input.actorUserId,
      input.eventType,
      input.title,
      input.crew.primary_game,
      JSON.stringify({ subject_id: input.subjectId, ...(input.metadata ?? {}) }),
    ],
  );
  return eventId;
}

async function recordCommand(
  client: PoolClient,
  input: {
    actorUserId: string;
    idempotencyKey: string;
    crewId: string;
    operation: string;
    outcome: string;
    eventId: string;
  },
) {
  await client.query(
    `INSERT INTO crew_operation_commands (
       actor_user_id, idempotency_key, crew_id, operation, outcome, event_id
     ) VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      input.actorUserId,
      input.idempotencyKey,
      input.crewId,
      input.operation,
      input.outcome,
      input.eventId,
    ],
  );
}

async function bumpCrewVersion(client: PoolClient, crewId: string) {
  await client.query(
    `UPDATE crews
        SET version = version + 1,
            updated_at = now()
      WHERE id = $1`,
    [crewId],
  );
}

async function countActiveMembers(crewId: string, client: PoolClient | null = null) {
  const result = await runQuery<{ count: number }>(
    client,
    `SELECT COUNT(*)::int AS count
       FROM crew_members
      WHERE crew_id = $1
        AND left_at IS NULL`,
    [crewId],
  );
  return result.rows[0]?.count ?? 0;
}

async function readCrewAuditEvents(crewId: string, client: PoolClient | null = null) {
  const result = await runQuery<{
    id: string;
    actor_user_id: string | null;
    event_type: string;
    metadata: Record<string, unknown>;
    created_at: Date;
  }>(
    client,
    `SELECT id, actor_user_id, event_type, metadata, created_at
       FROM crew_events
      WHERE crew_id = $1
        AND event_type IN (
          'application_submitted', 'application_accepted', 'application_declined',
          'invite_created', 'invite_accepted', 'invite_declined',
          'membership_left', 'pending_items_expired',
          'member_role_changed', 'member_removed', 'ownership_transferred',
          'crew_activated', 'crew_deactivated', 'crew_archived',
          'crew_restored', 'crew_disbanded'
        )
      ORDER BY created_at DESC
      LIMIT 30`,
    [crewId],
  );
  return result.rows;
}

export async function getCrewMembershipForRead(
  crewId: string,
  viewerUserId: string,
): Promise<CrewMembershipSnapshot> {
  const [crew, viewer, viewerMembership, members, auditRows] = await Promise.all([
    readCrewState(crewId),
    readViewerIdentity(viewerUserId),
    readActiveMembershipForUser(viewerUserId),
    listActiveMembers(crewId),
    readCrewAuditEvents(crewId),
  ]);
  const targetRole = members.find((member) => member.user_id === viewerUserId)?.role ?? null;
  const manager = isManager(targetRole);

  const [applicationsResult, invitesResult] = await Promise.all([
    queryDatabase<{
      id: string;
      crew_id: string;
      user_id: string;
      game: string;
      message: string;
      status: "pending" | "accepted" | "declined" | "withdrawn" | "expired";
      expires_at: Date;
      decided_at: Date | null;
      decided_by: string | null;
      created_at: Date;
      display_name: string;
      handle: string;
      trust_score: string;
    }>(
      `SELECT ca.*,
              COALESCE(pp.display_name, u.gamer_tag) AS display_name,
              COALESCE(pp.handle, '@' || LOWER(u.normalized_gamer_tag)) AS handle,
              COALESCE(pcs.trust_score, 0)::text AS trust_score
         FROM crew_applications ca
         JOIN users u ON u.id = ca.user_id
         LEFT JOIN player_profiles pp ON pp.user_id = ca.user_id
         LEFT JOIN player_competitive_summaries pcs ON pcs.user_id = ca.user_id
        WHERE ca.crew_id = $1
          AND ($2::boolean OR ca.user_id = $3)
        ORDER BY ca.created_at DESC`,
      [crewId, manager, viewerUserId],
    ),
    queryDatabase<{
      id: string;
      crew_id: string;
      user_id: string;
      role: Exclude<CrewRole, "owner">;
      status: "pending" | "accepted" | "declined" | "expired";
      expires_at: Date;
      decided_at: Date | null;
      invited_by: string;
      created_at: Date;
      display_name: string;
      handle: string;
    }>(
      `SELECT ci.*,
              COALESCE(pp.display_name, u.gamer_tag) AS display_name,
              COALESCE(pp.handle, '@' || LOWER(u.normalized_gamer_tag)) AS handle
         FROM crew_invites ci
         JOIN users u ON u.id = ci.user_id
         LEFT JOIN player_profiles pp ON pp.user_id = ci.user_id
        WHERE ci.crew_id = $1
          AND ($2::boolean OR ci.user_id = $3)
        ORDER BY ci.created_at DESC`,
      [crewId, manager, viewerUserId],
    ),
  ]);

  return {
    crewId,
    version: crew.version,
    capacity: crew.capacity,
    memberCount: members.length,
    serverNow: new Date().toISOString(),
    viewer: {
      playerId: viewer.id,
      playerName: viewer.display_name,
      handle: viewer.handle,
      crewId: viewerMembership?.crew_id ?? null,
      role: targetRole,
      joinedAt:
        viewerMembership?.crew_id === crewId ? viewerMembership.joined_at.toISOString() : null,
    },
    applications: applicationsResult.rows.map((row) => ({
      id: row.id,
      crewId: row.crew_id,
      playerId: row.user_id,
      playerName: row.display_name,
      handle: row.handle,
      game: row.game,
      trust: Math.round(Number(row.trust_score)),
      message: row.message,
      status: row.status,
      createdAt: row.created_at.toISOString(),
      expiresAt: row.expires_at.toISOString(),
      decidedAt: row.decided_at?.toISOString() ?? null,
      decidedBy: row.decided_by,
    })),
    invites: invitesResult.rows.map((row) => ({
      id: row.id,
      crewId: row.crew_id,
      playerId: row.user_id,
      playerName: row.display_name,
      handle: row.handle,
      role: row.role,
      status: row.status,
      createdAt: row.created_at.toISOString(),
      expiresAt: row.expires_at.toISOString(),
      decidedAt: row.decided_at?.toISOString() ?? null,
      invitedBy: row.invited_by,
    })),
    auditEvents: auditRows
      .filter((row) => row.actor_user_id)
      .map((row) => ({
        id: row.id,
        crewId,
        actorId: row.actor_user_id as string,
        action: row.event_type,
        subjectId: String(row.metadata.subject_id ?? crewId),
        createdAt: row.created_at.toISOString(),
      })),
  };
}

async function withMembershipCommand(input: {
  crewId: string;
  actorUserId: string;
  expectedVersion: number;
  idempotencyKey: string;
  operation: string;
  mutate: (client: PoolClient, crew: CrewState) => Promise<{
    outcome: CrewMembershipMutationResult["outcome"];
    eventType: string;
    title: string;
    subjectId: string;
    metadata?: Record<string, unknown>;
    changed?: boolean;
  }>;
}): Promise<CrewMembershipMutationResult> {
  const command = await withDatabaseTransaction(async (client) => {
    const replay = await readReplay(client, input.actorUserId, input.idempotencyKey);
    if (replay) return { replayed: true, outcome: replay.outcome, eventId: replay.event_id };
    const crew = await readCrewState(input.crewId, client, true);
    assertVersion(crew.version, input.expectedVersion, "CREW_MEMBERSHIP_STALE_VERSION");
    const result = await input.mutate(client, crew);
    if (result.changed !== false) await bumpCrewVersion(client, crew.id);
    const eventId = await recordCrewEvent(client, {
      crew,
      actorUserId: input.actorUserId,
      eventType: result.eventType,
      title: result.title,
      subjectId: result.subjectId,
      metadata: result.metadata,
    });
    await recordCommand(client, {
      actorUserId: input.actorUserId,
      idempotencyKey: input.idempotencyKey,
      crewId: crew.id,
      operation: input.operation,
      outcome: result.outcome,
      eventId,
    });
    return { replayed: false, outcome: result.outcome, eventId };
  });
  return {
    outcome: command.outcome as CrewMembershipMutationResult["outcome"],
    eventId: command.eventId,
    replayed: command.replayed,
    snapshot: await getCrewMembershipForRead(input.crewId, input.actorUserId),
  };
}

export async function submitCrewApplication(input: {
  crewId: string;
  actorUserId: string;
  expectedVersion: number;
  game: string;
  message: string;
  idempotencyKey: string;
}) {
  return withMembershipCommand({
    ...input,
    operation: "submit_application",
    mutate: async (client, crew) => {
      assertMembershipMutationsAllowed(crew);
      const membership = await readActiveMembershipForUser(input.actorUserId, client);
      if (membership) fail("CREW_ALREADY_MEMBER", "You already belong to a Crew.");
      const existing = await client.query<{ id: string }>(
        `SELECT id FROM crew_applications
          WHERE crew_id = $1 AND user_id = $2 AND status = 'pending'`,
        [crew.id, input.actorUserId],
      );
      if (existing.rows[0]) {
        return {
          outcome: "application_already_pending" as const,
          eventType: "application_submitted",
          title: "Crew application already pending",
          subjectId: existing.rows[0].id,
          changed: false,
        };
      }
      const applicationId = randomUUID();
      await client.query(
        `INSERT INTO crew_applications
          (id, crew_id, user_id, game, message, expires_at)
         VALUES ($1, $2, $3, $4, $5, now() + interval '7 days')`,
        [applicationId, crew.id, input.actorUserId, input.game, input.message],
      );
      return {
        outcome: "application_submitted" as const,
        eventType: "application_submitted",
        title: "Crew application submitted",
        subjectId: applicationId,
      };
    },
  });
}

export async function decideCrewApplication(input: {
  crewId: string;
  actorUserId: string;
  applicationId: string;
  expectedVersion: number;
  decision: "accept" | "decline";
  idempotencyKey: string;
}) {
  return withMembershipCommand({
    ...input,
    operation: "decide_application",
    mutate: async (client, crew) => {
      assertMembershipMutationsAllowed(crew);
      const actorMembership = await readActiveMembershipForUser(input.actorUserId, client);
      if (actorMembership?.crew_id !== crew.id || !isManager(actorMembership.role)) {
        fail("CREW_MEMBERSHIP_FORBIDDEN", "Owner, captain or manager permission is required.", 403);
      }
      const applicationResult = await client.query<{
        user_id: string;
        status: string;
        expires_at: Date;
      }>(
        `SELECT user_id, status, expires_at
           FROM crew_applications
          WHERE id = $1 AND crew_id = $2
          FOR UPDATE`,
        [input.applicationId, crew.id],
      );
      const application = applicationResult.rows[0];
      if (!application) fail("CREW_APPLICATION_NOT_FOUND", "The application no longer exists.", 404);
      if (application.status !== "pending") fail("CREW_APPLICATION_ALREADY_DECIDED", "This application has already been decided.");
      if (application.expires_at.getTime() <= Date.now()) fail("CREW_APPLICATION_EXPIRED", "This application has expired.");
      if (input.decision === "accept") {
        const currentCount = await countActiveMembers(crew.id, client);
        if (currentCount >= crew.capacity) fail("CREW_CAPACITY_FULL", "This Crew has reached its member capacity.");
        const otherMembership = await readActiveMembershipForUser(application.user_id, client);
        if (otherMembership) fail("PLAYER_ALREADY_IN_CREW", "That player already belongs to a Crew.");
        await client.query(
          `INSERT INTO crew_members (crew_id, user_id, role)
           VALUES ($1, $2, 'trial')`,
          [crew.id, application.user_id],
        );
      }
      await client.query(
        `UPDATE crew_applications
            SET status = $1,
                decided_at = now(),
                decided_by = $2
          WHERE id = $3`,
        [input.decision === "accept" ? "accepted" : "declined", input.actorUserId, input.applicationId],
      );
      return {
        outcome: input.decision === "accept" ? "application_accepted" as const : "application_declined" as const,
        eventType: input.decision === "accept" ? "application_accepted" : "application_declined",
        title: input.decision === "accept" ? "Crew application accepted" : "Crew application declined",
        subjectId: application.user_id,
      };
    },
  });
}

export async function createCrewInvite(input: {
  crewId: string;
  actorUserId: string;
  expectedVersion: number;
  playerHandle: string;
  role: Exclude<CrewRole, "owner">;
  idempotencyKey: string;
}) {
  return withMembershipCommand({
    ...input,
    operation: "create_invite",
    mutate: async (client, crew) => {
      assertMembershipMutationsAllowed(crew);
      const actorMembership = await readActiveMembershipForUser(input.actorUserId, client);
      if (actorMembership?.crew_id !== crew.id || !isManager(actorMembership.role)) {
        fail("CREW_MEMBERSHIP_FORBIDDEN", "Owner, captain or manager permission is required.", 403);
      }
      if ((await countActiveMembers(crew.id, client)) >= crew.capacity) {
        fail("CREW_CAPACITY_FULL", "This Crew has reached its member capacity.");
      }
      const targetResult = await client.query<{ user_id: string }>(
        `SELECT user_id FROM player_profiles WHERE LOWER(handle) = LOWER($1)`,
        [input.playerHandle],
      );
      const target = targetResult.rows[0];
      if (!target) fail("CREW_INVITE_PLAYER_NOT_FOUND", "No player uses that handle.", 404);
      if (await readActiveMembershipForUser(target.user_id, client)) {
        fail("PLAYER_ALREADY_IN_CREW", "That player already belongs to a Crew.");
      }
      const existing = await client.query<{ id: string }>(
        `SELECT id FROM crew_invites
          WHERE crew_id = $1 AND user_id = $2 AND status = 'pending'`,
        [crew.id, target.user_id],
      );
      if (existing.rows[0]) {
        return {
          outcome: "invite_already_pending" as const,
          eventType: "invite_created",
          title: "Crew invite already pending",
          subjectId: target.user_id,
          changed: false,
        };
      }
      const inviteId = randomUUID();
      await client.query(
        `INSERT INTO crew_invites
          (id, crew_id, user_id, role, expires_at, invited_by)
         VALUES ($1, $2, $3, $4, now() + interval '3 days', $5)`,
        [inviteId, crew.id, target.user_id, input.role, input.actorUserId],
      );
      return {
        outcome: "invite_created" as const,
        eventType: "invite_created",
        title: "Crew invite created",
        subjectId: target.user_id,
      };
    },
  });
}

export async function decideCrewInvite(input: {
  crewId: string;
  actorUserId: string;
  inviteId: string;
  expectedVersion: number;
  decision: "accept" | "decline";
  idempotencyKey: string;
}) {
  return withMembershipCommand({
    ...input,
    operation: "decide_invite",
    mutate: async (client, crew) => {
      const inviteResult = await client.query<{
        user_id: string;
        role: Exclude<CrewRole, "owner">;
        status: string;
        expires_at: Date;
      }>(
        `SELECT user_id, role, status, expires_at
           FROM crew_invites
          WHERE id = $1 AND crew_id = $2
          FOR UPDATE`,
        [input.inviteId, crew.id],
      );
      const invite = inviteResult.rows[0];
      if (!invite) fail("CREW_INVITE_NOT_FOUND", "The invite no longer exists.", 404);
      if (invite.user_id !== input.actorUserId) fail("CREW_INVITE_FORBIDDEN", "Only the invited player can decide this invite.", 403);
      if (invite.status !== "pending") fail("CREW_INVITE_ALREADY_DECIDED", "This invite has already been decided.");
      if (invite.expires_at.getTime() <= Date.now()) fail("CREW_INVITE_EXPIRED", "This invite has expired.");
      if (input.decision === "accept") {
        assertMembershipMutationsAllowed(crew);
        if (await readActiveMembershipForUser(input.actorUserId, client)) {
          fail("CREW_ALREADY_MEMBER", "You already belong to a Crew.");
        }
        if ((await countActiveMembers(crew.id, client)) >= crew.capacity) {
          fail("CREW_CAPACITY_FULL", "This Crew has reached its member capacity.");
        }
        await client.query(
          `INSERT INTO crew_members (crew_id, user_id, role)
           VALUES ($1, $2, $3)`,
          [crew.id, input.actorUserId, invite.role],
        );
      }
      await client.query(
        `UPDATE crew_invites
            SET status = $1,
                decided_at = now()
          WHERE id = $2`,
        [input.decision === "accept" ? "accepted" : "declined", input.inviteId],
      );
      return {
        outcome: input.decision === "accept" ? "invite_accepted" as const : "invite_declined" as const,
        eventType: input.decision === "accept" ? "invite_accepted" : "invite_declined",
        title: input.decision === "accept" ? "Crew invite accepted" : "Crew invite declined",
        subjectId: input.actorUserId,
      };
    },
  });
}

export async function leaveCrewMembership(input: {
  crewId: string;
  actorUserId: string;
  expectedVersion: number;
  idempotencyKey: string;
}) {
  return withMembershipCommand({
    ...input,
    operation: "leave_membership",
    mutate: async (client, crew) => {
      assertLeaveAllowed(crew);
      const membership = await readActiveMembershipForUser(input.actorUserId, client);
      if (membership?.crew_id !== crew.id) fail("CREW_NOT_A_MEMBER", "You are not a member of this Crew.");
      if (membership.role === "owner") fail("CREW_OWNER_TRANSFER_REQUIRED", "Transfer ownership before leaving this Crew.");
      await client.query(
        `UPDATE crew_members SET left_at = now()
          WHERE crew_id = $1 AND user_id = $2 AND left_at IS NULL`,
        [crew.id, input.actorUserId],
      );
      return {
        outcome: "membership_left" as const,
        eventType: "membership_left",
        title: "Crew member left",
        subjectId: input.actorUserId,
      };
    },
  });
}

export async function expireCrewMembershipItems(input: {
  crewId: string;
  actorUserId: string;
  expectedVersion: number;
  idempotencyKey: string;
}) {
  return withMembershipCommand({
    ...input,
    operation: "expire_membership_items",
    mutate: async (client, crew) => {
      const membership = await readActiveMembershipForUser(input.actorUserId, client);
      if (membership?.crew_id !== crew.id || !isManager(membership.role)) {
        fail("CREW_MEMBERSHIP_FORBIDDEN", "Owner, captain or manager permission is required.", 403);
      }
      await client.query(
        `UPDATE crew_applications SET status = 'expired'
          WHERE crew_id = $1 AND status = 'pending' AND expires_at <= now()`,
        [crew.id],
      );
      await client.query(
        `UPDATE crew_invites SET status = 'expired'
          WHERE crew_id = $1 AND status = 'pending' AND expires_at <= now()`,
        [crew.id],
      );
      return {
        outcome: "pending_items_expired" as const,
        eventType: "pending_items_expired",
        title: "Expired Crew membership requests",
        subjectId: crew.id,
      };
    },
  });
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "P";
}

function canManageTarget(viewerRole: CrewRole, targetRole: CrewRole) {
  if (viewerRole === "owner") return targetRole !== "owner";
  if (viewerRole === "captain") return targetRole === "member" || targetRole === "trial";
  if (viewerRole === "manager") return targetRole === "trial";
  return false;
}

function allowedRoles(viewerRole: CrewRole, targetRole: CrewRole): CrewAssignableRole[] {
  if (!canManageTarget(viewerRole, targetRole)) return [];
  if (viewerRole === "owner") return ["captain", "manager", "member", "trial"];
  if (viewerRole === "captain") return ["member", "trial"];
  if (viewerRole === "manager") return ["trial"];
  return [];
}

export async function getCrewGovernanceForRead(
  crewId: string,
  viewerUserId: string,
): Promise<CrewGovernanceSnapshot> {
  const [crew, members, auditRows] = await Promise.all([
    readCrewState(crewId),
    listActiveMembers(crewId),
    readCrewAuditEvents(crewId),
  ]);
  const viewer = members.find((member) => member.user_id === viewerUserId);
  if (!viewer) fail("CREW_GOVERNANCE_FORBIDDEN", "Crew membership is required.", 403);
  return {
    crewId,
    version: crew.version,
    serverNow: new Date().toISOString(),
    ownerId: crew.owner_user_id,
    viewer: {
      playerId: viewer.user_id,
      role: viewer.role,
      canManageMembers: isManager(viewer.role),
      canTransferOwnership: viewer.role === "owner",
    },
    members: members.map((member) => {
      const roles = allowedRoles(viewer.role, member.role).filter((role) => role !== member.role);
      const canRemove = canManageTarget(viewer.role, member.role) && member.user_id !== viewer.user_id;
      const canTransfer = viewer.role === "owner" && member.role !== "owner";
      return {
        id: member.user_id,
        name: member.display_name,
        handle: member.handle,
        initials: initials(member.display_name),
        role: member.role,
        status: "offline" as const,
        contribution: member.contribution,
        joinedAt: member.joined_at.toISOString(),
        management: {
          allowedRoles: roles,
          canRemove,
          canTransferOwnership: canTransfer,
          blockReason: roles.length > 0 || canRemove || canTransfer ? null : "Your role cannot manage this member.",
        },
      };
    }),
    auditEvents: auditRows
      .filter((row) => row.actor_user_id && ["member_role_changed", "member_removed", "ownership_transferred"].includes(row.event_type))
      .map((row) => ({
        id: row.id,
        crewId,
        actorId: row.actor_user_id as string,
        action: row.event_type as "member_role_changed" | "member_removed" | "ownership_transferred",
        subjectId: String(row.metadata.subject_id ?? crewId),
        detail: String(row.metadata.detail ?? row.event_type),
        createdAt: row.created_at.toISOString(),
      })),
  };
}

async function withGovernanceCommand(input: {
  crewId: string;
  actorUserId: string;
  expectedVersion: number;
  idempotencyKey: string;
  operation: string;
  mutate: (client: PoolClient, crew: CrewState, actor: MemberRow, members: MemberRow[]) => Promise<{
    outcome: CrewGovernanceMutationResult["outcome"];
    eventType: "member_role_changed" | "member_removed" | "ownership_transferred";
    title: string;
    subjectId: string;
    detail: string;
  }>;
}): Promise<CrewGovernanceMutationResult> {
  const command = await withDatabaseTransaction(async (client) => {
    const replay = await readReplay(client, input.actorUserId, input.idempotencyKey);
    if (replay) return { replayed: true, outcome: replay.outcome, eventId: replay.event_id };
    const crew = await readCrewState(input.crewId, client, true);
    assertVersion(crew.version, input.expectedVersion, "CREW_GOVERNANCE_STALE_VERSION");
    const members = await listActiveMembers(crew.id, client);
    const actor = members.find((member) => member.user_id === input.actorUserId);
    if (!actor) fail("CREW_GOVERNANCE_FORBIDDEN", "Crew membership is required.", 403);
    const result = await input.mutate(client, crew, actor, members);
    await bumpCrewVersion(client, crew.id);
    const eventId = await recordCrewEvent(client, {
      crew,
      actorUserId: input.actorUserId,
      eventType: result.eventType,
      title: result.title,
      subjectId: result.subjectId,
      metadata: { detail: result.detail },
    });
    await recordCommand(client, {
      actorUserId: input.actorUserId,
      idempotencyKey: input.idempotencyKey,
      crewId: crew.id,
      operation: input.operation,
      outcome: result.outcome,
      eventId,
    });
    return { replayed: false, outcome: result.outcome, eventId };
  });
  return {
    outcome: command.outcome as CrewGovernanceMutationResult["outcome"],
    eventId: command.eventId,
    replayed: command.replayed,
    snapshot: await getCrewGovernanceForRead(input.crewId, input.actorUserId),
  };
}

export async function changeCrewMemberRole(input: {
  crewId: string;
  actorUserId: string;
  memberId: string;
  expectedVersion: number;
  role: CrewAssignableRole;
  reason: string;
  idempotencyKey: string;
}) {
  return withGovernanceCommand({
    ...input,
    operation: "change_member_role",
    mutate: async (client, crew, actor, members) => {
      const target = members.find((member) => member.user_id === input.memberId);
      if (!target) fail("CREW_MEMBER_NOT_FOUND", "The selected Crew member no longer exists.", 404);
      if (!canManageTarget(actor.role, target.role)) fail("CREW_ROLE_CHANGE_FORBIDDEN", "Your role cannot manage this member.", 403);
      if (!allowedRoles(actor.role, target.role).includes(input.role)) fail("CREW_ROLE_CHANGE_FORBIDDEN", "Your role cannot assign that Crew role.", 403);
      if (target.role === input.role) fail("CREW_ROLE_UNCHANGED", "The member already has that Crew role.");
      await client.query(
        `UPDATE crew_members SET role = $1
          WHERE crew_id = $2 AND user_id = $3 AND left_at IS NULL`,
        [input.role, crew.id, target.user_id],
      );
      return {
        outcome: "member_role_changed" as const,
        eventType: "member_role_changed" as const,
        title: "Crew member role changed",
        subjectId: target.user_id,
        detail: `${target.role} -> ${input.role}: ${input.reason}`,
      };
    },
  });
}

export async function removeCrewMember(input: {
  crewId: string;
  actorUserId: string;
  memberId: string;
  expectedVersion: number;
  reason: string;
  idempotencyKey: string;
}) {
  return withGovernanceCommand({
    ...input,
    operation: "remove_member",
    mutate: async (client, crew, actor, members) => {
      const target = members.find((member) => member.user_id === input.memberId);
      if (!target) fail("CREW_MEMBER_NOT_FOUND", "The selected Crew member no longer exists.", 404);
      if (!canManageTarget(actor.role, target.role) || target.user_id === actor.user_id) {
        fail("CREW_MEMBER_REMOVE_FORBIDDEN", "Your role cannot remove this Crew member.", 403);
      }
      await client.query(
        `UPDATE crew_members SET left_at = now()
          WHERE crew_id = $1 AND user_id = $2 AND left_at IS NULL`,
        [crew.id, target.user_id],
      );
      return {
        outcome: "member_removed" as const,
        eventType: "member_removed" as const,
        title: "Crew member removed",
        subjectId: target.user_id,
        detail: `${target.handle}: ${input.reason}`,
      };
    },
  });
}

export async function transferCrewOwnership(input: {
  crewId: string;
  actorUserId: string;
  targetMemberId: string;
  expectedVersion: number;
  reason: string;
  idempotencyKey: string;
}) {
  return withGovernanceCommand({
    ...input,
    operation: "transfer_ownership",
    mutate: async (client, crew, actor, members) => {
      if (actor.role !== "owner" || actor.user_id !== crew.owner_user_id) {
        fail("CREW_OWNERSHIP_TRANSFER_FORBIDDEN", "Only the current Crew owner can transfer ownership.", 403);
      }
      const target = members.find((member) => member.user_id === input.targetMemberId);
      if (!target || target.role === "owner") fail("CREW_OWNERSHIP_TARGET_FORBIDDEN", "Select an active non-owner member.", 403);
      await client.query(
        `UPDATE crew_members
            SET role = CASE WHEN user_id = $2 THEN 'captain' ELSE 'owner' END
          WHERE crew_id = $1 AND user_id IN ($2, $3) AND left_at IS NULL`,
        [crew.id, actor.user_id, target.user_id],
      );
      await client.query(`UPDATE crews SET owner_user_id = $1 WHERE id = $2`, [target.user_id, crew.id]);
      return {
        outcome: "ownership_transferred" as const,
        eventType: "ownership_transferred" as const,
        title: "Crew ownership transferred",
        subjectId: target.user_id,
        detail: `${actor.handle} -> ${target.handle}: ${input.reason}`,
      };
    },
  });
}

function lifecycleAllowedTransitions(state: CrewState["lifecycle"]): CrewLifecycleTarget[] {
  if (state === "forming") return ["active", "archived"];
  if (state === "active") return ["inactive", "archived"];
  if (state === "inactive") return ["active", "archived"];
  if (state === "archived") return ["active"];
  return [];
}

export async function getCrewLifecycleForRead(
  crewId: string,
  viewerUserId: string,
): Promise<CrewLifecycleSnapshot> {
  const [crew, members, auditRows] = await Promise.all([
    readCrewState(crewId),
    listActiveMembers(crewId),
    readCrewAuditEvents(crewId),
  ]);
  let viewer = members.find((member) => member.user_id === viewerUserId);
  if (!viewer && crew.lifecycle === "disbanded") {
    const historical = await queryDatabase<MemberRow>(
      `SELECT cm.user_id,
              cm.role,
              cm.contribution,
              cm.joined_at,
              COALESCE(pp.display_name, u.gamer_tag) AS display_name,
              COALESCE(pp.handle, '@' || LOWER(u.normalized_gamer_tag)) AS handle
         FROM crew_members cm
         JOIN users u ON u.id = cm.user_id
         LEFT JOIN player_profiles pp ON pp.user_id = cm.user_id
        WHERE cm.crew_id = $1 AND cm.user_id = $2
        ORDER BY cm.joined_at DESC
        LIMIT 1`,
      [crewId, viewerUserId],
    );
    viewer = historical.rows[0];
  }
  if (!viewer) fail("CREW_LIFECYCLE_FORBIDDEN", "Crew membership is required.", 403);
  const owner = viewer.role === "owner" && viewer.user_id === crew.owner_user_id;
  return {
    crewId,
    crewName: crew.name,
    version: crew.version,
    serverNow: new Date().toISOString(),
    state: crew.lifecycle,
    freshness: "fresh",
    viewer: {
      playerId: viewer.user_id,
      role: viewer.role,
      canManageLifecycle: owner,
      canDisband: owner && crew.lifecycle !== "disbanded",
    },
    controls: {
      allowedTransitions: owner ? lifecycleAllowedTransitions(crew.lifecycle) : [],
      disbandConfirmation: `DISBAND ${crew.name.toUpperCase()}`,
      blockedReason: owner ? null : "Only the Crew owner can manage lifecycle state.",
    },
    operations: {
      recruiting: crew.recruiting,
      membershipMutationsAllowed: crew.recruiting && ["forming", "active"].includes(crew.lifecycle),
      leaveAllowed: crew.lifecycle !== "disbanded",
      activityMode: crew.lifecycle === "archived" || crew.lifecycle === "disbanded" ? "historical" : crew.lifecycle === "suspended" ? "read_only" : "live",
    },
    blockers: [
      { code: "ACTIVE_MATCHES", label: "Active Crew matches", count: 0, active: false },
      { code: "OPEN_DISPUTES", label: "Open Crew disputes", count: 0, active: false },
    ],
    auditEvents: auditRows
      .filter((row) => row.actor_user_id && ["crew_activated", "crew_deactivated", "crew_archived", "crew_restored", "crew_disbanded"].includes(row.event_type))
      .map((row) => ({
        id: row.id,
        crewId,
        actorId: row.actor_user_id as string,
        action: row.event_type as "crew_activated" | "crew_deactivated" | "crew_archived" | "crew_restored" | "crew_disbanded",
        previousState: String(row.metadata.previous_state) as CrewState["lifecycle"],
        nextState: String(row.metadata.next_state) as CrewState["lifecycle"],
        reason: String(row.metadata.reason ?? "No reason recorded"),
        createdAt: row.created_at.toISOString(),
      })),
  };
}

async function withLifecycleCommand(input: {
  crewId: string;
  actorUserId: string;
  expectedVersion: number;
  idempotencyKey: string;
  operation: string;
  mutate: (client: PoolClient, crew: CrewState, actor: MemberRow) => Promise<{
    outcome: CrewLifecycleMutationResult["outcome"];
    eventType: "crew_activated" | "crew_deactivated" | "crew_archived" | "crew_restored" | "crew_disbanded";
    title: string;
    previousState: CrewState["lifecycle"];
    nextState: CrewState["lifecycle"];
    reason: string;
  }>;
}): Promise<CrewLifecycleMutationResult> {
  const command = await withDatabaseTransaction(async (client) => {
    const replay = await readReplay(client, input.actorUserId, input.idempotencyKey);
    if (replay) return { replayed: true, outcome: replay.outcome, eventId: replay.event_id };
    const crew = await readCrewState(input.crewId, client, true);
    assertVersion(crew.version, input.expectedVersion, "CREW_LIFECYCLE_STALE_VERSION");
    const members = await listActiveMembers(crew.id, client);
    const actor = members.find((member) => member.user_id === input.actorUserId);
    if (!actor || actor.role !== "owner" || actor.user_id !== crew.owner_user_id) {
      fail("CREW_LIFECYCLE_FORBIDDEN", "Only the Crew owner can manage lifecycle state.", 403);
    }
    const result = await input.mutate(client, crew, actor);
    await bumpCrewVersion(client, crew.id);
    const eventId = await recordCrewEvent(client, {
      crew,
      actorUserId: input.actorUserId,
      eventType: result.eventType,
      title: result.title,
      subjectId: crew.id,
      metadata: {
        previous_state: result.previousState,
        next_state: result.nextState,
        reason: result.reason,
      },
    });
    await recordCommand(client, {
      actorUserId: input.actorUserId,
      idempotencyKey: input.idempotencyKey,
      crewId: crew.id,
      operation: input.operation,
      outcome: result.outcome,
      eventId,
    });
    return { replayed: false, outcome: result.outcome, eventId };
  });
  return {
    outcome: command.outcome as CrewLifecycleMutationResult["outcome"],
    eventId: command.eventId,
    replayed: command.replayed,
    snapshot: await getCrewLifecycleForRead(input.crewId, input.actorUserId),
  };
}

export async function transitionCrewLifecycle(input: {
  crewId: string;
  actorUserId: string;
  expectedVersion: number;
  targetState: CrewLifecycleTarget;
  reason: string;
  idempotencyKey: string;
}) {
  return withLifecycleCommand({
    ...input,
    operation: "transition_lifecycle",
    mutate: async (client, crew) => {
      if (!lifecycleAllowedTransitions(crew.lifecycle).includes(input.targetState)) {
        fail("CREW_LIFECYCLE_TRANSITION_INVALID", `${crew.lifecycle} cannot transition directly to ${input.targetState}.`);
      }
      const previousState = crew.lifecycle;
      await client.query(
        `UPDATE crews
            SET lifecycle = $1,
                recruiting = CASE WHEN $1 = 'active' THEN true ELSE false END
          WHERE id = $2`,
        [input.targetState, crew.id],
      );
      const eventType = input.targetState === "active"
        ? previousState === "archived" ? "crew_restored" : "crew_activated"
        : input.targetState === "inactive" ? "crew_deactivated" : "crew_archived";
      return {
        outcome: "lifecycle_changed" as const,
        eventType,
        title: `Crew lifecycle changed to ${input.targetState}`,
        previousState,
        nextState: input.targetState,
        reason: input.reason,
      };
    },
  });
}

export async function disbandCrew(input: {
  crewId: string;
  actorUserId: string;
  expectedVersion: number;
  reason: string;
  confirmation: string;
  idempotencyKey: string;
}) {
  return withLifecycleCommand({
    ...input,
    operation: "disband_crew",
    mutate: async (client, crew) => {
      const expectedConfirmation = `DISBAND ${crew.name.toUpperCase()}`;
      if (input.confirmation !== expectedConfirmation) {
        fail("CREW_DISBAND_CONFIRMATION_INVALID", `Type ${expectedConfirmation} to confirm disbanding.`, 400);
      }
      if (crew.lifecycle === "disbanded") fail("CREW_ALREADY_DISBANDED", "This Crew is already disbanded.");
      const previousState = crew.lifecycle;
      await client.query(
        `UPDATE crews
            SET lifecycle = 'disbanded',
                recruiting = false,
                disbanded_at = now()
          WHERE id = $1`,
        [crew.id],
      );
      await client.query(
        `UPDATE crew_members SET left_at = now()
          WHERE crew_id = $1 AND left_at IS NULL`,
        [crew.id],
      );
      await client.query(
        `UPDATE crew_applications SET status = 'expired'
          WHERE crew_id = $1 AND status = 'pending'`,
        [crew.id],
      );
      await client.query(
        `UPDATE crew_invites SET status = 'expired'
          WHERE crew_id = $1 AND status = 'pending'`,
        [crew.id],
      );
      return {
        outcome: "crew_disbanded" as const,
        eventType: "crew_disbanded" as const,
        title: "Crew disbanded",
        previousState,
        nextState: "disbanded" as const,
        reason: input.reason,
      };
    },
  });
}
