// VERZUS M10.6 PAGINATED AUDITABLE REWARD HISTORY API ROUTE

import type { NextRequest } from "next/server";

import { handleRewardHistoryAuditGet } from "@/features/rewards/history/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function GET(request: NextRequest) {
  return handleRewardHistoryAuditGet(request);
}
