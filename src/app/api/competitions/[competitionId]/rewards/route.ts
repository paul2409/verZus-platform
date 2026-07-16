import type { NextRequest } from "next/server";

import { handleMockCompetitionDetailGet } from "@/features/competitions/details/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ competitionId: string }> },
) {
  const { competitionId } = await context.params;
  return handleMockCompetitionDetailGet(request, competitionId, "rewards");
}
