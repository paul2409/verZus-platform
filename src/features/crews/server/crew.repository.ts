import "server-only";

import { randomUUID } from "node:crypto";

import type { PoolClient } from "pg";

import { queryDatabase, withDatabaseTransaction } from "@/lib/db";

export interface CrewCoreRecord {
  id: string;
  name: string;
  tag: string;
  tagline: string;
  description: string;
  crestSrc: string;
  bannerSrc: string;
  verified: boolean;
  tier: string;
  primaryGame: string;
  region: string;
  visibility: "public" | "private";
  recruiting: boolean;
  language: string;
  minimumRank: string;
  communityLinkLabel: string;
  lifecycle: "forming" | "active" | "inactive" | "suspended" | "disbanded" | "archived";
  capacity: number;
  ownerUserId: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  memberCount: number;
  rank: number;
  previousRank: number;
  points: number;
  wins: number;
  losses: number;
  streak: number;
  trust: number;
}

interface CrewCoreRow {
  id: string;
  name: string;
  tag: string;
  tagline: string;
  description: string;
  crest_src: string;
  banner_src: string;
  verified: boolean;
  tier: string;
  primary_game: string;
  region: string;
  visibility: "public" | "private";
  recruiting: boolean;
  language: string;
  minimum_rank: string;
  community_link_label: string;
  lifecycle: CrewCoreRecord["lifecycle"];
  capacity: number;
  owner_user_id: string;
  version: number;
  created_at: Date;
  updated_at: Date;
  member_count: number;
  rank: number;
  previous_rank: number;
  points: number;
  wins: number;
  losses: number;
  streak: number;
  trust: number;
}

const crewProjection = `
  SELECT c.id,
         c.name,
         c.tag,
         c.tagline,
         c.description,
         c.crest_src,
         c.banner_src,
         c.verified,
         c.tier,
         c.primary_game,
         c.region,
         c.visibility,
         c.recruiting,
         c.language,
         c.minimum_rank,
         c.community_link_label,
         c.lifecycle,
         c.capacity,
         c.owner_user_id,
         c.version,
         c.created_at,
         c.updated_at,
         COUNT(cm.user_id) FILTER (WHERE cm.left_at IS NULL)::int AS member_count,
         COALESCE(cs.rank, 0)::int AS rank,
         COALESCE(cs.previous_rank, 0)::int AS previous_rank,
         COALESCE(cs.points, 0)::int AS points,
         COALESCE(cs.wins, 0)::int AS wins,
         COALESCE(cs.losses, 0)::int AS losses,
         COALESCE(cs.streak, 0)::int AS streak,
         COALESCE(cs.trust, 0)::int AS trust
    FROM crews c
    LEFT JOIN crew_members cm ON cm.crew_id = c.id
    LEFT JOIN crew_competitive_summaries cs ON cs.crew_id = c.id
`;

const crewGroupBy = `
   GROUP BY c.id, cs.rank, cs.previous_rank, cs.points, cs.wins, cs.losses, cs.streak, cs.trust
`;

function mapCrew(row: CrewCoreRow): CrewCoreRecord {
  return {
    id: row.id,
    name: row.name,
    tag: row.tag,
    tagline: row.tagline,
    description: row.description,
    crestSrc: row.crest_src,
    bannerSrc: row.banner_src,
    verified: row.verified,
    tier: row.tier,
    primaryGame: row.primary_game,
    region: row.region,
    visibility: row.visibility,
    recruiting: row.recruiting,
    language: row.language,
    minimumRank: row.minimum_rank,
    communityLinkLabel: row.community_link_label,
    lifecycle: row.lifecycle,
    capacity: row.capacity,
    ownerUserId: row.owner_user_id,
    version: row.version,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    memberCount: row.member_count,
    rank: row.rank,
    previousRank: row.previous_rank,
    points: row.points,
    wins: row.wins,
    losses: row.losses,
    streak: row.streak,
    trust: row.trust,
  };
}

export async function findCrewById(crewId: string): Promise<CrewCoreRecord | null> {
  const result = await queryDatabase<CrewCoreRow>(
    `${crewProjection}
      WHERE c.id = $1
      ${crewGroupBy}`,
    [crewId],
  );
  return result.rows[0] ? mapCrew(result.rows[0]) : null;
}

export async function findCurrentCrewForUser(userId: string): Promise<CrewCoreRecord | null> {
  const result = await queryDatabase<CrewCoreRow>(
    `${crewProjection}
      JOIN crew_members viewer_membership
        ON viewer_membership.crew_id = c.id
       AND viewer_membership.user_id = $1
       AND viewer_membership.left_at IS NULL
      ${crewGroupBy}
      LIMIT 1`,
    [userId],
  );
  return result.rows[0] ? mapCrew(result.rows[0]) : null;
}

export async function listDiscoverableCrews(userId: string): Promise<CrewCoreRecord[]> {
  const result = await queryDatabase<CrewCoreRow>(
    `${crewProjection}
      WHERE c.lifecycle NOT IN ('disbanded', 'archived')
        AND (
          c.visibility = 'public'
          OR EXISTS (
            SELECT 1
              FROM crew_members viewer
             WHERE viewer.crew_id = c.id
               AND viewer.user_id = $1
               AND viewer.left_at IS NULL
          )
        )
      ${crewGroupBy}
      ORDER BY c.verified DESC,
               CASE WHEN COALESCE(cs.rank, 0) = 0 THEN 1 ELSE 0 END,
               COALESCE(cs.rank, 0),
               c.created_at DESC`,
    [userId],
  );
  return result.rows.map(mapCrew);
}

export interface CrewMemberRecord {
  userId: string;
  displayName: string;
  handle: string;
  role: "owner" | "captain" | "manager" | "member" | "trial";
  contribution: number;
}

export async function listCrewMembers(crewId: string): Promise<CrewMemberRecord[]> {
  const result = await queryDatabase<{
    user_id: string;
    display_name: string;
    gamer_tag: string;
    role: CrewMemberRecord["role"];
    contribution: number;
  }>(
    `SELECT cm.user_id,
            COALESCE(NULLIF(pp.display_name, ''), u.gamer_tag) AS display_name,
            u.gamer_tag,
            cm.role,
            cm.contribution
       FROM crew_members cm
       JOIN users u ON u.id = cm.user_id
       LEFT JOIN player_profiles pp ON pp.user_id = cm.user_id
      WHERE cm.crew_id = $1
        AND cm.left_at IS NULL
      ORDER BY CASE cm.role
        WHEN 'owner' THEN 1
        WHEN 'captain' THEN 2
        WHEN 'manager' THEN 3
        WHEN 'member' THEN 4
        ELSE 5
      END, cm.joined_at`,
    [crewId],
  );
  return result.rows.map((row) => ({
    userId: row.user_id,
    displayName: row.display_name,
    handle: row.gamer_tag.startsWith("@") ? row.gamer_tag : `@${row.gamer_tag}`,
    role: row.role,
    contribution: row.contribution,
  }));
}

export async function getViewerCrewRole(
  crewId: string,
  userId: string,
): Promise<CrewMemberRecord["role"] | null> {
  const result = await queryDatabase<{ role: CrewMemberRecord["role"] }>(
    `SELECT role
       FROM crew_members
      WHERE crew_id = $1 AND user_id = $2 AND left_at IS NULL`,
    [crewId, userId],
  );
  return result.rows[0]?.role ?? null;
}

export interface CrewApplicationRecord {
  id: string;
  playerName: string;
  handle: string;
  game: string;
  trust: number;
  status: "pending" | "reviewing";
}

export async function listCrewApplications(
  crewId: string,
  viewerUserId: string,
): Promise<CrewApplicationRecord[]> {
  const role = await getViewerCrewRole(crewId, viewerUserId);
  if (!role || !["owner", "captain", "manager"].includes(role)) return [];

  const result = await queryDatabase<{
    id: string;
    display_name: string;
    gamer_tag: string;
    game: string;
    trust_score: number;
    status: string;
  }>(
    `SELECT ca.id,
            COALESCE(NULLIF(pp.display_name, ''), u.gamer_tag) AS display_name,
            u.gamer_tag,
            ca.game,
            COALESCE(pcs.trust_score, 0)::int AS trust_score,
            ca.status
       FROM crew_applications ca
       JOIN users u ON u.id = ca.user_id
       LEFT JOIN player_profiles pp ON pp.user_id = ca.user_id
       LEFT JOIN player_competitive_summaries pcs ON pcs.user_id = ca.user_id
      WHERE ca.crew_id = $1
        AND ca.status = 'pending'
      ORDER BY ca.created_at`,
    [crewId],
  );
  return result.rows.map((row) => ({
    id: row.id,
    playerName: row.display_name,
    handle: row.gamer_tag.startsWith("@") ? row.gamer_tag : `@${row.gamer_tag}`,
    game: row.game,
    trust: row.trust_score,
    status: row.status === "pending" ? "pending" : "reviewing",
  }));
}

export interface CrewEventRecord {
  id: string;
  title: string;
  game: string;
  scoreLabel: string | null;
  tone: "win" | "loss" | "neutral";
  createdAt: Date;
}

export async function listCrewEvents(crewId: string): Promise<CrewEventRecord[]> {
  const result = await queryDatabase<{
    id: string;
    title: string;
    game: string;
    score_label: string | null;
    tone: CrewEventRecord["tone"];
    created_at: Date;
  }>(
    `SELECT id, title, game, score_label, tone, created_at
       FROM crew_events
      WHERE crew_id = $1
      ORDER BY created_at DESC
      LIMIT 20`,
    [crewId],
  );
  return result.rows.map((row) => ({
    id: row.id,
    title: row.title,
    game: row.game,
    scoreLabel: row.score_label,
    tone: row.tone,
    createdAt: row.created_at,
  }));
}

export interface CrewAchievementRecord {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
}

export async function listCrewAchievements(crewId: string): Promise<CrewAchievementRecord[]> {
  const result = await queryDatabase<{
    id: string;
    name: string;
    description: string;
    unlocked_at: Date | null;
  }>(
    `SELECT id, name, description, unlocked_at
       FROM crew_achievements
      WHERE crew_id = $1
      ORDER BY created_at`,
    [crewId],
  );
  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    unlocked: row.unlocked_at !== null,
  }));
}

export interface CreateCrewInput {
  userId: string;
  idempotencyKey: string;
  name: string;
  tag: string;
  description: string;
  primaryGame: string;
  region: string;
  crestSrc: string;
  bannerSrc: string;
  visibility: "public" | "private";
  recruiting: boolean;
  language: string;
  minimumRank: string;
  requestId: string;
}

export class CrewRepositoryConflict extends Error {
  constructor(readonly field: "membership" | "name" | "tag") {
    super(`Crew ${field} conflict.`);
    this.name = "CrewRepositoryConflict";
  }
}

async function findReplay(
  client: Pick<PoolClient, "query">,
  userId: string,
  idempotencyKey: string,
): Promise<CrewCoreRecord | null> {
  const replay = await client.query<{ crew_id: string }>(
    `SELECT crew_id
       FROM crew_creation_commands
      WHERE user_id = $1 AND idempotency_key = $2`,
    [userId, idempotencyKey],
  );
  if (!replay.rows[0]) return null;
  return findCrewById(replay.rows[0].crew_id);
}

export async function createCrew(input: CreateCrewInput): Promise<CrewCoreRecord> {
  return withDatabaseTransaction(async (client) => {
    const replay = await findReplay(client, input.userId, input.idempotencyKey);
    if (replay) return replay;

    const existingMembership = await client.query(
      `SELECT 1
         FROM crew_members
        WHERE user_id = $1 AND left_at IS NULL
        LIMIT 1
        FOR UPDATE`,
      [input.userId],
    );
    if (existingMembership.rowCount) throw new CrewRepositoryConflict("membership");

    const crewId = randomUUID();
    try {
      await client.query(
        `INSERT INTO crews (
           id, name, normalized_name, tag, normalized_tag, description,
           crest_src, banner_src, primary_game, region, visibility,
           recruiting, language, minimum_rank, owner_user_id
         ) VALUES (
           $1, $2, $3, $4, $5, $6,
           $7, $8, $9, $10, $11,
           $12, $13, $14, $15
         )`,
        [
          crewId,
          input.name,
          input.name.toLocaleLowerCase("en"),
          input.tag,
          input.tag.toLocaleUpperCase("en"),
          input.description,
          input.crestSrc,
          input.bannerSrc,
          input.primaryGame,
          input.region,
          input.visibility,
          input.recruiting,
          input.language,
          input.minimumRank,
          input.userId,
        ],
      );
    } catch (error) {
      const code = (error as { code?: string; constraint?: string }).code;
      const constraint = (error as { constraint?: string }).constraint ?? "";
      if (code === "23505") {
        throw new CrewRepositoryConflict(constraint.includes("tag") ? "tag" : "name");
      }
      throw error;
    }

    await client.query(
      `INSERT INTO crew_members (crew_id, user_id, role)
       VALUES ($1, $2, 'owner')`,
      [crewId, input.userId],
    );
    await client.query(
      `INSERT INTO crew_competitive_summaries (crew_id)
       VALUES ($1)`,
      [crewId],
    );
    await client.query(
      `INSERT INTO crew_events (
         id, crew_id, actor_user_id, event_type, title, game, tone
       ) VALUES ($1, $2, $3, 'crew_created', 'Crew created', $4, 'neutral')`,
      [randomUUID(), crewId, input.userId, input.primaryGame],
    );
    await client.query(
      `INSERT INTO crew_creation_commands (user_id, idempotency_key, crew_id)
       VALUES ($1, $2, $3)`,
      [input.userId, input.idempotencyKey, crewId],
    );
    await client.query(
      `INSERT INTO audit_events (
         id, actor_user_id, action, target_type, target_id, request_id, metadata
       ) VALUES ($1, $2, 'crew.created', 'crew', $3, $4, $5::jsonb)`,
      [
        randomUUID(),
        input.userId,
        crewId,
        input.requestId,
        JSON.stringify({ name: input.name, tag: input.tag }),
      ],
    );

    const created = await client.query<CrewCoreRow>(
      `${crewProjection}
        WHERE c.id = $1
        ${crewGroupBy}`,
      [crewId],
    );
    const row = created.rows[0];
    if (!row) throw new Error("Crew creation committed without a readable Crew record.");
    return mapCrew(row);
  });
}
