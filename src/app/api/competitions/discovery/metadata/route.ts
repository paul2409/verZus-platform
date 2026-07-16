import type { NextRequest, NextResponse } from "next/server";

import { handleMockCompetitionDiscoveryGet } from "@/features/competitions/discovery/server";

export function GET(request: NextRequest): NextResponse {
  return handleMockCompetitionDiscoveryGet(request, "metadata");
}
