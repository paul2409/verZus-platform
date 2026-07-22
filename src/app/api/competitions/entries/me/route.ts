import type { NextRequest } from "next/server";

import { handleCompetitionDiscoveryGet } from "@/features/competitions/server";

export function GET(request: NextRequest) {
  return handleCompetitionDiscoveryGet(request, "current-entry");
}
