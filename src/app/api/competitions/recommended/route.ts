import type { NextRequest } from "next/server";

import { handleRecommendedCompetitionsGet } from "@/features/competitions/server";

export function GET(request: NextRequest) {
  return handleRecommendedCompetitionsGet(request);
}
