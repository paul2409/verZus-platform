import "server-only";

import { queryDatabase } from "@/lib/db";

import type {
  SmartCompetitionGame,
  SmartCompetitionSort,
  SmartLeaderboardGame,
  SmartLeaderboardMode,
  SmartPreferencePatch,
  SmartSearchDomain,
} from "../model";

type ProfileRow = {
  country_code: string | null;
  region: string | null;
  city: string | null;
  timezone: string | null;
};

type IdentityRow = {
  game_id: string;
  game_name: string;
  game_filter: Exclude<SmartCompetitionGame, "all">;
  platform: string;
  platform_handle: string;
};

type AvailabilityRow = {
  day_of_week: string;
  start_time: string;
  end_time: string;
  timezone: string;
};

type PreferenceRow = {
  competition_game: SmartCompetitionGame | null;
  competition_sort: SmartCompetitionSort | null;
  leaderboard_mode: SmartLeaderboardMode | null;
  leaderboard_game: SmartLeaderboardGame | null;
  search_domain: SmartSearchDomain | null;
  version: number;
};

type SearchHistoryRow = {
  domain: SmartSearchDomain;
};

export type SmartDefaultsSources = {
  profile: ProfileRow | null;
  identity: IdentityRow | null;
  availability: AvailabilityRow[];
  preferences: PreferenceRow | null;
  recentSearchDomain: SmartSearchDomain | null;
};

export async function readSmartDefaultsSources(userId: string): Promise<SmartDefaultsSources> {
  const [profileResult, identityResult, availabilityResult, preferenceResult, historyResult] =
    await Promise.all([
      queryDatabase<ProfileRow>(
        `SELECT country_code, region, city, timezone
         FROM player_profiles
         WHERE user_id = $1
         LIMIT 1`,
        [userId],
      ),
      queryDatabase<IdentityRow>(
        `SELECT
           identity.game_id,
           COALESCE(game.name, identity.game_id) AS game_name,
           COALESCE(game.filter_value, 'ea-fc') AS game_filter,
           identity.platform,
           identity.platform_handle
         FROM player_game_identities AS identity
         LEFT JOIN games AS game ON game.id = identity.game_id
         WHERE identity.user_id = $1
         ORDER BY identity.is_primary DESC, identity.created_at ASC, identity.id ASC
         LIMIT 1`,
        [userId],
      ),
      queryDatabase<AvailabilityRow>(
        `SELECT
           day_of_week,
           start_time::text,
           end_time::text,
           timezone
         FROM player_availability
         WHERE user_id = $1
         ORDER BY
           CASE day_of_week
             WHEN 'monday' THEN 1
             WHEN 'tuesday' THEN 2
             WHEN 'wednesday' THEN 3
             WHEN 'thursday' THEN 4
             WHEN 'friday' THEN 5
             WHEN 'saturday' THEN 6
             ELSE 7
           END,
           start_time`,
        [userId],
      ),
      queryDatabase<PreferenceRow>(
        `SELECT
           competition_game,
           competition_sort,
           leaderboard_mode,
           leaderboard_game,
           search_domain,
           version
         FROM user_smart_preferences
         WHERE user_id = $1
         LIMIT 1`,
        [userId],
      ),
      queryDatabase<SearchHistoryRow>(
        `SELECT domain
         FROM search_query_history
         WHERE user_id = $1
         ORDER BY last_searched_at DESC, usage_count DESC
         LIMIT 1`,
        [userId],
      ),
    ]);

  return {
    profile: profileResult.rows[0] ?? null,
    identity: identityResult.rows[0] ?? null,
    availability: availabilityResult.rows,
    preferences: preferenceResult.rows[0] ?? null,
    recentSearchDomain: historyResult.rows[0]?.domain ?? null,
  };
}

const columnByPreferenceKey = {
  competitionGame: "competition_game",
  competitionSort: "competition_sort",
  leaderboardMode: "leaderboard_mode",
  leaderboardGame: "leaderboard_game",
  searchDomain: "search_domain",
} as const;

export async function writeSmartPreferences(
  userId: string,
  patch: SmartPreferencePatch,
): Promise<void> {
  const entries = Object.entries(patch).filter((entry) => entry[1] !== undefined) as Array<
    [keyof SmartPreferencePatch, string]
  >;

  if (entries.length === 0) return;

  const columns = entries.map(([key]) => columnByPreferenceKey[key]);
  const values = entries.map(([, value]) => value);
  const placeholders = values.map((_, index) => `$${index + 2}`);
  const updates = columns.map((column) => `${column} = EXCLUDED.${column}`);

  await queryDatabase(
    `INSERT INTO user_smart_preferences (user_id, ${columns.join(", ")})
     VALUES ($1, ${placeholders.join(", ")})
     ON CONFLICT (user_id) DO UPDATE SET
       ${updates.join(",\n       ")},
       version = user_smart_preferences.version + 1,
       updated_at = now()`,
    [userId, ...values],
  );
}
