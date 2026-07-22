import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { getServerAuthSession } from "@/features/auth/server/auth-session.server";
import { queryDatabase } from "@/lib/db";

interface IdentityRow {
  id: string;
  game_id: string;
  platform: string;
  platform_handle: string;
  is_primary: boolean;
  created_at: Date;
  visibility: "public" | "friends" | "private";
  matches: number;
  wins: number;
  losses: number;
  draws: number;
  rating: number;
}

function dateLabel(value: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(value);
}

export async function GET() {
  const requestId = `profile-game-identities-${randomUUID()}`;
  const session = await getServerAuthSession();
  if (session.state !== "authenticated" || !session.user) {
    return NextResponse.json(
      {
        error: {
          code: "PROFILE_GAME_IDENTITIES_UNAUTHORIZED",
          message: "Authentication is required to view game identities.",
          request_id: requestId,
          retryable: false,
        },
      },
      { status: 401, headers: { "cache-control": "no-store", "x-request-id": requestId } },
    );
  }

  const result = await queryDatabase<IdentityRow>(
    `SELECT identity.id, identity.game_id, identity.platform, identity.platform_handle,
            identity.is_primary, identity.created_at,
            COALESCE(privacy.game_handles_audience, 'private') AS visibility,
            COALESCE(summary.matches, 0)::int AS matches,
            COALESCE(summary.wins, 0)::int AS wins,
            COALESCE(summary.losses, 0)::int AS losses,
            COALESCE(summary.draws, 0)::int AS draws,
            COALESCE(summary.rating, 0)::int AS rating
       FROM player_game_identities AS identity
       LEFT JOIN profile_privacy_settings AS privacy ON privacy.user_id = identity.user_id
       LEFT JOIN player_competitive_summaries AS summary ON summary.user_id = identity.user_id
      WHERE identity.user_id = $1
      ORDER BY identity.is_primary DESC, identity.created_at ASC`,
    [session.user.id],
  );

  const entries = result.rows.map((row) => ({
    id: row.id,
    game_label: row.game_id,
    handle: row.platform_handle,
    platform_label: row.platform,
    rank_label: row.rating > 0 ? `Rating ${row.rating}` : "Unranked",
    record_label:
      row.matches > 0
        ? `${row.wins}W · ${row.losses}L · ${row.draws}D`
        : "No verified record",
    status: "pending" as const,
    visibility: row.visibility,
    linked_at_label: dateLabel(row.created_at),
    last_verified_at_label: null,
  }));

  return NextResponse.json(
    {
      data: {
        entries,
        verified_count: 0,
        pending_count: entries.length,
        private_count: entries.filter((entry) => entry.visibility === "private").length,
        freshness: "fresh",
      },
      meta: { request_id: requestId, generated_at: new Date().toISOString() },
    },
    { headers: { "cache-control": "no-store", "x-request-id": requestId } },
  );
}
