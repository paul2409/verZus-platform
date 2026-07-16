import type { NextRequest } from "next/server";
import type { NextResponse } from "next/server";

import { handleMockCompetitionLifecycleGet } from "@/features/competitions/lifecycle/server";

export function GET(
  request: NextRequest,
  context: {
    params: Promise<{ competitionId: string }> | { competitionId: string };
  },
): Promise<NextResponse> {
  return handleMockCompetitionLifecycleGet(request, context);
}
