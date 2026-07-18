// VERZUS M10.4 IDEMPOTENT REWARD CLAIM ROUTE

import type { NextRequest } from "next/server";

import { handleRewardClaim } from "@/features/rewards/claims/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ rewardId: string }> },
) {
  return handleRewardClaim(request, context);
}
