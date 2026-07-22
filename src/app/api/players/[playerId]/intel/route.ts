import { randomUUID } from "node:crypto";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { readPublicPlayerProfileRecord } from "@/features/profiles/public-profile/server/public-profile.repository";
import { serializePlayerIntelModel } from "@/features/profiles/intel-card/resource/player-intel-resource.service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function errorResponse(
  requestId: string,
  status: number,
  code: string,
  message: string,
  retryable = false,
) {
  return NextResponse.json(
    { error: { code, message, request_id: requestId, retryable } },
    { status, headers: { "Cache-Control": "no-store", "X-Request-ID": requestId } },
  );
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ playerId: string }> },
): Promise<NextResponse> {
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  const { playerId } = await context.params;
  const profile = await readPublicPlayerProfileRecord(playerId);

  if (!profile || profile.status !== "active") {
    return errorResponse(requestId, 404, "PLAYER_INTEL_NOT_FOUND", "Player intel was not found.");
  }

  if (profile.record.identity.profileVisibility !== "public") {
    return errorResponse(
      requestId,
      403,
      "PLAYER_INTEL_FORBIDDEN",
      "This player has not made their competitive intel public.",
    );
  }

  const primaryGame = profile.record.games[0];
  const rank = Math.max(0, profile.record.stats.weeklyRank);
  const currentStreak = profile.record.stats.currentStreakLabel;
  const model = {
    id: profile.record.identity.id,
    displayName: profile.record.identity.displayName,
    handle: profile.record.identity.handle,
    subtitle: profile.record.identity.title || "VERZUS player",
    locationLabel: profile.record.identity.locationLabel || "Location private",
    gameLabel: primaryGame?.gameLabel ?? "No game linked",
    crewName: profile.record.crew?.name ?? "Independent",
    avatarSrc: profile.record.identity.avatarSrc ?? "/profiles/default-banner.svg",
    rank,
    trust: profile.record.stats.trustScore,
    verified: profile.record.identity.verified,
    wins: profile.record.stats.wins,
    winRateLabel: profile.record.stats.winRateLabel,
    pointsLabel: new Intl.NumberFormat("en").format(profile.record.stats.points),
    streakLabel: currentStreak,
    recentForm: [] as const,
    recentMatches: [],
    achievementPreview: [],
    profileHref: `/players/${encodeURIComponent(playerId)}`,
    challengeHref: null,
  };

  return NextResponse.json(
    {
      data: serializePlayerIntelModel(model),
      meta: {
        request_id: requestId,
        fetched_at: new Date().toISOString(),
        freshness: "fresh",
        source: "profile-read-model",
      },
    },
    { status: 200, headers: { "Cache-Control": "no-store", "X-Request-ID": requestId } },
  );
}
