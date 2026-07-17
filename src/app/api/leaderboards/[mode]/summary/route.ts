// VERZUS M8.3 INDEPENDENT LEADERBOARD SUMMARY API

import type { NextRequest, NextResponse } from "next/server";

import { handleMockLeaderboardGet } from "@/features/leaderboards/resources/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ mode: string }> },
): Promise<NextResponse> {
  const { mode } = await context.params;
  return handleMockLeaderboardGet(request, mode, "summary");
}
