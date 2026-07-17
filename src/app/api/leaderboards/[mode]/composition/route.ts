// VERZUS M8.4 LEADERBOARD MODE COMPOSITION ROUTE

import type { NextRequest } from "next/server";
import type { NextResponse } from "next/server";

import { handleMockLeaderboardGet } from "@/features/leaderboards/resources/server/mock-leaderboard.http";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ mode: string }> },
): Promise<NextResponse> {
  const { mode } = await context.params;
  return handleMockLeaderboardGet(request, mode, "composition");
}
