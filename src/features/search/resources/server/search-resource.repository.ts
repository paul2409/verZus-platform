import "server-only";

import { queryDatabase } from "@/lib/db";
import type { SearchEntityDomain, SearchFoundationItem } from "../../foundation";

type SearchRow = {
  id: string;
  title: string;
  subtitle: string;
  supporting_text: string;
  meta: string;
  badge: string;
  href: string;
  image_src: string | null;
  image_alt: string;
  initials: string;
  tone: SearchFoundationItem["tone"];
  search_terms: string[];
};

const PLAYER_SQL = `
  SELECT
    profile.user_id::text AS id,
    profile.display_name AS title,
    profile.handle AS subtitle,
    COALESCE(NULLIF(profile.title, ''), 'VERZUS player') AS supporting_text,
    COALESCE(NULLIF(profile.location_label, ''), 'Location not shared') AS meta,
    CASE
      WHEN COALESCE(summary.trust_score, 0) >= 80 THEN 'VERIFIED'
      WHEN COALESCE(summary.matches, 0) > 0 THEN 'PLAYER'
      ELSE 'NEW'
    END AS badge,
    '/players/' || profile.user_id::text AS href,
    profile.avatar_url AS image_src,
    profile.display_name AS image_alt,
    UPPER(LEFT(REGEXP_REPLACE(profile.display_name, '[^A-Za-z0-9 ]', '', 'g'), 2)) AS initials,
    'cyan'::text AS tone,
    ARRAY_REMOVE(ARRAY[
      profile.display_name,
      profile.handle,
      profile.title,
      profile.location_label
    ], NULL) AS search_terms
  FROM player_profiles AS profile
  LEFT JOIN player_competitive_summaries AS summary ON summary.user_id = profile.user_id
  WHERE
    (profile.profile_visibility = 'public' OR profile.user_id = $2::uuid)
    AND (
      profile.display_name ILIKE $1
      OR profile.handle ILIKE $1
      OR profile.title ILIKE $1
      OR profile.location_label ILIKE $1
    )
  ORDER BY
    CASE WHEN LOWER(profile.handle) = LOWER($3) THEN 0 ELSE 1 END,
    profile.display_name,
    profile.user_id
  LIMIT $4
`;

const CREW_SQL = `
  SELECT
    crew.id::text AS id,
    crew.name AS title,
    crew.tag AS subtitle,
    COALESCE(NULLIF(crew.tagline, ''), NULLIF(crew.description, ''), 'VERZUS Crew') AS supporting_text,
    crew.region || ' · ' || crew.primary_game AS meta,
    CASE WHEN crew.recruiting THEN 'RECRUITING' ELSE UPPER(crew.tier) END AS badge,
    '/crews/' || crew.id::text AS href,
    NULLIF(crew.crest_src, '') AS image_src,
    crew.name || ' crest' AS image_alt,
    UPPER(LEFT(REGEXP_REPLACE(crew.tag, '[^A-Za-z0-9]', '', 'g'), 4)) AS initials,
    'magenta'::text AS tone,
    ARRAY_REMOVE(ARRAY[
      crew.name,
      crew.tag,
      crew.tagline,
      crew.description,
      crew.primary_game,
      crew.region
    ], NULL) AS search_terms
  FROM crews AS crew
  WHERE
    crew.visibility = 'public'
    AND crew.lifecycle NOT IN ('disbanded', 'archived')
    AND (
      crew.name ILIKE $1
      OR crew.tag ILIKE $1
      OR crew.tagline ILIKE $1
      OR crew.description ILIKE $1
      OR crew.primary_game ILIKE $1
      OR crew.region ILIKE $1
    )
  ORDER BY
    CASE WHEN LOWER(crew.tag) = LOWER($3) THEN 0 ELSE 1 END,
    crew.verified DESC,
    crew.name,
    crew.id
  LIMIT $4
`;

const COMPETITION_SQL = `
  SELECT
    competition.id AS id,
    competition.name AS title,
    game.name || ' · ' || competition.format_label AS subtitle,
    competition.description AS supporting_text,
    competition.region_label || ' · ' || competition.week_label AS meta,
    UPPER(REPLACE(competition.lifecycle, '_', ' ')) AS badge,
    '/compete/' || competition.id AS href,
    NULL::text AS image_src,
    competition.name AS image_alt,
    UPPER(LEFT(REGEXP_REPLACE(competition.name, '[^A-Za-z0-9 ]', '', 'g'), 2)) AS initials,
    'green'::text AS tone,
    ARRAY_REMOVE(ARRAY[
      competition.name,
      competition.description,
      competition.format_label,
      competition.region_label,
      competition.season_label,
      competition.week_label,
      game.name,
      game.short_name
    ], NULL) AS search_terms
  FROM competitions AS competition
  JOIN games AS game ON game.id = competition.game_id
  WHERE
    competition.published_at IS NOT NULL
    AND competition.lifecycle NOT IN ('draft', 'archived')
    AND (
      competition.name ILIKE $1
      OR competition.description ILIKE $1
      OR competition.format_label ILIKE $1
      OR competition.region_label ILIKE $1
      OR competition.season_label ILIKE $1
      OR competition.week_label ILIKE $1
      OR game.name ILIKE $1
      OR game.short_name ILIKE $1
    )
  ORDER BY competition.is_featured DESC, competition.starts_at, competition.id
  LIMIT $4
`;

const MATCH_SQL = `
  SELECT
    match.id AS id,
    'Match vs ' || COALESCE(opponent_profile.handle, opponent_profile.display_name, 'Opponent') AS title,
    game.name || ' · ' || match.format_label AS subtitle,
    COALESCE(competition.name, match.round_label) AS supporting_text,
    TO_CHAR(match.scheduled_at AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI UTC') AS meta,
    UPPER(REPLACE(match.state, '-', ' ')) AS badge,
    '/matches/' || match.id AS href,
    opponent_profile.avatar_url AS image_src,
    COALESCE(opponent_profile.display_name, 'Opponent') AS image_alt,
    UPPER(LEFT(REGEXP_REPLACE(COALESCE(opponent_profile.display_name, 'OP'), '[^A-Za-z0-9 ]', '', 'g'), 2)) AS initials,
    'gold'::text AS tone,
    ARRAY_REMOVE(ARRAY[
      match.id,
      match.round_label,
      match.format_label,
      match.state,
      game.name,
      competition.name,
      opponent_profile.display_name,
      opponent_profile.handle
    ], NULL) AS search_terms
  FROM match_participants AS viewer_participant
  JOIN matches AS match ON match.id = viewer_participant.match_id
  JOIN games AS game ON game.id = match.game_id
  LEFT JOIN competitions AS competition ON competition.id = match.competition_id
  LEFT JOIN match_participants AS opponent_participant
    ON opponent_participant.match_id = match.id
   AND opponent_participant.user_id <> viewer_participant.user_id
  LEFT JOIN player_profiles AS opponent_profile ON opponent_profile.user_id = opponent_participant.user_id
  WHERE
    viewer_participant.user_id = $2::uuid
    AND (
      match.id ILIKE $1
      OR match.round_label ILIKE $1
      OR match.format_label ILIKE $1
      OR match.state ILIKE $1
      OR game.name ILIKE $1
      OR competition.name ILIKE $1
      OR opponent_profile.display_name ILIKE $1
      OR opponent_profile.handle ILIKE $1
    )
  ORDER BY match.scheduled_at DESC, match.id
  LIMIT $4
`;

function normalizeRow(domain: SearchEntityDomain, row: SearchRow): SearchFoundationItem {
  return {
    id: row.id,
    domain,
    title: row.title,
    subtitle: row.subtitle,
    supportingText: row.supporting_text,
    meta: row.meta,
    badge: row.badge,
    href: row.href,
    imageSrc: row.image_src,
    imageAlt: row.image_alt,
    initials: row.initials || "VZ",
    tone: row.tone,
    searchTerms: row.search_terms,
  };
}

export async function searchProductionDomain(input: {
  domain: SearchEntityDomain;
  query: string;
  limit: number;
  viewerUserId: string;
}): Promise<SearchFoundationItem[]> {
  if (input.query.length < 2) return [];

  const pattern = `%${input.query.replaceAll("%", "\\%").replaceAll("_", "\\_")}%`;
  const exact = input.query.startsWith("@") ? input.query : `@${input.query}`;
  const sql = {
    players: PLAYER_SQL,
    crews: CREW_SQL,
    competitions: COMPETITION_SQL,
    matches: MATCH_SQL,
  }[input.domain];

  const result = await queryDatabase<SearchRow>(sql, [pattern, input.viewerUserId, exact, input.limit]);
  return result.rows.map((row) => normalizeRow(input.domain, row));
}
