import "server-only";

import { createHash, randomUUID } from "node:crypto";

import type { PoolClient, QueryResultRow } from "pg";

import { withDatabaseTransaction } from "@/lib/db";

import {
  ensureRewardProgress,
  getAchievementSummary,
  getActiveRewardSeason,
  getRewardProgressForUpdate,
  listAchievementProvenance,
  listAchievementSummaries,
  listRewardGrants,
  listRewardHistory,
  listRewardTrack,
  listSeasonMilestones,
  listSeasonObjectives,
  type RewardGrantRow,
  type RewardHistoryRow,
} from "./reward.repository";

export type RewardResourceName = "progress" | "season" | "inventory" | "history" | "achievements";

export class RewardServiceError extends Error {
  readonly code: string;
  readonly status: number;
  readonly retryable: boolean;
  readonly fieldErrors: Record<string, string[]> | undefined;

  constructor(input: {
    code: string;
    message: string;
    status: number;
    retryable: boolean;
    fieldErrors?: Record<string, string[]>;
  }) {
    super(input.message);
    this.name = "RewardServiceError";
    this.code = input.code;
    this.status = input.status;
    this.retryable = input.retryable;
    this.fieldErrors = input.fieldErrors;
  }
}

function toIso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function compactDateLabel(value: Date | string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(new Date(value));
}

function inventoryVersion(value: string | number): number {
  return typeof value === "number" ? value : Number.parseInt(value, 10);
}

function serializeGrant(row: RewardGrantRow) {
  const expiresAt = row.expires_at ? new Date(row.expires_at) : null;
  const claimedAt = row.claimed_at ? new Date(row.claimed_at) : null;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    kind: row.kind,
    state: row.state,
    amount_label: row.amount_label,
    artwork_src: row.artwork_src,
    artwork_alt: row.artwork_alt,
    source_label: row.source_label,
    requirement_label: row.requirement_label,
    availability_label:
      row.state === "claimed"
        ? "Added to inventory"
        : row.state === "claimable"
          ? "Ready to claim"
          : row.state === "expired"
            ? "Expired"
            : row.state === "revoked"
              ? "Revoked"
              : "Not yet claimable",
    state_detail: row.state_detail,
    ...(row.claim_reference ? { claim_reference: row.claim_reference } : {}),
    ...(claimedAt ? { claimed_at_label: compactDateLabel(claimedAt) } : {}),
    ...(expiresAt ? { expires_at_label: compactDateLabel(expiresAt) } : {}),
    ...(row.revoked_reason ? { revoked_reason: row.revoked_reason } : {}),
  };
}

function serializeSummaryGrant(row: RewardGrantRow) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    kind: row.kind,
    state: row.state,
    amount_label: row.amount_label,
    artwork_src: row.artwork_src,
    artwork_alt: row.artwork_alt,
  };
}

function historySummary(row: RewardHistoryRow) {
  return {
    id: row.id,
    title: row.title,
    description: row.action === "reward_claimed" ? "Confirmed reward claim" : row.action,
    kind: row.kind,
    state: "claimed" as const,
    amount_label: row.amount_label,
    artwork_src: "/rewards/reward-crate.svg",
    artwork_alt: `${row.title} reward`,
    source_label: row.source_label,
    claimed_at_label: compactDateLabel(row.occurred_at),
  };
}

export async function getRewardResource(userId: string, resource: RewardResourceName) {
  const progress = await ensureRewardProgress(userId);

  switch (resource) {
    case "inventory": {
      const grants = await listRewardGrants(userId);
      return {
        version: inventoryVersion(progress.inventory_version),
        items: grants.map(serializeGrant),
      };
    }
    case "history": {
      const history = await listRewardHistory(userId);
      return {
        items: history.filter((item) => item.action === "reward_claimed").map(historySummary),
      };
    }
    case "achievements": {
      const achievements = await listAchievementSummaries(userId);
      return {
        items: achievements.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          state: item.unlocked_at
            ? "unlocked"
            : item.progress_current > 0
              ? "in_progress"
              : "locked",
          progress_current: item.progress_current,
          progress_target: item.progress_target,
          reward_id: item.reward_id,
          artwork_src: item.artwork_src,
          artwork_alt: item.artwork_alt,
        })),
      };
    }
    case "season": {
      const season = await getActiveRewardSeason();
      if (!season) return { season: null };

      const [objectives, milestones] = await Promise.all([
        listSeasonObjectives(userId, season.id),
        listSeasonMilestones(season.id),
      ]);
      const currentTier = Math.min(
        season.total_tiers,
        Math.floor((progress.current_season_xp / season.target_season_xp) * season.total_tiers),
      );
      const daysRemaining = Math.max(
        0,
        Math.ceil((new Date(season.ends_at).getTime() - Date.now()) / 86_400_000),
      );

      return {
        season: {
          season_id: season.id,
          label: season.label,
          chapter_label: season.chapter_label,
          state: season.state,
          starts_at: toIso(season.starts_at),
          ends_at: toIso(season.ends_at),
          days_remaining: daysRemaining,
          current_tier: currentTier,
          total_tiers: season.total_tiers,
          current_season_xp: progress.current_season_xp,
          target_season_xp: season.target_season_xp,
          weekly_xp_earned: progress.weekly_xp_earned,
          weekly_xp_cap: season.weekly_xp_cap,
          boost_multiplier: Number(season.boost_multiplier),
          objectives: objectives.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            progress_current: item.progress_current,
            progress_target: item.progress_target,
            xp_reward: item.xp_reward,
            completed: item.completed_at !== null || item.progress_current >= item.progress_target,
          })),
          milestones: milestones.map((item) => ({
            id: item.id,
            tier: item.tier,
            title: item.title,
            description: item.description,
            state:
              item.tier < currentTier
                ? "completed"
                : item.tier === currentTier
                  ? "current"
                  : item.tier === currentTier + 1
                    ? "upcoming"
                    : "locked",
            requirement_label: item.requirement_label,
            reward_id: item.reward_id,
          })),
        },
      };
    }
    case "progress": {
      const [grants, track, season] = await Promise.all([
        listRewardGrants(userId),
        listRewardTrack(),
        getActiveRewardSeason(),
      ]);
      return {
        progress: {
          current_level: progress.current_level,
          next_level: progress.current_level + 1,
          current_xp: progress.current_xp,
          target_xp: progress.target_xp,
          remaining_xp: Math.max(0, progress.target_xp - progress.current_xp),
          season_label: season?.label ?? "No active season",
        },
        claimable_rewards: grants
          .filter((item) => item.state === "claimable")
          .map(serializeSummaryGrant),
        track: track.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          kind: item.kind,
          state:
            progress.current_level >= item.level_required
              ? "eligible"
              : ("locked" as "eligible" | "locked"),
          amount_label: item.amount_label,
          artwork_src: item.artwork_src,
          artwork_alt: item.artwork_alt,
          level: item.level_required,
        })),
      };
    }
  }
}

export async function getRewardAchievementDetail(userId: string, achievementId: string) {
  const achievement = await getAchievementSummary(userId, achievementId);
  if (!achievement) return null;
  const provenance = await listAchievementProvenance(userId, achievementId);

  return {
    id: achievement.id,
    title: achievement.title,
    description: achievement.description,
    state: achievement.unlocked_at
      ? "unlocked"
      : achievement.progress_current > 0
        ? "in_progress"
        : "locked",
    progress_current: achievement.progress_current,
    progress_target: achievement.progress_target,
    reward_id: achievement.reward_id,
    artwork_src: achievement.artwork_src,
    artwork_alt: achievement.artwork_alt,
    category_label: achievement.category_label,
    rarity: achievement.rarity,
    requirement_label: achievement.requirement_label,
    unlocked_at: achievement.unlocked_at ? toIso(achievement.unlocked_at) : null,
    unlocked_at_label: achievement.unlocked_at ? compactDateLabel(achievement.unlocked_at) : null,
    linked_reward: null,
    provenance: provenance.map((item) => ({
      source_type: item.source_type,
      source_id: item.source_id,
      source_label: item.source_label,
      verified_at: toIso(item.verified_at),
      verified_at_label: compactDateLabel(item.verified_at),
    })),
  };
}

export async function getRewardHistoryPage(
  userId: string,
  input: { page: number; pageSize: number },
) {
  const history = await listRewardHistory(userId);
  const total = history.length;
  const totalPages = Math.max(1, Math.ceil(total / input.pageSize));
  const page = Math.min(Math.max(1, input.page), totalPages);
  const start = (page - 1) * input.pageSize;

  return {
    items: history.slice(start, start + input.pageSize).map((item) => ({
      id: item.id,
      reward_id: item.reward_id,
      title: item.title,
      kind: item.kind,
      action: item.action,
      status_label:
        item.action === "reward_claimed"
          ? "Claimed"
          : item.action === "reward_issued"
            ? "Issued"
            : item.action === "reward_expired"
              ? "Expired"
              : "Revoked",
      amount_label: item.amount_label,
      source_label: item.source_label,
      occurred_at: toIso(item.occurred_at),
      occurred_at_label: compactDateLabel(item.occurred_at),
      actor_label: item.actor_label,
      event_reference: item.event_reference,
      claim_reference: item.claim_reference,
      reason: item.reason,
      inventory_version:
        item.inventory_version === null ? null : inventoryVersion(item.inventory_version),
    })),
    page,
    page_size: input.pageSize,
    total,
    total_pages: totalPages,
  };
}

interface StoredClaimRow extends QueryResultRow {
  fingerprint: string;
  result: Record<string, unknown>;
}

interface ClaimGrantRow extends RewardGrantRow {
  user_id: string;
}

function claimFingerprint(input: { userId: string; rewardId: string; expectedVersion: number }) {
  return createHash("sha256").update(JSON.stringify(input)).digest("hex");
}

async function loadStoredClaim(
  client: PoolClient,
  userId: string,
  idempotencyKey: string,
): Promise<StoredClaimRow | null> {
  const result = await client.query<StoredClaimRow>(
    `SELECT fingerprint, result
       FROM reward_claim_commands
      WHERE user_id = $1 AND idempotency_key = $2`,
    [userId, idempotencyKey],
  );
  return result.rows[0] ?? null;
}

export async function claimReward(input: {
  userId: string;
  rewardId: string;
  expectedVersion: number;
  idempotencyKey: string;
  requestId: string;
}) {
  const fingerprint = claimFingerprint({
    userId: input.userId,
    rewardId: input.rewardId,
    expectedVersion: input.expectedVersion,
  });

  return withDatabaseTransaction(async (client) => {
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [
      `${input.userId}:${input.idempotencyKey}`,
    ]);

    const stored = await loadStoredClaim(client, input.userId, input.idempotencyKey);
    if (stored) {
      if (stored.fingerprint !== fingerprint) {
        throw new RewardServiceError({
          code: "REWARD_IDEMPOTENCY_KEY_REUSED",
          message: "This idempotency key was already used for a different claim command.",
          status: 409,
          retryable: false,
        });
      }
      return { ...stored.result, replayed: true };
    }

    const progress = await getRewardProgressForUpdate(client, input.userId);
    const currentVersion = inventoryVersion(progress.inventory_version);
    if (currentVersion !== input.expectedVersion) {
      throw new RewardServiceError({
        code: "REWARD_INVENTORY_STALE_VERSION",
        message: "Reward inventory changed. Refresh before starting a new claim.",
        status: 409,
        retryable: true,
      });
    }

    const grantResult = await client.query<ClaimGrantRow>(
      `SELECT g.user_id::text, g.id::text, g.reward_id, d.title, d.description, d.kind,
              g.state, d.amount_label, d.artwork_src, d.artwork_alt, d.source_label,
              d.requirement_label, d.state_detail, g.expires_at, g.claimed_at,
              g.claim_reference, g.revoked_reason
         FROM reward_grants g
         JOIN reward_definitions d ON d.id = g.reward_id
        WHERE g.id::text = $1
        FOR UPDATE`,
      [input.rewardId],
    );
    const grant = grantResult.rows[0];
    if (!grant || grant.user_id !== input.userId) {
      throw new RewardServiceError({
        code: "REWARD_NOT_FOUND",
        message: "This reward does not exist or is no longer visible.",
        status: 404,
        retryable: false,
      });
    }
    if (grant.state === "claimed") {
      throw new RewardServiceError({
        code: "REWARD_ALREADY_CLAIMED",
        message: "This reward has already been claimed.",
        status: 409,
        retryable: false,
      });
    }
    if (grant.state !== "claimable") {
      throw new RewardServiceError({
        code: "REWARD_NOT_CLAIMABLE",
        message: "This reward is not currently claimable.",
        status: 409,
        retryable: grant.state === "claiming",
      });
    }
    if (grant.expires_at && new Date(grant.expires_at).getTime() <= Date.now()) {
      throw new RewardServiceError({
        code: "REWARD_EXPIRED_NOT_CLAIMABLE",
        message: "This reward expired before it could be claimed.",
        status: 409,
        retryable: false,
      });
    }

    const claimId = randomUUID();
    const claimReference = `CLM-${new Date().getUTCFullYear()}-${claimId.slice(0, 8).toUpperCase()}`;
    const eventReference = `RWD-EVT-${claimId.slice(0, 12).toUpperCase()}`;
    const claimedAt = new Date().toISOString();
    const nextVersion = currentVersion + 1;

    await client.query(
      `UPDATE reward_grants
          SET state = 'claimed', claimed_at = $2, claim_reference = $3, updated_at = now()
        WHERE id::text = $1`,
      [grant.id, claimedAt, claimReference],
    );
    await client.query(
      `UPDATE player_reward_progress
          SET inventory_version = $2, updated_at = now()
        WHERE user_id = $1`,
      [input.userId, nextVersion],
    );

    const historyResult = await client.query<{ id: string } & QueryResultRow>(
      `INSERT INTO reward_history_events (
         user_id, grant_id, reward_id, title, kind, action, amount_label,
         source_label, actor_label, event_reference, claim_reference,
         inventory_version, occurred_at
       ) VALUES ($1, $2::uuid, $3, $4, $5, 'reward_claimed', $6, $7,
                 'Authenticated player', $8, $9, $10, $11)
       RETURNING id::text`,
      [
        input.userId,
        grant.id,
        grant.reward_id,
        grant.title,
        grant.kind,
        grant.amount_label,
        grant.source_label,
        eventReference,
        claimReference,
        nextVersion,
        claimedAt,
      ],
    );
    const historyId = historyResult.rows[0]?.id ?? randomUUID();

    const idempotencyHash = createHash("sha256").update(input.idempotencyKey).digest("hex").slice(0, 16);
    const serializedReward = serializeGrant({
      ...grant,
      state: "claimed",
      claimed_at: claimedAt,
      claim_reference: claimReference,
    });
    const result = {
      claim_id: claimId,
      claim_reference: claimReference,
      reward_id: grant.id,
      inventory_version: nextVersion,
      claimed_at: claimedAt,
      replayed: false,
      reward: serializedReward,
      history_item: {
        id: historyId,
        title: grant.title,
        description: "Confirmed reward claim",
        kind: grant.kind,
        state: "claimed",
        amount_label: grant.amount_label,
        artwork_src: grant.artwork_src,
        artwork_alt: grant.artwork_alt,
        source_label: grant.source_label,
        claimed_at_label: compactDateLabel(claimedAt),
      },
      audit_event: {
        id: historyId,
        player_id: input.userId,
        reward_id: grant.id,
        action: "reward_claimed",
        claim_reference: claimReference,
        idempotency_key_hash: idempotencyHash,
        created_at: claimedAt,
      },
    };

    await client.query(
      `INSERT INTO reward_claim_commands (
         user_id, idempotency_key, fingerprint, request_id, result
       ) VALUES ($1, $2, $3, $4, $5::jsonb)`,
      [input.userId, input.idempotencyKey, fingerprint, input.requestId, JSON.stringify(result)],
    );
    await client.query(
      `INSERT INTO audit_events (
         actor_user_id, action, target_type, target_id, reason, request_id, metadata
       ) VALUES ($1, 'reward_claimed', 'reward_grant', $2, NULL, $3, $4::jsonb)`,
      [
        input.userId,
        grant.id,
        input.requestId,
        JSON.stringify({ claimReference, inventoryVersion: nextVersion }),
      ],
    );

    return result;
  });
}
