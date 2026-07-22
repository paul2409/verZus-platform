import "server-only";

import { randomUUID } from "node:crypto";

import type { PoolClient } from "pg";

import { queryDatabase, withDatabaseTransaction } from "@/lib/db";

export interface IdentityUser {
  id: string;
  email: string;
  normalizedEmail: string;
  gamerTag: string;
  passwordHash: string;
  emailVerifiedAt: Date | null;
}

interface IdentityUserRow {
  id: string;
  email: string;
  normalized_email: string;
  gamer_tag: string;
  password_hash: string;
  email_verified_at: Date | null;
}

function mapUser(row: IdentityUserRow): IdentityUser {
  return {
    id: row.id,
    email: row.email,
    normalizedEmail: row.normalized_email,
    gamerTag: row.gamer_tag,
    passwordHash: row.password_hash,
    emailVerifiedAt: row.email_verified_at,
  };
}

export async function findIdentityUserById(userId: string): Promise<IdentityUser | null> {
  const result = await queryDatabase<IdentityUserRow>(
    `SELECT id, email, normalized_email, gamer_tag, password_hash, email_verified_at
       FROM users
      WHERE id = $1`,
    [userId],
  );
  return result.rows[0] ? mapUser(result.rows[0]) : null;
}

export async function findIdentityUserByIdentifier(
  identifier: string,
): Promise<IdentityUser | null> {
  const result = await queryDatabase<IdentityUserRow>(
    `SELECT id, email, normalized_email, gamer_tag, password_hash, email_verified_at
       FROM users
      WHERE normalized_email = $1 OR normalized_phone = $1
      LIMIT 1`,
    [identifier],
  );
  return result.rows[0] ? mapUser(result.rows[0]) : null;
}

export async function replaceVerificationCode(input: {
  userId: string;
  codeHash: string;
  expiresAt: Date;
  requestId: string;
}): Promise<void> {
  await withDatabaseTransaction(async (client) => {
    await client.query(
      `UPDATE email_verification_tokens
          SET consumed_at = COALESCE(consumed_at, now())
        WHERE user_id = $1 AND consumed_at IS NULL`,
      [input.userId],
    );
    await client.query(
      `INSERT INTO email_verification_tokens (id, user_id, code_hash, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [randomUUID(), input.userId, input.codeHash, input.expiresAt],
    );
    await audit(client, input.userId, "auth.verification_issued", input.requestId);
  });
}

export async function verifyEmailCode(input: {
  userId: string;
  codeHash: string;
  requestId: string;
}): Promise<"verified" | "already_verified" | "invalid" | "expired" | "rate_limited"> {
  return withDatabaseTransaction(async (client) => {
    const user = await client.query<{ email_verified_at: Date | null }>(
      "SELECT email_verified_at FROM users WHERE id = $1 FOR UPDATE",
      [input.userId],
    );
    if (user.rows[0]?.email_verified_at) return "already_verified";

    const token = await client.query<{
      id: string;
      code_hash: string;
      expires_at: Date;
      attempt_count: number;
    }>(
      `SELECT id, code_hash, expires_at, attempt_count
         FROM email_verification_tokens
        WHERE user_id = $1 AND consumed_at IS NULL
        ORDER BY created_at DESC
        LIMIT 1
        FOR UPDATE`,
      [input.userId],
    );
    const row = token.rows[0];
    if (!row) return "invalid";
    if (row.attempt_count >= 5) return "rate_limited";
    if (row.expires_at.getTime() <= Date.now()) return "expired";

    if (row.code_hash !== input.codeHash) {
      await client.query(
        "UPDATE email_verification_tokens SET attempt_count = attempt_count + 1 WHERE id = $1",
        [row.id],
      );
      return "invalid";
    }

    await client.query("UPDATE email_verification_tokens SET consumed_at = now() WHERE id = $1", [
      row.id,
    ]);
    await client.query(
      "UPDATE users SET email_verified_at = now(), updated_at = now() WHERE id = $1",
      [input.userId],
    );
    await audit(client, input.userId, "auth.email_verified", input.requestId);
    return "verified";
  });
}

export async function replacePasswordResetToken(input: {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  requestId: string;
}): Promise<void> {
  await withDatabaseTransaction(async (client) => {
    await client.query(
      `UPDATE password_reset_tokens
          SET consumed_at = COALESCE(consumed_at, now())
        WHERE user_id = $1 AND consumed_at IS NULL`,
      [input.userId],
    );
    await client.query(
      `INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [randomUUID(), input.userId, input.tokenHash, input.expiresAt],
    );
    await audit(client, input.userId, "auth.password_reset_requested", input.requestId);
  });
}

export async function consumePasswordReset(input: {
  tokenHash: string;
  passwordHash: string;
  requestId: string;
}): Promise<"reset" | "invalid" | "expired"> {
  return withDatabaseTransaction(async (client) => {
    const token = await client.query<{ id: string; user_id: string; expires_at: Date }>(
      `SELECT id, user_id, expires_at
         FROM password_reset_tokens
        WHERE token_hash = $1 AND consumed_at IS NULL
        LIMIT 1
        FOR UPDATE`,
      [input.tokenHash],
    );
    const row = token.rows[0];
    if (!row) return "invalid";
    if (row.expires_at.getTime() <= Date.now()) return "expired";

    await client.query("UPDATE password_reset_tokens SET consumed_at = now() WHERE id = $1", [
      row.id,
    ]);
    await client.query("UPDATE users SET password_hash = $2, updated_at = now() WHERE id = $1", [
      row.user_id,
      input.passwordHash,
    ]);
    await client.query(
      "UPDATE auth_sessions SET revoked_at = COALESCE(revoked_at, now()) WHERE user_id = $1",
      [row.user_id],
    );
    await audit(client, row.user_id, "auth.password_reset_completed", input.requestId);
    return "reset";
  });
}

export async function claimActionWindow(input: {
  action: string;
  keyHash: string;
  windowSeconds: number;
}): Promise<number | null> {
  const result = await queryDatabase<{ allowed: boolean; retry_after: number | null }>(
    `INSERT INTO auth_action_throttles (
       action, key_hash, attempt_count, window_started_at, blocked_until, updated_at
     ) VALUES ($1, $2, 1, now(), now() + ($3 * interval '1 second'), now())
     ON CONFLICT (action, key_hash) DO UPDATE SET
       attempt_count = CASE
         WHEN auth_action_throttles.blocked_until <= now() THEN 1
         ELSE auth_action_throttles.attempt_count + 1
       END,
       window_started_at = CASE
         WHEN auth_action_throttles.blocked_until <= now() THEN now()
         ELSE auth_action_throttles.window_started_at
       END,
       blocked_until = CASE
         WHEN auth_action_throttles.blocked_until <= now()
           THEN now() + ($3 * interval '1 second')
         ELSE auth_action_throttles.blocked_until
       END,
       updated_at = now()
     RETURNING
       attempt_count = 1 AS allowed,
       GREATEST(1, CEIL(EXTRACT(EPOCH FROM (blocked_until - now()))))::int AS retry_after`,
    [input.action, input.keyHash, input.windowSeconds],
  );
  const row = result.rows[0];
  return row?.allowed ? null : (row?.retry_after ?? input.windowSeconds);
}

async function audit(
  client: Pick<PoolClient, "query">,
  userId: string,
  action: string,
  requestId: string,
): Promise<void> {
  await client.query(
    `INSERT INTO audit_events (
       id, actor_user_id, action, target_type, target_id, request_id
     ) VALUES ($1, $2, $3, 'user', $2::uuid::text, $4)`,
    [randomUUID(), userId, action, requestId],
  );
}
