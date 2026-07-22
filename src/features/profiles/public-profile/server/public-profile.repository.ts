import "server-only";

import { queryDatabase } from "@/lib/db";

import type { PublicPlayerProfileRecord } from "../model/public-player-profile.types";

interface BaseRow {
  id: string;
  status: "active" | "suspended" | "banned";
  restriction_reason: string | null;
  display_name: string;
  handle: string;
  title: string;
  bio: string;
  location_label: string;
  avatar_url: string | null;
  banner_url: string | null;
  email_verified_at: Date | null;
  profile_visibility: "public" | "friends" | "private";
  created_at: Date;
  availability_state: "available" | "limited" | "unavailable";
  availability_label: string;
  availability_detail: string;
  next_window_label: string;
  matches: number;
  wins: number;
  losses: number;
  draws: number;
  rating: number;
  weekly_rank: number;
  points: number;
  trust_score: string | number;
  current_streak: number;
  location_audience: "public" | "friends" | "private";
  crew_audience: "public" | "friends" | "private";
  statistics_audience: "public" | "friends" | "private";
  trust_score_audience: "public" | "friends" | "private";
  match_history_audience: "public" | "friends" | "private";
  game_handles_audience: "public" | "friends" | "private";
  achievements_audience: "public" | "friends" | "private";
  availability_audience: "public" | "friends" | "private";
}

interface GameRow {
  id: string;
  game_id: string;
  platform: string;
  platform_handle: string;
}

export async function readPublicPlayerProfileRecord(
  playerId: string,
): Promise<{
  record: PublicPlayerProfileRecord;
  status: BaseRow["status"];
  restrictionReason: string | null;
} | null> {
  const result = await queryDatabase<BaseRow>(
    `SELECT u.id, u.status, u.restriction_reason, u.email_verified_at, u.created_at,
      p.display_name, p.handle, p.title, p.bio, p.location_label, p.avatar_url, p.banner_url,
      p.profile_visibility, p.availability_state, p.availability_label,
      p.availability_detail, p.next_window_label,
      COALESCE(s.matches, 0)::int AS matches, COALESCE(s.wins, 0)::int AS wins,
      COALESCE(s.losses, 0)::int AS losses, COALESCE(s.draws, 0)::int AS draws,
      COALESCE(s.rating, 0)::int AS rating, COALESCE(s.weekly_rank, 0)::int AS weekly_rank,
      COALESCE(s.points, 0)::int AS points, COALESCE(s.trust_score, 0) AS trust_score,
      COALESCE(s.current_streak, 0)::int AS current_streak,
      privacy.location_audience, privacy.crew_audience, privacy.statistics_audience,
      privacy.trust_score_audience, privacy.match_history_audience,
      privacy.game_handles_audience, privacy.achievements_audience, privacy.availability_audience
     FROM users u JOIN player_profiles p ON p.user_id = u.id
     JOIN profile_privacy_settings privacy ON privacy.user_id = u.id
     LEFT JOIN player_competitive_summaries s ON s.user_id = u.id
     WHERE u.id = $1`,
    [playerId],
  );
  const row = result.rows[0];
  if (!row) return null;
  const games = await queryDatabase<GameRow>(
    `SELECT id, game_id, platform, platform_handle FROM player_game_identities WHERE user_id = $1 ORDER BY is_primary DESC, created_at`,
    [playerId],
  );
  const winRate = row.matches > 0 ? Math.round((row.wins / row.matches) * 100) : 0;
  return {
    status: row.status,
    restrictionReason: row.restriction_reason,
    record: {
      identity: {
        id: row.id,
        displayName: row.display_name,
        handle: row.handle,
        title: row.title,
        bio: row.bio,
        locationLabel: row.location_label,
        avatarSrc: row.avatar_url,
        avatarAlt: `${row.display_name} player avatar`,
        bannerSrc: row.banner_url ?? "/profiles/default-banner.svg",
        verified: row.email_verified_at !== null,
        profileVisibility: row.profile_visibility,
        joinedLabel: new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(
          row.created_at,
        ),
      },
      crew: null,
      stats: {
        matches: row.matches,
        wins: row.wins,
        losses: row.losses,
        draws: row.draws,
        winRateLabel: row.matches > 0 ? `${winRate}%` : "Not ranked",
        rating: row.rating,
        weeklyRank: row.weekly_rank,
        points: row.points,
        trustScore: Number(row.trust_score),
        currentStreakLabel:
          row.current_streak === 0 ? "No streak" : `${row.current_streak} match streak`,
      },
      games: games.rows.map((game) => ({
        id: game.id,
        gameLabel: game.game_id,
        handle: game.platform_handle,
        platformLabel: game.platform,
        rankLabel: "Unranked",
        recordLabel: "No verified record",
        verified: false,
      })),
      recentMatches: [],
      achievements: [],
      availability: {
        state: row.availability_state,
        publicLabel: row.availability_label,
        privateDetail: row.availability_detail,
        nextWindowLabel: row.next_window_label,
      },
      privacy: {
        location: row.location_audience,
        crew: row.crew_audience,
        statistics: row.statistics_audience,
        trustScore: row.trust_score_audience,
        matchHistory: row.match_history_audience,
        gameHandles: row.game_handles_audience,
        achievements: row.achievements_audience,
        availability: row.availability_audience,
      },
    },
  };
}
