import "server-only";

import type { PoolClient, QueryResultRow } from "pg";

import { queryDatabase } from "@/lib/db";

export type RewardKind = "coins" | "xp" | "crate" | "cosmetic" | "boost";
export type RewardGrantState =
  | "locked"
  | "eligible"
  | "claimable"
  | "claiming"
  | "claimed"
  | "expired"
  | "revoked";

export interface RewardProgressRow extends QueryResultRow {
  current_level: number;
  current_xp: number;
  target_xp: number;
  inventory_version: string | number;
  season_id: string | null;
  current_season_xp: number;
  weekly_xp_earned: number;
}

export interface RewardGrantRow extends QueryResultRow {
  id: string;
  reward_id: string;
  title: string;
  description: string;
  kind: RewardKind;
  state: RewardGrantState;
  amount_label: string;
  artwork_src: string;
  artwork_alt: string;
  source_label: string;
  requirement_label: string;
  state_detail: string;
  expires_at: Date | string | null;
  claimed_at: Date | string | null;
  claim_reference: string | null;
  revoked_reason: string | null;
}

export interface RewardTrackRow extends QueryResultRow {
  id: string;
  title: string;
  description: string;
  kind: RewardKind;
  amount_label: string;
  artwork_src: string;
  artwork_alt: string;
  level_required: number;
}

export interface RewardHistoryRow extends QueryResultRow {
  id: string;
  grant_id: string | null;
  reward_id: string;
  title: string;
  kind: RewardKind;
  action: "reward_issued" | "reward_claimed" | "reward_expired" | "reward_revoked";
  amount_label: string;
  source_label: string;
  actor_label: string;
  event_reference: string;
  claim_reference: string | null;
  reason: string | null;
  inventory_version: string | number | null;
  occurred_at: Date | string;
}

export interface AchievementSummaryRow extends QueryResultRow {
  id: string;
  title: string;
  description: string;
  progress_target: number;
  progress_current: number;
  unlocked_at: Date | string | null;
  reward_id: string | null;
  artwork_src: string;
  artwork_alt: string;
  category_label: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  requirement_label: string;
}

export interface AchievementProvenanceRow extends QueryResultRow {
  source_type: "match" | "competition" | "crew" | "season";
  source_id: string;
  source_label: string;
  verified_at: Date | string;
}

export interface ActiveSeasonRow extends QueryResultRow {
  id: string;
  label: string;
  chapter_label: string;
  state: "upcoming" | "active" | "completed" | "ended";
  starts_at: Date | string;
  ends_at: Date | string;
  total_tiers: number;
  target_season_xp: number;
  weekly_xp_cap: number;
  boost_multiplier: string | number;
}

export interface SeasonObjectiveRow extends QueryResultRow {
  id: string;
  title: string;
  description: string;
  progress_target: number;
  xp_reward: number;
  progress_current: number;
  completed_at: Date | string | null;
}

export interface SeasonMilestoneRow extends QueryResultRow {
  id: string;
  tier: number;
  title: string;
  description: string;
  requirement_label: string;
  reward_id: string | null;
}

export async function ensureRewardProgress(
  userId: string,
  client?: Pick<PoolClient, "query">,
): Promise<RewardProgressRow> {
  const result = client
    ? await client.query<RewardProgressRow>(
    `INSERT INTO player_reward_progress (user_id)
     VALUES ($1)
     ON CONFLICT (user_id) DO UPDATE SET user_id = EXCLUDED.user_id
     RETURNING current_level, current_xp, target_xp, inventory_version,
               season_id, current_season_xp, weekly_xp_earned`,
        [userId],
      )
    : await queryDatabase<RewardProgressRow>(
        `INSERT INTO player_reward_progress (user_id)
         VALUES ($1)
         ON CONFLICT (user_id) DO UPDATE SET user_id = EXCLUDED.user_id
         RETURNING current_level, current_xp, target_xp, inventory_version,
                   season_id, current_season_xp, weekly_xp_earned`,
        [userId],
      );
  const row = result.rows[0];
  if (!row) throw new Error("REWARD_PROGRESS_NOT_AVAILABLE");
  return row;
}

export async function getRewardProgressForUpdate(
  client: PoolClient,
  userId: string,
): Promise<RewardProgressRow> {
  await ensureRewardProgress(userId, client);
  const result = await client.query<RewardProgressRow>(
    `SELECT current_level, current_xp, target_xp, inventory_version,
            season_id, current_season_xp, weekly_xp_earned
       FROM player_reward_progress
      WHERE user_id = $1
      FOR UPDATE`,
    [userId],
  );
  const row = result.rows[0];
  if (!row) throw new Error("REWARD_PROGRESS_NOT_AVAILABLE");
  return row;
}

export async function listRewardGrants(userId: string): Promise<RewardGrantRow[]> {
  const result = await queryDatabase<RewardGrantRow>(
    `SELECT g.id::text, g.reward_id, d.title, d.description, d.kind, g.state,
            d.amount_label, d.artwork_src, d.artwork_alt, d.source_label,
            d.requirement_label, d.state_detail, g.expires_at, g.claimed_at,
            g.claim_reference, g.revoked_reason
       FROM reward_grants g
       JOIN reward_definitions d ON d.id = g.reward_id
      WHERE g.user_id = $1
      ORDER BY g.created_at DESC, g.id DESC`,
    [userId],
  );
  return result.rows;
}

export async function listRewardTrack(): Promise<RewardTrackRow[]> {
  const result = await queryDatabase<RewardTrackRow>(
    `SELECT id, title, description, kind, amount_label, artwork_src, artwork_alt,
            level_required
       FROM reward_definitions
      WHERE active = true AND level_required IS NOT NULL
      ORDER BY level_required ASC, id ASC`,
  );
  return result.rows;
}

export async function listRewardHistory(userId: string): Promise<RewardHistoryRow[]> {
  const result = await queryDatabase<RewardHistoryRow>(
    `SELECT id::text, grant_id::text, reward_id, title, kind, action,
            amount_label, source_label, actor_label, event_reference,
            claim_reference, reason, inventory_version, occurred_at
       FROM reward_history_events
      WHERE user_id = $1
      ORDER BY occurred_at DESC, id DESC`,
    [userId],
  );
  return result.rows;
}

export async function listAchievementSummaries(userId: string): Promise<AchievementSummaryRow[]> {
  const result = await queryDatabase<AchievementSummaryRow>(
    `SELECT d.id, d.title, d.description, d.progress_target,
            LEAST(COALESCE(p.progress_current, 0), d.progress_target)::integer AS progress_current,
            p.unlocked_at, d.reward_id, d.artwork_src, d.artwork_alt,
            d.category_label, d.rarity, d.requirement_label
       FROM reward_achievement_definitions d
       LEFT JOIN player_achievements p
         ON p.achievement_id = d.id AND p.user_id = $1
      WHERE d.active = true
      ORDER BY p.unlocked_at DESC NULLS LAST, d.created_at ASC, d.id ASC`,
    [userId],
  );
  return result.rows;
}

export async function getAchievementSummary(
  userId: string,
  achievementId: string,
): Promise<AchievementSummaryRow | null> {
  const result = await queryDatabase<AchievementSummaryRow>(
    `SELECT d.id, d.title, d.description, d.progress_target,
            LEAST(COALESCE(p.progress_current, 0), d.progress_target)::integer AS progress_current,
            p.unlocked_at, d.reward_id, d.artwork_src, d.artwork_alt,
            d.category_label, d.rarity, d.requirement_label
       FROM reward_achievement_definitions d
       LEFT JOIN player_achievements p
         ON p.achievement_id = d.id AND p.user_id = $1
      WHERE d.id = $2 AND d.active = true`,
    [userId, achievementId],
  );
  return result.rows[0] ?? null;
}

export async function listAchievementProvenance(
  userId: string,
  achievementId: string,
): Promise<AchievementProvenanceRow[]> {
  const result = await queryDatabase<AchievementProvenanceRow>(
    `SELECT source_type, source_id, source_label, verified_at
       FROM reward_achievement_provenance
      WHERE user_id = $1 AND achievement_id = $2
      ORDER BY verified_at DESC, id DESC`,
    [userId, achievementId],
  );
  return result.rows;
}

export async function getActiveRewardSeason(): Promise<ActiveSeasonRow | null> {
  const result = await queryDatabase<ActiveSeasonRow>(
    `SELECT id, label, chapter_label, state, starts_at, ends_at, total_tiers,
            target_season_xp, weekly_xp_cap, boost_multiplier
       FROM reward_seasons
      WHERE state = 'active' AND starts_at <= now() AND ends_at > now()
      ORDER BY starts_at DESC
      LIMIT 1`,
  );
  return result.rows[0] ?? null;
}

export async function listSeasonObjectives(
  userId: string,
  seasonId: string,
): Promise<SeasonObjectiveRow[]> {
  const result = await queryDatabase<SeasonObjectiveRow>(
    `SELECT o.id, o.title, o.description, o.progress_target, o.xp_reward,
            LEAST(COALESCE(p.progress_current, 0), o.progress_target)::integer AS progress_current,
            p.completed_at
       FROM reward_season_objectives o
       LEFT JOIN player_reward_objective_progress p
         ON p.objective_id = o.id AND p.user_id = $1
      WHERE o.season_id = $2 AND o.active = true
      ORDER BY o.sort_order ASC, o.id ASC`,
    [userId, seasonId],
  );
  return result.rows;
}

export async function listSeasonMilestones(seasonId: string): Promise<SeasonMilestoneRow[]> {
  const result = await queryDatabase<SeasonMilestoneRow>(
    `SELECT id, tier, title, description, requirement_label, reward_id
       FROM reward_season_milestones
      WHERE season_id = $1
      ORDER BY tier ASC, id ASC`,
    [seasonId],
  );
  return result.rows;
}
