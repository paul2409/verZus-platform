// VERZUS M8.10 LEADERBOARD HEALTH ENDPOINT

import { NextResponse } from "next/server";

import { getLeaderboardReleaseConfig } from "@/features/leaderboards/release";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(): Promise<NextResponse> {
  const config = getLeaderboardReleaseConfig();

  return NextResponse.json(
    {
      feature: "leaderboards",
      stage: "8.10",
      status: config.leaderboardsEnabled ? "ok" : "disabled",
      entityIntel: config.entityIntelEnabled ? "enabled" : "disabled",
      environment: config.appEnvironment,
      releaseSha: config.releaseSha,
      checkedAt: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
