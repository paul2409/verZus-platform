import "server-only";

import { randomUUID } from "node:crypto";

import type { PoolClient } from "pg";

import { queryDatabase } from "@/lib/db/client";
import { withDatabaseTransaction } from "@/lib/db/transaction";

export type CompetitionLifecycle =
  | "draft"
  | "scheduled"
  | "registration_open"
  | "registration_closed"
  | "check_in_open"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "archived";

export interface CompetitionRecord {
  id: string;
  game_id: string;
  game_name: string;
  game_short_name: string;
  game_filter_value: "ea-fc" | "cod-mobile" | "clash-royale" | "league-of-legends";
  art_key: "championship" | "ea-fc" | "cod-mobile" | "clash-royale" | "league-of-legends";
  name: string;
  description: string;
  eyebrow: string;
  lifecycle: CompetitionLifecycle;
  format_label: string;
  region_code: string | null;
  region_label: string;
  team_size: "1V1" | "4V4" | "5V5";
  capacity: number;
  entry_fee_amount: number;
  entry_fee_currency: string;
  prize_value: string;
  prize_currency: string;
  reward_note: string;
  reward_breakdown: unknown;
  rules_sections: unknown;
  tags: unknown;
  season_label: string;
  week_label: string;
  registration_opens_at: Date | null;
  registration_closes_at: Date | null;
  check_in_opens_at: Date | null;
  starts_at: Date;
  ends_at: Date | null;
  waitlist_enabled: boolean;
  minimum_trust_score: string;
  is_featured: boolean;
  version: number;
  published_at: Date;
  created_at: Date;
  updated_at: Date;
  registered_count: number;
  user_entered: boolean;
}

export interface CompetitionEntryRecord {
  id: string;
  competition_id: string;
  user_id: string;
  state: "confirmed" | "waitlisted" | "withdrawn" | "cancelled";
  idempotency_key: string;
  competition_version: number;
  registration_code: string;
  registered_at: Date;
  updated_at: Date;
  competition_name: string;
  game_name: string;
  format_label: string;
  team_size: "1V1" | "4V4" | "5V5";
  entry_fee_amount: number;
  entry_fee_currency: string;
  check_in_opens_at: Date | null;
  gamer_tag: string;
  display_name: string | null;
}

export interface CompetitionParticipantRecord {
  id: string;
  user_id: string;
  registered_at: Date;
  gamer_tag: string;
  display_name: string | null;
  handle: string | null;
  avatar_url: string | null;
}

export interface CompetitionViewerRecord {
  user_id: string;
  gamer_tag: string;
  display_name: string | null;
  country_code: string | null;
  trust_score: string;
  has_game_identity: boolean;
}

export interface CompetitionDiscoveryQuery {
  search: string;
  tab: "all" | "live" | "upcoming" | "entered" | "popular";
  game: "all" | "ea-fc" | "cod-mobile" | "clash-royale" | "league-of-legends";
  teamSize: "all" | "1V1" | "4V4" | "5V5";
  entryFee: "all" | "free" | "paid";
  sort: "starts-soon" | "popular" | "prize-high" | "availability";
  page: number;
  pageSize: number;
}

export interface CompetitionDiscoveryPage {
  items: CompetitionRecord[];
  page: number;
  pageCount: number;
  total: number;
}

interface CompetitionCountRow {
  total: number;
}

interface GameOptionRow {
  filter_value: "ea-fc" | "cod-mobile" | "clash-royale" | "league-of-legends";
  name: string;
}

interface EntryMutationResult {
  outcome: "created" | "duplicate" | "already_entered" | "not_found" | "stale" | "closed" | "full";
  competition: CompetitionRecord | null;
  entry: CompetitionEntryRecord | null;
}

const COMPETITION_SELECT = `
  SELECT
    c.id,
    c.game_id,
    g.name AS game_name,
    g.short_name AS game_short_name,
    g.filter_value AS game_filter_value,
    g.art_key,
    c.name,
    c.description,
    c.eyebrow,
    c.lifecycle,
    c.format_label,
    c.region_code,
    c.region_label,
    c.team_size,
    c.capacity,
    c.entry_fee_amount,
    c.entry_fee_currency,
    c.prize_value,
    c.prize_currency,
    c.reward_note,
    c.reward_breakdown,
    c.rules_sections,
    c.tags,
    c.season_label,
    c.week_label,
    c.registration_opens_at,
    c.registration_closes_at,
    c.check_in_opens_at,
    c.starts_at,
    c.ends_at,
    c.waitlist_enabled,
    c.minimum_trust_score,
    c.is_featured,
    c.version,
    c.published_at,
    c.created_at,
    c.updated_at,
    (
      SELECT COUNT(*)::integer
      FROM competition_entries entry_count
      WHERE entry_count.competition_id = c.id
        AND entry_count.state = 'confirmed'
    ) AS registered_count,
    EXISTS (
      SELECT 1
      FROM competition_entries own_entry
      WHERE own_entry.competition_id = c.id
        AND own_entry.user_id = $1
        AND own_entry.state IN ('confirmed', 'waitlisted')
    ) AS user_entered
  FROM competitions c
  JOIN games g ON g.id = c.game_id
`;

function addParameter(values: unknown[], value: unknown): string {
  values.push(value);
  return `$${values.length}`;
}

function discoveryWhere(query: CompetitionDiscoveryQuery, values: unknown[]): string[] {
  const clauses = ["c.published_at IS NOT NULL", "c.lifecycle <> 'archived'", "g.active = true"];

  if (query.search) {
    const parameter = addParameter(values, `%${query.search.toLocaleLowerCase("en")}%`);
    clauses.push(
      `LOWER(CONCAT_WS(' ', c.name, c.description, g.name, c.format_label, c.region_label, c.tags::text)) LIKE ${parameter}`,
    );
  }

  if (query.tab === "live") {
    clauses.push("c.lifecycle IN ('check_in_open', 'in_progress')");
  } else if (query.tab === "upcoming") {
    clauses.push("c.lifecycle IN ('scheduled', 'registration_open', 'registration_closed')");
  } else if (query.tab === "entered") {
    clauses.push(`EXISTS (
      SELECT 1 FROM competition_entries tab_entry
      WHERE tab_entry.competition_id = c.id
        AND tab_entry.user_id = $1
        AND tab_entry.state IN ('confirmed', 'waitlisted')
    )`);
  }

  if (query.game !== "all") {
    clauses.push(`g.filter_value = ${addParameter(values, query.game)}`);
  }

  if (query.teamSize !== "all") {
    clauses.push(`c.team_size = ${addParameter(values, query.teamSize)}`);
  }

  if (query.entryFee === "free") {
    clauses.push("c.entry_fee_amount = 0");
  } else if (query.entryFee === "paid") {
    clauses.push("c.entry_fee_amount > 0");
  }

  return clauses;
}

function discoveryOrder(query: CompetitionDiscoveryQuery): string {
  const registeredCount = `(
    SELECT COUNT(*)
    FROM competition_entries order_entry
    WHERE order_entry.competition_id = c.id
      AND order_entry.state = 'confirmed'
  )`;

  if (query.tab === "popular" || query.sort === "popular") {
    return `${registeredCount} DESC, c.starts_at ASC, c.id ASC`;
  }

  if (query.sort === "prize-high") {
    return "c.prize_value DESC, c.starts_at ASC, c.id ASC";
  }

  if (query.sort === "availability") {
    return `(c.capacity - ${registeredCount}) DESC, c.starts_at ASC, c.id ASC`;
  }

  return "c.starts_at ASC, c.id ASC";
}

export async function listCompetitionDiscovery(
  userId: string,
  query: CompetitionDiscoveryQuery,
): Promise<CompetitionDiscoveryPage> {
  const values: unknown[] = [userId];
  const where = discoveryWhere(query, values);
  const countResult = await queryDatabase<CompetitionCountRow>(
    `SELECT COUNT(*)::integer AS total
     FROM competitions c
     JOIN games g ON g.id = c.game_id
     WHERE $1::uuid IS NOT NULL
       AND ${where.join(" AND ")}`,
    values,
  );

  const total = countResult.rows[0]?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / query.pageSize));
  const page = Math.min(Math.max(query.page, 1), pageCount);
  const limitParameter = addParameter(values, query.pageSize);
  const offsetParameter = addParameter(values, (page - 1) * query.pageSize);

  const result = await queryDatabase<CompetitionRecord>(
    `${COMPETITION_SELECT}
     WHERE ${where.join(" AND ")}
     ORDER BY ${discoveryOrder(query)}
     LIMIT ${limitParameter}
     OFFSET ${offsetParameter}`,
    values,
  );

  return { items: result.rows, page, pageCount, total };
}

export async function findFeaturedCompetition(userId: string): Promise<CompetitionRecord | null> {
  const result = await queryDatabase<CompetitionRecord>(
    `${COMPETITION_SELECT}
     WHERE c.published_at IS NOT NULL
       AND c.lifecycle <> 'archived'
       AND g.active = true
     ORDER BY c.is_featured DESC, c.starts_at ASC, c.id ASC
     LIMIT 1`,
    [userId],
  );
  return result.rows[0] ?? null;
}

export async function findCompetitionById(
  userId: string,
  competitionId: string,
): Promise<CompetitionRecord | null> {
  const result = await queryDatabase<CompetitionRecord>(
    `${COMPETITION_SELECT}
     WHERE c.id = $2
       AND c.published_at IS NOT NULL
       AND c.lifecycle <> 'archived'
       AND g.active = true
     LIMIT 1`,
    [userId, competitionId],
  );
  return result.rows[0] ?? null;
}

export async function listCompetitionParticipants(
  competitionId: string,
): Promise<CompetitionParticipantRecord[]> {
  const result = await queryDatabase<CompetitionParticipantRecord>(
    `SELECT
       entry.id,
       entry.user_id,
       entry.registered_at,
       account.gamer_tag,
       profile.display_name,
       profile.handle,
       profile.avatar_url
     FROM competition_entries entry
     JOIN users account ON account.id = entry.user_id
     LEFT JOIN player_profiles profile ON profile.user_id = entry.user_id
     WHERE entry.competition_id = $1
       AND entry.state = 'confirmed'
     ORDER BY entry.registered_at ASC, entry.id ASC`,
    [competitionId],
  );
  return result.rows;
}

export async function findCompetitionViewer(
  userId: string,
  gameId: string,
): Promise<CompetitionViewerRecord | null> {
  const result = await queryDatabase<CompetitionViewerRecord>(
    `SELECT
       account.id AS user_id,
       account.gamer_tag,
       profile.display_name,
       profile.country_code,
       COALESCE(summary.trust_score, 0) AS trust_score,
       EXISTS (
         SELECT 1
         FROM player_game_identities identity
         WHERE identity.user_id = account.id
           AND identity.game_id = $2
       ) AS has_game_identity
     FROM users account
     LEFT JOIN player_profiles profile ON profile.user_id = account.id
     LEFT JOIN player_competitive_summaries summary ON summary.user_id = account.id
     WHERE account.id = $1
     LIMIT 1`,
    [userId, gameId],
  );
  return result.rows[0] ?? null;
}

export async function listActiveGameOptions(): Promise<GameOptionRow[]> {
  const result = await queryDatabase<GameOptionRow>(
    `SELECT filter_value, name
     FROM games
     WHERE active = true
     ORDER BY name ASC`,
  );
  return result.rows;
}

export async function findLatestCompetitionEntry(
  userId: string,
): Promise<CompetitionEntryRecord | null> {
  const result = await queryDatabase<CompetitionEntryRecord>(
    `SELECT
       entry.id,
       entry.competition_id,
       entry.user_id,
       entry.state,
       entry.idempotency_key,
       entry.competition_version,
       entry.registration_code,
       entry.registered_at,
       entry.updated_at,
       competition.name AS competition_name,
       game.name AS game_name,
       competition.format_label,
       competition.team_size,
       competition.entry_fee_amount,
       competition.entry_fee_currency,
       competition.check_in_opens_at,
       account.gamer_tag,
       profile.display_name
     FROM competition_entries entry
     JOIN competitions competition ON competition.id = entry.competition_id
     JOIN games game ON game.id = competition.game_id
     JOIN users account ON account.id = entry.user_id
     LEFT JOIN player_profiles profile ON profile.user_id = entry.user_id
     WHERE entry.user_id = $1
       AND entry.state IN ('confirmed', 'waitlisted')
     ORDER BY entry.registered_at DESC
     LIMIT 1`,
    [userId],
  );
  return result.rows[0] ?? null;
}

export async function findCompetitionEntry(
  userId: string,
  competitionId: string,
): Promise<CompetitionEntryRecord | null> {
  const result = await queryDatabase<CompetitionEntryRecord>(
    `SELECT
       entry.id,
       entry.competition_id,
       entry.user_id,
       entry.state,
       entry.idempotency_key,
       entry.competition_version,
       entry.registration_code,
       entry.registered_at,
       entry.updated_at,
       competition.name AS competition_name,
       game.name AS game_name,
       competition.format_label,
       competition.team_size,
       competition.entry_fee_amount,
       competition.entry_fee_currency,
       competition.check_in_opens_at,
       account.gamer_tag,
       profile.display_name
     FROM competition_entries entry
     JOIN competitions competition ON competition.id = entry.competition_id
     JOIN games game ON game.id = competition.game_id
     JOIN users account ON account.id = entry.user_id
     LEFT JOIN player_profiles profile ON profile.user_id = entry.user_id
     WHERE entry.user_id = $1
       AND entry.competition_id = $2
       AND entry.state IN ('confirmed', 'waitlisted')
     LIMIT 1`,
    [userId, competitionId],
  );
  return result.rows[0] ?? null;
}

async function findCompetitionForUpdate(
  client: PoolClient,
  userId: string,
  competitionId: string,
): Promise<CompetitionRecord | null> {
  const result = await client.query<CompetitionRecord>(
    `${COMPETITION_SELECT}
     WHERE c.id = $2
       AND c.published_at IS NOT NULL
       AND c.lifecycle <> 'archived'
       AND g.active = true
     FOR UPDATE OF c`,
    [userId, competitionId],
  );
  return result.rows[0] ?? null;
}

async function findEntryWithClient(
  client: PoolClient,
  userId: string,
  competitionId: string,
  idempotencyKey?: string,
): Promise<CompetitionEntryRecord | null> {
  const conditions = ["entry.user_id = $1", "entry.competition_id = $2"];
  const values: unknown[] = [userId, competitionId];
  if (idempotencyKey) {
    values.push(idempotencyKey);
    conditions.push(`entry.idempotency_key = $${values.length}`);
  }

  const result = await client.query<CompetitionEntryRecord>(
    `SELECT
       entry.id,
       entry.competition_id,
       entry.user_id,
       entry.state,
       entry.idempotency_key,
       entry.competition_version,
       entry.registration_code,
       entry.registered_at,
       entry.updated_at,
       competition.name AS competition_name,
       game.name AS game_name,
       competition.format_label,
       competition.team_size,
       competition.entry_fee_amount,
       competition.entry_fee_currency,
       competition.check_in_opens_at,
       account.gamer_tag,
       profile.display_name
     FROM competition_entries entry
     JOIN competitions competition ON competition.id = entry.competition_id
     JOIN games game ON game.id = competition.game_id
     JOIN users account ON account.id = entry.user_id
     LEFT JOIN player_profiles profile ON profile.user_id = entry.user_id
     WHERE ${conditions.join(" AND ")}
       AND entry.state IN ('confirmed', 'waitlisted')
     LIMIT 1`,
    values,
  );
  return result.rows[0] ?? null;
}

export async function createCompetitionEntry(input: {
  userId: string;
  competitionId: string;
  expectedVersion: number;
  idempotencyKey: string;
  registrationCode: string;
  requestId: string;
}): Promise<EntryMutationResult> {
  return withDatabaseTransaction(async (client) => {
    const duplicate = await findEntryWithClient(
      client,
      input.userId,
      input.competitionId,
      input.idempotencyKey,
    );
    if (duplicate) {
      return { outcome: "duplicate", competition: null, entry: duplicate };
    }

    const competition = await findCompetitionForUpdate(client, input.userId, input.competitionId);
    if (!competition) {
      return { outcome: "not_found", competition: null, entry: null };
    }

    const existing = await findEntryWithClient(client, input.userId, input.competitionId);
    if (existing) {
      return { outcome: "already_entered", competition, entry: existing };
    }

    if (competition.version !== input.expectedVersion) {
      return { outcome: "stale", competition, entry: null };
    }

    if (competition.lifecycle !== "registration_open") {
      return { outcome: "closed", competition, entry: null };
    }

    const countResult = await client.query<CompetitionCountRow>(
      `SELECT COUNT(*)::integer AS total
       FROM competition_entries
       WHERE competition_id = $1
         AND state = 'confirmed'`,
      [input.competitionId],
    );
    if ((countResult.rows[0]?.total ?? 0) >= competition.capacity) {
      return { outcome: "full", competition, entry: null };
    }

    const entryId = randomUUID();
    await client.query(
      `INSERT INTO competition_entries (
         id,
         competition_id,
         user_id,
         state,
         idempotency_key,
         competition_version,
         registration_code
       ) VALUES ($1, $2, $3, 'confirmed', $4, $5, $6)`,
      [
        entryId,
        input.competitionId,
        input.userId,
        input.idempotencyKey,
        input.expectedVersion,
        input.registrationCode,
      ],
    );

    await client.query(
      `INSERT INTO audit_events (
         id,
         actor_user_id,
         action,
         target_type,
         target_id,
         request_id,
         metadata
       ) VALUES ($1, $2, 'competition.entry.created', 'competition', $3, $4, $5::jsonb)`,
      [
        randomUUID(),
        input.userId,
        input.competitionId,
        input.requestId,
        JSON.stringify({ entryId, competitionVersion: input.expectedVersion }),
      ],
    );

    const entry = await findEntryWithClient(client, input.userId, input.competitionId);
    return { outcome: "created", competition, entry };
  });
}
