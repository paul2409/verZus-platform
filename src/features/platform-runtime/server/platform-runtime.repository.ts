import "server-only";

import { queryDatabase } from "@/lib/db";

export type PlatformShellProfileRecord = {
  userId: string;
  name: string;
  handle: string | null;
  title: string | null;
  avatarSrc: string | null;
  points: number;
  crewName: string | null;
};

type PlatformShellRow = {
  user_id: string;
  name: string;
  handle: string | null;
  title: string | null;
  avatar_src: string | null;
  points: number | string;
  crew_name: string | null;
};

export async function findPlatformShellProfile(
  userId: string,
): Promise<PlatformShellProfileRecord | null> {
  const result = await queryDatabase<PlatformShellRow>(
    `
      SELECT
        user_account.id AS user_id,
        COALESCE(NULLIF(player_profile.display_name, ''), user_account.gamer_tag) AS name,
        player_profile.handle,
        NULLIF(player_profile.title, '') AS title,
        player_profile.avatar_url AS avatar_src,
        COALESCE(competitive_summary.points, 0) AS points,
        crew.name AS crew_name
      FROM users AS user_account
      LEFT JOIN player_profiles AS player_profile
        ON player_profile.user_id = user_account.id
      LEFT JOIN player_competitive_summaries AS competitive_summary
        ON competitive_summary.user_id = user_account.id
      LEFT JOIN crew_members AS membership
        ON membership.user_id = user_account.id
       AND membership.left_at IS NULL
      LEFT JOIN crews AS crew
        ON crew.id = membership.crew_id
       AND crew.lifecycle NOT IN ('disbanded', 'archived')
      WHERE user_account.id = $1
      LIMIT 1
    `,
    [userId],
  );

  const row = result.rows[0];
  if (!row) return null;

  return {
    userId: row.user_id,
    name: row.name,
    handle: row.handle,
    title: row.title,
    avatarSrc: row.avatar_src,
    points: Number(row.points) || 0,
    crewName: row.crew_name,
  };
}
