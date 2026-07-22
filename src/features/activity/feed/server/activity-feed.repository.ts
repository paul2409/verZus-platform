import "server-only";

import { queryDatabase } from "@/lib/db";
import type { ActivityFeedItem } from "../model/activity-feed.types";

type ActivityRow = {
  id: string;
  domain: ActivityFeedItem["domain"];
  verb: string;
  title: string;
  description: string;
  actor_id: string;
  actor_kind: ActivityFeedItem["actor"]["kind"];
  actor_name: string;
  actor_handle: string | null;
  actor_initials: string;
  actor_artwork_url: string | null;
  actor_verified: boolean;
  occurred_at: Date;
  href: string;
  action_label: string;
  context_label: string;
  metric: string | null;
  tone: ActivityFeedItem["tone"];
  visibility: ActivityFeedItem["visibility"];
  personalization_reason: string;
};

function mapRow(row: ActivityRow): ActivityFeedItem {
  return {
    id: row.id,
    domain: row.domain,
    verb: row.verb,
    title: row.title,
    description: row.description,
    actor: {
      id: row.actor_id,
      kind: row.actor_kind,
      name: row.actor_name,
      handle: row.actor_handle,
      initials: row.actor_initials || "VZ",
      artworkUrl: row.actor_artwork_url,
      verified: row.actor_verified,
    },
    occurredAt: row.occurred_at.toISOString(),
    href: row.href,
    actionLabel: row.action_label,
    contextLabel: row.context_label,
    metric: row.metric,
    tone: row.tone,
    visibility: row.visibility,
    personalizationReason: row.personalization_reason,
  };
}

const ACTIVITY_SQL = `
WITH activity AS (
  SELECT
    'match-result:' || result.id::text AS id,
    'matches'::text AS domain,
    CASE
      WHEN participant.side = 'home' AND result.home_score > result.away_score THEN 'match_win'
      WHEN participant.side = 'away' AND result.away_score > result.home_score THEN 'match_win'
      WHEN result.home_score = result.away_score THEN 'match_draw'
      ELSE 'match_loss'
    END AS verb,
    CASE
      WHEN participant.side = 'home' AND result.home_score > result.away_score THEN 'You won ' || result.home_score || '-' || result.away_score
      WHEN participant.side = 'away' AND result.away_score > result.home_score THEN 'You won ' || result.away_score || '-' || result.home_score
      WHEN result.home_score = result.away_score THEN 'Match drawn ' || result.home_score || '-' || result.away_score
      ELSE 'Match result confirmed'
    END AS title,
    'The server-confirmed result now counts toward your competitive record.' AS description,
    profile.user_id::text AS actor_id,
    'player'::text AS actor_kind,
    profile.display_name AS actor_name,
    profile.handle AS actor_handle,
    UPPER(LEFT(REGEXP_REPLACE(profile.display_name, '[^A-Za-z0-9 ]', '', 'g'), 2)) AS actor_initials,
    profile.avatar_url AS actor_artwork_url,
    true AS actor_verified,
    COALESCE(result.confirmed_at, result.updated_at) AS occurred_at,
    '/matches/' || result.match_id AS href,
    'Open match' AS action_label,
    COALESCE(competition.name, match.round_label) AS context_label,
    result.home_score::text || '-' || result.away_score::text AS metric,
    CASE
      WHEN participant.side = 'home' AND result.home_score > result.away_score THEN 'green'
      WHEN participant.side = 'away' AND result.away_score > result.home_score THEN 'green'
      WHEN result.home_score = result.away_score THEN 'cyan'
      ELSE 'gold'
    END AS tone,
    'private'::text AS visibility,
    'Your confirmed match result' AS personalization_reason
  FROM match_results AS result
  JOIN matches AS match ON match.id = result.match_id
  JOIN match_participants AS participant ON participant.match_id = result.match_id
  JOIN player_profiles AS profile ON profile.user_id = participant.user_id
  LEFT JOIN competitions AS competition ON competition.id = match.competition_id
  WHERE participant.user_id = $1::uuid AND result.status = 'confirmed'

  UNION ALL

  SELECT
    'competition-entry:' || entry.id::text,
    'competitions',
    'competition_entry',
    CASE WHEN entry.state = 'waitlisted' THEN 'Competition waitlist confirmed' ELSE 'Competition entry confirmed' END,
    'Your registration is stored and will survive refreshes and redeployments.',
    'platform-competitions',
    'platform',
    'Competition Operations',
    NULL,
    'CO',
    NULL,
    true,
    entry.registered_at,
    '/compete/' || entry.competition_id,
    'Open competition',
    competition.name,
    UPPER(entry.state),
    'green',
    'private',
    'Your competition entry'
  FROM competition_entries AS entry
  JOIN competitions AS competition ON competition.id = entry.competition_id
  WHERE entry.user_id = $1::uuid AND entry.state IN ('confirmed', 'waitlisted')

  UNION ALL

  SELECT
    'crew-event:' || event.id::text,
    'crews',
    event.event_type,
    event.title,
    COALESCE(NULLIF(event.score_label, ''), 'Crew activity recorded.'),
    crew.id::text,
    'crew',
    crew.name,
    crew.tag,
    UPPER(LEFT(crew.tag, 4)),
    NULLIF(crew.crest_src, ''),
    crew.verified,
    event.created_at,
    '/crews/' || crew.id::text,
    'Open Crew',
    COALESCE(NULLIF(event.game, ''), crew.primary_game),
    event.score_label,
    CASE event.tone WHEN 'win' THEN 'green' WHEN 'loss' THEN 'gold' ELSE 'magenta' END,
    'crew',
    'Activity from your Crew'
  FROM crew_events AS event
  JOIN crews AS crew ON crew.id = event.crew_id
  JOIN crew_members AS membership ON membership.crew_id = crew.id
  WHERE membership.user_id = $1::uuid AND membership.left_at IS NULL

  UNION ALL

  SELECT
    'reward-event:' || event.id::text,
    'rewards',
    event.action,
    event.title,
    event.source_label || ' · ' || event.actor_label,
    'platform-rewards',
    'platform',
    'VERZUS Rewards',
    NULL,
    'RW',
    NULL,
    true,
    event.occurred_at,
    '/rewards',
    'Open rewards',
    event.source_label,
    event.amount_label,
    CASE WHEN event.action = 'reward_claimed' THEN 'green' ELSE 'gold' END,
    'private',
    'Your reward history'
  FROM reward_history_events AS event
  WHERE event.user_id = $1::uuid

  UNION ALL

  SELECT
    'ranking:' || summary.user_id::text || ':' || EXTRACT(EPOCH FROM summary.updated_at)::bigint::text,
    'rankings',
    'ranking_updated',
    CASE WHEN summary.weekly_rank > 0 THEN 'Weekly position updated' ELSE 'Competitive summary updated' END,
    'Your confirmed match results have been reflected in your competitive summary.',
    'platform-rankings',
    'platform',
    'VERZUS Rankings',
    NULL,
    'VR',
    NULL,
    true,
    summary.updated_at,
    '/leaderboards/weekly',
    'View standings',
    'Weekly leaderboard',
    CASE WHEN summary.weekly_rank > 0 THEN '#' || summary.weekly_rank::text ELSE NULL END,
    'cyan',
    'private',
    'Your ranking summary'
  FROM player_competitive_summaries AS summary
  WHERE summary.user_id = $1::uuid AND summary.matches > 0

  UNION ALL

  SELECT
    'profile:' || profile.user_id::text || ':' || EXTRACT(EPOCH FROM profile.updated_at)::bigint::text,
    'profile',
    'profile_updated',
    'Player profile updated',
    'Your public identity and privacy-aware player card were updated.',
    profile.user_id::text,
    'player',
    profile.display_name,
    profile.handle,
    UPPER(LEFT(REGEXP_REPLACE(profile.display_name, '[^A-Za-z0-9 ]', '', 'g'), 2)),
    profile.avatar_url,
    true,
    profile.updated_at,
    '/profile',
    'View profile',
    'Player identity',
    NULL,
    'violet',
    'private',
    'Your profile'
  FROM player_profiles AS profile
  WHERE profile.user_id = $1::uuid AND profile.updated_at > profile.created_at
)
SELECT
  id,
  domain,
  verb,
  title,
  description,
  actor_id,
  actor_kind,
  actor_name,
  actor_handle,
  actor_initials,
  actor_artwork_url,
  actor_verified,
  occurred_at,
  href,
  action_label,
  context_label,
  metric,
  tone,
  visibility,
  personalization_reason
FROM activity
WHERE ($2::text = 'all' OR domain = $2)
ORDER BY occurred_at DESC, id DESC
LIMIT 200
`;

export async function readViewerActivity(input: {
  userId: string;
  domain: string;
}): Promise<ActivityFeedItem[]> {
  const result = await queryDatabase<ActivityRow>(ACTIVITY_SQL, [input.userId, input.domain]);
  return result.rows.map(mapRow);
}
