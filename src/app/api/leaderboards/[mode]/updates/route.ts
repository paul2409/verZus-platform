import type { NextRequest } from "next/server";

import { handleProductionLeaderboardGet } from "@/features/leaderboards/resources/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ mode: string }> },
) {
  const { mode } = await context.params;
  return handleProductionLeaderboardGet(request, mode, "updates");
}
