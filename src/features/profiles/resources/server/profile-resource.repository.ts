import "server-only";

import { queryDatabase } from "@/lib/db";

export interface ProfileIdentityRecord {
  id: string;
  displayName: string;
  handle: string;
  title: string;
  bio: string;
  locationLabel: string;
  countryCode: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  verified: boolean;
  profileVisibility: "public" | "friends" | "private";
  joinedAt: Date;
  version: number;
}

export interface ProfileCompetitiveSummaryRecord {
  matches: number;
  wins: number;
  losses: number;
  draws: number;
  rating: number;
  weeklyRank: number;
  points: number;
  trustScore: number;
  currentStreak: number;
  updatedAt: Date;
}

export interface ProfileAvailabilityRecord {
  slotCount: number;
  dayOfWeek: string | null;
  startTime: string | null;
  endTime: string | null;
  timezone: string | null;
}

interface IdentityRow {
  id: string;
  display_name: string;
  handle: string;
  title: string;
  bio: string;
  city: string | null;
  region: string | null;
  country_code: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  email_verified_at: Date | null;
  profile_visibility: "public" | "friends" | "private";
  joined_at: Date;
  version: number;
}

function locationLabel(row: IdentityRow): string {
  return [row.city, row.region, row.country_code].filter(Boolean).join(", ");
}

export async function readProfileIdentity(userId: string): Promise<ProfileIdentityRecord | null> {
  const result = await queryDatabase<IdentityRow>(
    `SELECT
       user_account.id,
       profile.display_name,
       profile.handle,
       profile.title,
       profile.bio,
       profile.city,
       profile.region,
       profile.country_code,
       profile.avatar_url,
       profile.banner_url,
       user_account.email_verified_at,
       profile.profile_visibility,
       user_account.created_at AS joined_at,
       profile.version
     FROM users AS user_account
     JOIN player_profiles AS profile ON profile.user_id = user_account.id
     WHERE user_account.id = $1`,
    [userId],
  );

  const row = result.rows[0];
  if (!row) return null;

  return {
    id: row.id,
    displayName: row.display_name,
    handle: row.handle,
    title: row.title,
    bio: row.bio,
    locationLabel: locationLabel(row),
    countryCode: row.country_code ?? "",
    avatarUrl: row.avatar_url,
    bannerUrl: row.banner_url,
    verified: row.email_verified_at !== null,
    profileVisibility: row.profile_visibility,
    joinedAt: row.joined_at,
    version: row.version,
  };
}

interface SummaryRow {
  matches: number;
  wins: number;
  losses: number;
  draws: number;
  rating: number;
  weekly_rank: number;
  points: number;
  trust_score: string | number;
  current_streak: number;
  updated_at: Date;
}

export async function readProfileCompetitiveSummary(
  userId: string,
): Promise<ProfileCompetitiveSummaryRecord> {
  const result = await queryDatabase<SummaryRow>(
    `SELECT
       COALESCE(summary.matches, 0)::int AS matches,
       COALESCE(summary.wins, 0)::int AS wins,
       COALESCE(summary.losses, 0)::int AS losses,
       COALESCE(summary.draws, 0)::int AS draws,
       COALESCE(summary.rating, 0)::int AS rating,
       COALESCE(summary.weekly_rank, 0)::int AS weekly_rank,
       COALESCE(summary.points, 0)::int AS points,
       COALESCE(summary.trust_score, 0) AS trust_score,
       COALESCE(summary.current_streak, 0)::int AS current_streak,
       COALESCE(summary.updated_at, profile.updated_at) AS updated_at
     FROM player_profiles AS profile
     LEFT JOIN player_competitive_summaries AS summary ON summary.user_id = profile.user_id
     WHERE profile.user_id = $1`,
    [userId],
  );

  const row = result.rows[0];
  if (!row) {
    return {
      matches: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      rating: 0,
      weeklyRank: 0,
      points: 0,
      trustScore: 0,
      currentStreak: 0,
      updatedAt: new Date(0),
    };
  }

  return {
    matches: row.matches,
    wins: row.wins,
    losses: row.losses,
    draws: row.draws,
    rating: row.rating,
    weeklyRank: row.weekly_rank,
    points: row.points,
    trustScore: Number(row.trust_score),
    currentStreak: row.current_streak,
    updatedAt: row.updated_at,
  };
}

interface AvailabilityRow {
  slot_count: number;
  day_of_week: string | null;
  start_time: string | null;
  end_time: string | null;
  timezone: string | null;
}

export async function readProfileAvailability(userId: string): Promise<ProfileAvailabilityRecord> {
  const result = await queryDatabase<AvailabilityRow>(
    `WITH ordered_slots AS (
       SELECT day_of_week, start_time::text, end_time::text, timezone
       FROM player_availability
       WHERE user_id = $1
       ORDER BY
         array_position(
           ARRAY['monday','tuesday','wednesday','thursday','friday','saturday','sunday'],
           day_of_week
         ),
         start_time
     )
     SELECT
       (SELECT COUNT(*)::int FROM ordered_slots) AS slot_count,
       (SELECT day_of_week FROM ordered_slots LIMIT 1) AS day_of_week,
       (SELECT start_time FROM ordered_slots LIMIT 1) AS start_time,
       (SELECT end_time FROM ordered_slots LIMIT 1) AS end_time,
       (SELECT timezone FROM ordered_slots LIMIT 1) AS timezone`,
    [userId],
  );

  const row = result.rows[0];
  return {
    slotCount: row?.slot_count ?? 0,
    dayOfWeek: row?.day_of_week ?? null,
    startTime: row?.start_time ?? null,
    endTime: row?.end_time ?? null,
    timezone: row?.timezone ?? null,
  };
}
