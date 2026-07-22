import "server-only";

import { queryDatabase } from "@/lib/db";

type PlayerStatusRow = {
  player_id: string;
  handle: string;
  display_name: string;
  avatar_url: string | null;
  primary_game: string;
  game_lane: string;
  location_label: string;
  trust_score: number;
  unread_notifications: number;
  last_updated_at: Date;
};

export async function readPlayPlayerStatus(userId: string): Promise<PlayerStatusRow | null> {
  const result = await queryDatabase<PlayerStatusRow>(
    `SELECT
       profile.user_id::text AS player_id,
       profile.handle,
       profile.display_name,
       profile.avatar_url,
       COALESCE(game.name, identity.game_id, 'No game selected') AS primary_game,
       COALESCE(UPPER(identity.platform), 'NO PLATFORM') AS game_lane,
       COALESCE(NULLIF(profile.location_label, ''), 'Location not set') AS location_label,
       ROUND(COALESCE(summary.trust_score, 0))::int AS trust_score,
       (
         SELECT COUNT(*)::int
           FROM notifications
          WHERE user_id = profile.user_id
            AND state = 'unread'
            AND (expires_at IS NULL OR expires_at > now())
       ) AS unread_notifications,
       GREATEST(
         profile.updated_at,
         COALESCE(summary.updated_at, profile.updated_at),
         COALESCE(identity.updated_at, profile.updated_at)
       ) AS last_updated_at
     FROM player_profiles AS profile
     LEFT JOIN player_competitive_summaries AS summary ON summary.user_id = profile.user_id
     LEFT JOIN LATERAL (
       SELECT *
         FROM player_game_identities
        WHERE user_id = profile.user_id
        ORDER BY is_primary DESC, created_at ASC
        LIMIT 1
     ) AS identity ON true
     LEFT JOIN games AS game ON game.id = identity.game_id
     WHERE profile.user_id = $1::uuid`,
    [userId],
  );
  return result.rows[0] ?? null;
}
