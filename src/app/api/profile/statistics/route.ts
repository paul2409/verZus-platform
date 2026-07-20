// VERZUS M11.5 DETAILED STATISTICS RESOURCE
import type { NextRequest } from "next/server";
import { handlePlayerStatisticsGet } from "@/features/profiles/history/server";
export const dynamic = "force-dynamic";
export function GET(request: NextRequest) {
  return handlePlayerStatisticsGet(request);
}
