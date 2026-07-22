import "server-only";

import { randomUUID } from "node:crypto";

import type { PoolClient } from "pg";

import { queryDatabase, withDatabaseTransaction } from "@/lib/db";

import { onboardingDraftSchema, type OnboardingDraft } from "../model";

export async function getUserGamerTag(userId: string): Promise<string | null> {
  const result = await queryDatabase<{ gamer_tag: string }>(
    "SELECT gamer_tag FROM users WHERE id = $1",
    [userId],
  );
  return result.rows[0]?.gamer_tag ?? null;
}

export async function readOnboardingDraft(userId: string): Promise<OnboardingDraft | null> {
  const result = await queryDatabase<{ draft: unknown }>(
    "SELECT draft FROM onboarding_progress WHERE user_id = $1",
    [userId],
  );
  const row = result.rows[0];
  return row ? onboardingDraftSchema.parse(row.draft) : null;
}

export async function writeOnboardingDraft(input: {
  userId: string;
  draft: OnboardingDraft;
  requestId: string;
  action: string;
}): Promise<void> {
  await withDatabaseTransaction(async (client) => {
    await client.query(
      `INSERT INTO onboarding_progress (
         user_id, version, draft, status, current_step, updated_at, completed_at
       ) VALUES ($1, $2, $3::jsonb, $4, $5, now(), $6)
       ON CONFLICT (user_id) DO UPDATE SET
         version = EXCLUDED.version,
         draft = EXCLUDED.draft,
         status = EXCLUDED.status,
         current_step = EXCLUDED.current_step,
         updated_at = now(),
         completed_at = EXCLUDED.completed_at`,
      [
        input.userId,
        input.draft.version,
        JSON.stringify(input.draft),
        input.draft.status,
        input.draft.currentStep,
        input.draft.completedAt,
      ],
    );
    await audit(client, input.userId, input.action, input.requestId, {
      step: input.draft.currentStep,
      status: input.draft.status,
    });
  });
}

export async function completePlayerIdentity(input: {
  userId: string;
  draft: OnboardingDraft;
  requestId: string;
}): Promise<void> {
  const { draft } = input;
  if (!draft.location || !draft.playerIdentity) {
    throw new Error("Completed onboarding requires location and player identity.");
  }

  const location = draft.location;
  const identity = draft.playerIdentity;

  await withDatabaseTransaction(async (client) => {
    await client.query(
      `INSERT INTO player_profiles (
         user_id, display_name, handle, country_code, region, city, timezone, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, now())
       ON CONFLICT (user_id) DO UPDATE SET
         display_name = EXCLUDED.display_name,
         handle = EXCLUDED.handle,
         country_code = EXCLUDED.country_code,
         region = EXCLUDED.region,
         city = EXCLUDED.city,
         timezone = EXCLUDED.timezone,
         updated_at = now()`,
      [
        input.userId,
        identity.gamerTag,
        `@${identity.gamerTag
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, "_")
          .slice(0, 20)}`,
        location.countryCode,
        location.region,
        location.city,
        location.timezone,
      ],
    );

    await client.query("DELETE FROM player_game_identities WHERE user_id = $1", [input.userId]);
    for (const [index, gameId] of draft.selectedGameIds.entries()) {
      await client.query(
        `INSERT INTO player_game_identities (
           id, user_id, game_id, platform, platform_handle, is_primary
         ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          randomUUID(),
          input.userId,
          gameId,
          identity.platform,
          identity.platformHandle,
          index === 0,
        ],
      );
    }

    await client.query("DELETE FROM player_availability WHERE user_id = $1", [input.userId]);
    for (const slot of draft.availability) {
      await client.query(
        `INSERT INTO player_availability (
           id, user_id, day_of_week, start_time, end_time, timezone
         ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [randomUUID(), input.userId, slot.day, slot.startTime, slot.endTime, location.timezone],
      );
    }

    await client.query(
      `INSERT INTO onboarding_progress (
         user_id, version, draft, status, current_step, updated_at, completed_at
       ) VALUES ($1, $2, $3::jsonb, $4, $5, now(), $6)
       ON CONFLICT (user_id) DO UPDATE SET
         version = EXCLUDED.version,
         draft = EXCLUDED.draft,
         status = EXCLUDED.status,
         current_step = EXCLUDED.current_step,
         updated_at = now(),
         completed_at = EXCLUDED.completed_at`,
      [
        input.userId,
        draft.version,
        JSON.stringify(draft),
        draft.status,
        draft.currentStep,
        draft.completedAt,
      ],
    );
    await client.query(
      "UPDATE users SET onboarding_completed_at = $2, updated_at = now() WHERE id = $1",
      [input.userId, draft.completedAt],
    );
    await audit(client, input.userId, "onboarding.completed", input.requestId, {
      games: draft.selectedGameIds,
    });
  });
}

async function audit(
  client: Pick<PoolClient, "query">,
  userId: string,
  action: string,
  requestId: string,
  metadata: Record<string, unknown>,
): Promise<void> {
  await client.query(
    `INSERT INTO audit_events (
       id, actor_user_id, action, target_type, target_id, request_id, metadata
     ) VALUES ($1, $2, $3, 'user', $2::uuid::text, $4, $5::jsonb)`,
    [randomUUID(), userId, action, requestId, JSON.stringify(metadata)],
  );
}
