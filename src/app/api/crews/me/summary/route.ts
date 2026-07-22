import type { NextRequest } from "next/server";

import { handleCrewSummaryGet } from "@/features/crews/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function GET(request: NextRequest) {
  return handleCrewSummaryGet(request);
}
