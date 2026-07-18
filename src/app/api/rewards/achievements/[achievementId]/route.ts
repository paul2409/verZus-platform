// VERZUS M10.6 ACHIEVEMENT DETAIL API ROUTE

import type { NextRequest } from "next/server";

import { handleRewardAchievementDetailGet } from "@/features/rewards/achievements/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function GET(request: NextRequest, context: { params: Promise<{ achievementId: string }> }) {
  return handleRewardAchievementDetailGet(request, context);
}
