import "server-only";

import { createHash, randomUUID } from "node:crypto";

import type { PoolClient } from "pg";

import { queryDatabase, withDatabaseTransaction } from "@/lib/db";

import type { ProfileEditFields, ProfileEditSnapshot } from "../model/profile-edit.types";

interface ProfileRow {
  version: number;
  updated_at: Date;
  avatar_url: string | null;
  display_name: string;
  handle: string;
  title: string;
  bio: string;
  location_label: string;
  country_code: string | null;
  availability_state: ProfileEditFields["availabilityState"];
  availability_label: string;
  availability_detail: string;
  next_window_label: string;
}

interface StoredMutationRow {
  fingerprint: string;
  response: ProfileEditSnapshot;
}

function toSnapshot(row: ProfileRow, replayed = false): ProfileEditSnapshot {
  return {
    version: row.version,
    updatedAt: row.updated_at.toISOString(),
    avatarUrl: row.avatar_url,
    replayed,
    fields: {
      displayName: row.display_name,
      handle: row.handle,
      title: row.title,
      bio: row.bio,
      locationLabel: row.location_label,
      countryCode: row.country_code ?? "",
      availabilityState: row.availability_state,
      availabilityLabel: row.availability_label,
      availabilityDetail: row.availability_detail,
      nextWindowLabel: row.next_window_label,
    },
  };
}

const profileSelect = `SELECT version, updated_at, avatar_url, display_name, handle, title, bio,
  location_label, country_code, availability_state, availability_label,
  availability_detail, next_window_label
  FROM player_profiles WHERE user_id = $1`;

export async function readProfileEditSnapshot(userId: string): Promise<ProfileEditSnapshot | null> {
  const result = await queryDatabase<ProfileRow>(profileSelect, [userId]);
  return result.rows[0] ? toSnapshot(result.rows[0]) : null;
}

export class ProfileEditConflictError extends Error {
  constructor(readonly code: "STALE_VERSION" | "IDEMPOTENCY_KEY_REUSED" | "HANDLE_TAKEN") {
    super(code);
  }
}

function fingerprint(expectedVersion: number, fields: ProfileEditFields): string {
  return createHash("sha256").update(JSON.stringify({ expectedVersion, fields })).digest("hex");
}

async function readStoredMutation(
  client: PoolClient,
  userId: string,
  idempotencyKey: string,
): Promise<StoredMutationRow | null> {
  const result = await client.query<StoredMutationRow>(
    `SELECT fingerprint, response FROM profile_mutation_requests
     WHERE user_id = $1 AND operation = 'profile_edit' AND idempotency_key = $2`,
    [userId, idempotencyKey],
  );
  return result.rows[0] ?? null;
}

export async function updateProfileEdit(input: {
  userId: string;
  expectedVersion: number;
  fields: ProfileEditFields;
  idempotencyKey: string;
  requestId: string;
}): Promise<ProfileEditSnapshot> {
  return withDatabaseTransaction(async (client) => {
    const commandFingerprint = fingerprint(input.expectedVersion, input.fields);
    const stored = await readStoredMutation(client, input.userId, input.idempotencyKey);
    if (stored) {
      if (stored.fingerprint !== commandFingerprint) {
        throw new ProfileEditConflictError("IDEMPOTENCY_KEY_REUSED");
      }
      return { ...stored.response, replayed: true };
    }

    const currentResult = await client.query<ProfileRow>(`${profileSelect} FOR UPDATE`, [
      input.userId,
    ]);
    const current = currentResult.rows[0];
    if (!current) throw new Error("PROFILE_NOT_FOUND");
    if (current.version !== input.expectedVersion) {
      throw new ProfileEditConflictError("STALE_VERSION");
    }

    let updated: ProfileRow;
    try {
      const updateResult = await client.query<ProfileRow>(
        `UPDATE player_profiles SET
          display_name = $2,
          handle = $3,
          title = $4,
          bio = $5,
          location_label = $6,
          country_code = NULLIF($7, ''),
          availability_state = $8,
          availability_label = $9,
          availability_detail = $10,
          next_window_label = $11,
          version = version + 1,
          updated_at = now()
         WHERE user_id = $1
         RETURNING version, updated_at, avatar_url, display_name, handle, title, bio,
           location_label, country_code, availability_state, availability_label,
           availability_detail, next_window_label`,
        [
          input.userId,
          input.fields.displayName,
          input.fields.handle,
          input.fields.title,
          input.fields.bio,
          input.fields.locationLabel,
          input.fields.countryCode,
          input.fields.availabilityState,
          input.fields.availabilityLabel,
          input.fields.availabilityDetail,
          input.fields.nextWindowLabel,
        ],
      );
      const updatedRow = updateResult.rows[0];
      if (!updatedRow) throw new Error("PROFILE_UPDATE_FAILED");
      updated = updatedRow;
    } catch (error) {
      if (typeof error === "object" && error && "code" in error && error.code === "23505") {
        throw new ProfileEditConflictError("HANDLE_TAKEN");
      }
      throw error;
    }

    const snapshot = toSnapshot(updated);
    await client.query(
      `INSERT INTO profile_mutation_requests
        (user_id, operation, idempotency_key, fingerprint, response)
       VALUES ($1, 'profile_edit', $2, $3, $4::jsonb)`,
      [input.userId, input.idempotencyKey, commandFingerprint, JSON.stringify(snapshot)],
    );
    await client.query(
      `INSERT INTO audit_events
        (id, actor_user_id, action, target_type, target_id, request_id, metadata)
       VALUES ($1, $2, 'profile.updated', 'player_profile', $2::uuid::text, $3, $4::jsonb)`,
      [randomUUID(), input.userId, input.requestId, JSON.stringify({ version: snapshot.version })],
    );
    return snapshot;
  });
}
