import { NextResponse } from "next/server";

import { queryDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(): Promise<NextResponse> {
  try {
    const result = await queryDatabase<{ count: string }>(
      "SELECT COUNT(*)::text AS count FROM leaderboard_revisions",
    );
    return NextResponse.json(
      {
        ok: true,
        feature: "leaderboards",
        status: "ready",
        registeredModes: Number(result.rows[0]?.count ?? 0),
        source: "leaderboard-api",
        checkedAt: new Date().toISOString(),
      },
      { status: 200, headers: { "cache-control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      {
        ok: false,
        feature: "leaderboards",
        status: "unavailable",
        checkedAt: new Date().toISOString(),
      },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }
}
