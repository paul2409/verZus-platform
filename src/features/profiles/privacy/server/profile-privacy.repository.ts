import "server-only";

import { createHash, randomUUID } from "node:crypto";

import type { PoolClient } from "pg";

import { queryDatabase, withDatabaseTransaction } from "@/lib/db";

import type {
  ProfilePrivacySettings,
  ProfilePrivacySnapshot,
} from "../model/profile-privacy.types";

interface PrivacyRow {
  user_id: string;
  version: number;
  updated_at: Date;
  profile_visibility: ProfilePrivacySettings["profileVisibility"];
  location_audience: ProfilePrivacySettings["location"];
  crew_audience: ProfilePrivacySettings["crew"];
  statistics_audience: ProfilePrivacySettings["statistics"];
  trust_score_audience: ProfilePrivacySettings["trustScore"];
  match_history_audience: ProfilePrivacySettings["matchHistory"];
  game_handles_audience: ProfilePrivacySettings["gameHandles"];
  achievements_audience: ProfilePrivacySettings["achievements"];
  availability_audience: ProfilePrivacySettings["availability"];
}

interface StoredMutationRow {
  fingerprint: string;
  response: ProfilePrivacySnapshot;
}

function toSnapshot(row: PrivacyRow, requestId: string, replayed = false): ProfilePrivacySnapshot {
  return {
    playerId: row.user_id,
    version: row.version,
    updatedAt: row.updated_at.toISOString(),
    requestId,
    source: "postgres-profile-privacy",
    replayed,
    settings: {
      profileVisibility: row.profile_visibility,
      location: row.location_audience,
      crew: row.crew_audience,
      statistics: row.statistics_audience,
      trustScore: row.trust_score_audience,
      matchHistory: row.match_history_audience,
      gameHandles: row.game_handles_audience,
      achievements: row.achievements_audience,
      availability: row.availability_audience,
    },
  };
}

const privacySelect = `SELECT user_id, version, updated_at, profile_visibility,
  location_audience, crew_audience, statistics_audience, trust_score_audience,
  match_history_audience, game_handles_audience, achievements_audience,
  availability_audience
  FROM profile_privacy_settings WHERE user_id = $1`;

export async function readProfilePrivacySnapshot(
  userId: string,
  requestId: string,
): Promise<ProfilePrivacySnapshot | null> {
  const result = await queryDatabase<PrivacyRow>(privacySelect, [userId]);
  return result.rows[0] ? toSnapshot(result.rows[0], requestId) : null;
}

export class ProfilePrivacyConflictError extends Error {
  constructor(readonly code: "STALE_VERSION" | "IDEMPOTENCY_KEY_REUSED") {
    super(code);
  }
}

function fingerprint(expectedVersion: number, settings: ProfilePrivacySettings): string {
  return createHash("sha256").update(JSON.stringify({ expectedVersion, settings })).digest("hex");
}

async function readStoredMutation(
  client: PoolClient,
  userId: string,
  idempotencyKey: string,
): Promise<StoredMutationRow | null> {
  const result = await client.query<StoredMutationRow>(
    `SELECT fingerprint, response FROM profile_mutation_requests
     WHERE user_id = $1 AND operation = 'profile_privacy' AND idempotency_key = $2`,
    [userId, idempotencyKey],
  );
  return result.rows[0] ?? null;
}

export async function updateProfilePrivacy(input: {
  userId: string;
  expectedVersion: number;
  settings: ProfilePrivacySettings;
  idempotencyKey: string;
  requestId: string;
}): Promise<ProfilePrivacySnapshot> {
  return withDatabaseTransaction(async (client) => {
    const commandFingerprint = fingerprint(input.expectedVersion, input.settings);
    const stored = await readStoredMutation(client, input.userId, input.idempotencyKey);
    if (stored) {
      if (stored.fingerprint !== commandFingerprint) {
        throw new ProfilePrivacyConflictError("IDEMPOTENCY_KEY_REUSED");
      }
      return { ...stored.response, requestId: input.requestId, replayed: true };
    }

    const currentResult = await client.query<PrivacyRow>(`${privacySelect} FOR UPDATE`, [
      input.userId,
    ]);
    const current = currentResult.rows[0];
    if (!current) throw new Error("PROFILE_PRIVACY_NOT_FOUND");
    if (current.version !== input.expectedVersion) {
      throw new ProfilePrivacyConflictError("STALE_VERSION");
    }

    const s = input.settings;
    const updatedResult = await client.query<PrivacyRow>(
      `UPDATE profile_privacy_settings SET
        version = version + 1,
        profile_visibility = $2,
        location_audience = $3,
        crew_audience = $4,
        statistics_audience = $5,
        trust_score_audience = $6,
        match_history_audience = $7,
        game_handles_audience = $8,
        achievements_audience = $9,
        availability_audience = $10,
        updated_at = now()
       WHERE user_id = $1
       RETURNING user_id, version, updated_at, profile_visibility,
         location_audience, crew_audience, statistics_audience, trust_score_audience,
         match_history_audience, game_handles_audience, achievements_audience,
         availability_audience`,
      [
        input.userId,
        s.profileVisibility,
        s.location,
        s.crew,
        s.statistics,
        s.trustScore,
        s.matchHistory,
        s.gameHandles,
        s.achievements,
        s.availability,
      ],
    );
    await client.query(
      `UPDATE player_profiles SET profile_visibility = $2, updated_at = now() WHERE user_id = $1`,
      [input.userId, s.profileVisibility],
    );

    const updated = updatedResult.rows[0];
    if (!updated) throw new Error("PROFILE_PRIVACY_UPDATE_FAILED");
    const snapshot = toSnapshot(updated, input.requestId);
    await client.query(
      `INSERT INTO profile_mutation_requests
        (user_id, operation, idempotency_key, fingerprint, response)
       VALUES ($1, 'profile_privacy', $2, $3, $4::jsonb)`,
      [input.userId, input.idempotencyKey, commandFingerprint, JSON.stringify(snapshot)],
    );
    await client.query(
      `INSERT INTO audit_events
        (id, actor_user_id, action, target_type, target_id, request_id, metadata)
       VALUES ($1, $2, 'profile.privacy.updated', 'player_profile', $2::uuid::text, $3, $4::jsonb)`,
      [randomUUID(), input.userId, input.requestId, JSON.stringify({ version: snapshot.version })],
    );
    return snapshot;
  });
}
