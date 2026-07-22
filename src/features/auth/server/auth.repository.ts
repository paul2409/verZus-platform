import "server-only";

import { randomUUID } from "node:crypto";

import type { PoolClient } from "pg";

import { queryDatabase, withDatabaseTransaction } from "@/lib/db";

import type { AuthRole } from "../model/auth-state";

export type AuthAccountStatus = "active" | "suspended" | "banned";

export interface AuthUserRecord {
  id: string;
  email: string;
  normalizedEmail: string;
  phone: string | null;
  normalizedPhone: string | null;
  gamerTag: string;
  passwordHash: string;
  role: AuthRole;
  status: AuthAccountStatus;
  restrictionReason: string | null;
  emailVerifiedAt: Date | null;
  onboardingCompletedAt: Date | null;
}

export interface AuthSessionRecord {
  id: string;
  userId: string;
  tokenHash: string;
  deviceId: string | null;
  expiresAt: Date;
  lastSeenAt: Date;
  user: AuthUserRecord;
}

interface UserRow {
  id: string;
  email: string;
  normalized_email: string;
  phone: string | null;
  normalized_phone: string | null;
  gamer_tag: string;
  password_hash: string;
  role: AuthRole;
  status: AuthAccountStatus;
  restriction_reason: string | null;
  email_verified_at: Date | null;
  onboarding_completed_at: Date | null;
}

interface SessionRow extends UserRow {
  session_id: string;
  user_id: string;
  token_hash: string;
  device_id: string | null;
  expires_at: Date;
  last_seen_at: Date;
}

interface ThrottleRow {
  failure_count: number;
  blocked_until: Date | null;
}

function mapUser(row: UserRow): AuthUserRecord {
  return {
    id: row.id,
    email: row.email,
    normalizedEmail: row.normalized_email,
    phone: row.phone,
    normalizedPhone: row.normalized_phone,
    gamerTag: row.gamer_tag,
    passwordHash: row.password_hash,
    role: row.role,
    status: row.status,
    restrictionReason: row.restriction_reason,
    emailVerifiedAt: row.email_verified_at,
    onboardingCompletedAt: row.onboarding_completed_at,
  };
}

function mapSession(row: SessionRow): AuthSessionRecord {
  return {
    id: row.session_id,
    userId: row.user_id,
    tokenHash: row.token_hash,
    deviceId: row.device_id,
    expiresAt: row.expires_at,
    lastSeenAt: row.last_seen_at,
    user: mapUser(row),
  };
}

const userColumns = `
  u.id,
  u.email,
  u.normalized_email,
  u.phone,
  u.normalized_phone,
  u.gamer_tag,
  u.password_hash,
  u.role,
  u.status,
  u.restriction_reason,
  u.email_verified_at,
  u.onboarding_completed_at
`;

export async function findUserByIdentifier(identifier: string): Promise<AuthUserRecord | null> {
  const result = await queryDatabase<UserRow>(
    `SELECT ${userColumns}
       FROM users u
      WHERE u.normalized_email = $1 OR u.normalized_phone = $1
      LIMIT 1`,
    [identifier],
  );

  return result.rows[0] ? mapUser(result.rows[0]) : null;
}

export async function findRegistrationConflicts(input: {
  normalizedEmail: string;
  normalizedPhone: string | null;
  normalizedGamerTag: string;
}): Promise<{ email: boolean; phone: boolean; gamerTag: boolean }> {
  const result = await queryDatabase<{
    email_exists: boolean;
    phone_exists: boolean;
    gamer_tag_exists: boolean;
  }>(
    `SELECT
       EXISTS(SELECT 1 FROM users WHERE normalized_email = $1) AS email_exists,
       CASE
         WHEN $2::text IS NULL THEN false
         ELSE EXISTS(SELECT 1 FROM users WHERE normalized_phone = $2)
       END AS phone_exists,
       EXISTS(SELECT 1 FROM users WHERE normalized_gamer_tag = $3) AS gamer_tag_exists`,
    [input.normalizedEmail, input.normalizedPhone, input.normalizedGamerTag],
  );

  const row = result.rows[0];
  return {
    email: row?.email_exists ?? false,
    phone: row?.phone_exists ?? false,
    gamerTag: row?.gamer_tag_exists ?? false,
  };
}

export async function createUserAndSession(input: {
  userId: string;
  email: string;
  normalizedEmail: string;
  phone: string | null;
  normalizedPhone: string | null;
  gamerTag: string;
  normalizedGamerTag: string;
  passwordHash: string;
  sessionId: string;
  tokenHash: string;
  deviceId: string | null;
  expiresAt: Date;
  requestId: string;
}): Promise<void> {
  await withDatabaseTransaction(async (client) => {
    await client.query(
      `INSERT INTO users (
         id,
         email,
         normalized_email,
         phone,
         normalized_phone,
         gamer_tag,
         normalized_gamer_tag,
         password_hash
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        input.userId,
        input.email,
        input.normalizedEmail,
        input.phone,
        input.normalizedPhone,
        input.gamerTag,
        input.normalizedGamerTag,
        input.passwordHash,
      ],
    );

    await insertSession(client, {
      sessionId: input.sessionId,
      userId: input.userId,
      tokenHash: input.tokenHash,
      deviceId: input.deviceId,
      expiresAt: input.expiresAt,
    });

    await client.query(
      `INSERT INTO audit_events (
         id,
         actor_user_id,
         action,
         target_type,
         target_id,
         request_id,
         metadata
       ) VALUES ($1, $2, 'auth.account_registered', 'user', $2, $3, $4::jsonb)`,
      [
        randomUUID(),
        input.userId,
        input.requestId,
        JSON.stringify({ email: input.normalizedEmail }),
      ],
    );
  });
}

async function insertSession(
  client: Pick<PoolClient, "query">,
  input: {
    sessionId: string;
    userId: string;
    tokenHash: string;
    deviceId: string | null;
    expiresAt: Date;
  },
): Promise<void> {
  await client.query(
    `INSERT INTO auth_sessions (
       id,
       user_id,
       token_hash,
       device_id,
       expires_at
     ) VALUES ($1, $2, $3, $4, $5)`,
    [input.sessionId, input.userId, input.tokenHash, input.deviceId, input.expiresAt],
  );
}

export async function createSession(input: {
  sessionId: string;
  userId: string;
  tokenHash: string;
  deviceId: string | null;
  expiresAt: Date;
  requestId: string;
}): Promise<void> {
  await withDatabaseTransaction(async (client) => {
    await insertSession(client, input);
    await client.query(
      `INSERT INTO audit_events (
         id,
         actor_user_id,
         action,
         target_type,
         target_id,
         request_id
       ) VALUES ($1, $2, 'auth.login_succeeded', 'auth_session', $3, $4)`,
      [randomUUID(), input.userId, input.sessionId, input.requestId],
    );
  });
}

export async function findActiveSession(tokenHash: string): Promise<AuthSessionRecord | null> {
  const result = await queryDatabase<SessionRow>(
    `SELECT
       s.id AS session_id,
       s.user_id,
       s.token_hash,
       s.device_id,
       s.expires_at,
       s.last_seen_at,
       ${userColumns}
     FROM auth_sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = $1
       AND s.revoked_at IS NULL
       AND s.expires_at > now()
     LIMIT 1`,
    [tokenHash],
  );

  const row = result.rows[0];
  if (!row) return null;

  await queryDatabase(
    `UPDATE auth_sessions
        SET last_seen_at = now()
      WHERE id = $1
        AND last_seen_at < now() - interval '5 minutes'`,
    [row.session_id],
  );

  return mapSession(row);
}

export async function revokeSession(tokenHash: string): Promise<void> {
  await queryDatabase(
    `UPDATE auth_sessions
        SET revoked_at = COALESCE(revoked_at, now())
      WHERE token_hash = $1`,
    [tokenHash],
  );
}

export async function rotateSession(input: {
  currentTokenHash: string;
  nextTokenHash: string;
  nextExpiresAt: Date;
}): Promise<AuthSessionRecord | null> {
  return withDatabaseTransaction(async (client) => {
    const current = await client.query<SessionRow>(
      `SELECT
         s.id AS session_id,
         s.user_id,
         s.token_hash,
         s.device_id,
         s.expires_at,
         s.last_seen_at,
         ${userColumns}
       FROM auth_sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = $1
         AND s.revoked_at IS NULL
         AND s.expires_at > now()
       FOR UPDATE`,
      [input.currentTokenHash],
    );

    const row = current.rows[0];
    if (!row) return null;

    await client.query(
      `UPDATE auth_sessions
          SET token_hash = $2,
              expires_at = $3,
              last_seen_at = now()
        WHERE id = $1`,
      [row.session_id, input.nextTokenHash, input.nextExpiresAt],
    );

    return mapSession({
      ...row,
      token_hash: input.nextTokenHash,
      expires_at: input.nextExpiresAt,
      last_seen_at: new Date(),
    });
  });
}

export async function getLoginThrottle(
  identifierHash: string,
): Promise<{ failureCount: number; blockedUntil: Date | null } | null> {
  const result = await queryDatabase<ThrottleRow>(
    `SELECT failure_count, blocked_until
       FROM auth_login_throttles
      WHERE identifier_hash = $1`,
    [identifierHash],
  );

  const row = result.rows[0];
  return row
    ? {
        failureCount: row.failure_count,
        blockedUntil: row.blocked_until,
      }
    : null;
}

export async function recordLoginFailure(input: {
  identifierHash: string;
  maxFailures: number;
  windowSeconds: number;
  blockSeconds: number;
}): Promise<{ failureCount: number; blockedUntil: Date | null }> {
  const result = await queryDatabase<ThrottleRow>(
    `INSERT INTO auth_login_throttles (
       identifier_hash,
       failure_count,
       window_started_at,
       blocked_until,
       updated_at
     ) VALUES ($1, 1, now(), NULL, now())
     ON CONFLICT (identifier_hash) DO UPDATE SET
       failure_count = CASE
         WHEN auth_login_throttles.window_started_at < now() - ($3 * interval '1 second')
           THEN 1
         ELSE auth_login_throttles.failure_count + 1
       END,
       window_started_at = CASE
         WHEN auth_login_throttles.window_started_at < now() - ($3 * interval '1 second')
           THEN now()
         ELSE auth_login_throttles.window_started_at
       END,
       blocked_until = CASE
         WHEN (
           CASE
             WHEN auth_login_throttles.window_started_at < now() - ($3 * interval '1 second')
               THEN 1
             ELSE auth_login_throttles.failure_count + 1
           END
         ) >= $2
           THEN now() + ($4 * interval '1 second')
         ELSE NULL
       END,
       updated_at = now()
     RETURNING failure_count, blocked_until`,
    [input.identifierHash, input.maxFailures, input.windowSeconds, input.blockSeconds],
  );

  const row = result.rows[0];
  return {
    failureCount: row?.failure_count ?? 1,
    blockedUntil: row?.blocked_until ?? null,
  };
}

export async function clearLoginThrottle(identifierHash: string): Promise<void> {
  await queryDatabase("DELETE FROM auth_login_throttles WHERE identifier_hash = $1", [
    identifierHash,
  ]);
}
