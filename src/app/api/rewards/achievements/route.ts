// VERZUS M10.3 ACHIEVEMENTS REWARD API ROUTE

import type { NextRequest } from "next/server";
import type { NextResponse } from "next/server";

import { handleRewardResourceGet } from "@/features/rewards/resources/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function GET(request: NextRequest): Promise<NextResponse> {
  return handleRewardResourceGet(request, "achievements");
}
