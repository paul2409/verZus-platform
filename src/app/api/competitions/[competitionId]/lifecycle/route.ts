import type { NextRequest } from "next/server";

import { handleCompetitionLifecycleGet } from "@/features/competitions/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ competitionId: string }> },
) {
  const { competitionId } = await context.params;
  return handleCompetitionLifecycleGet(request, competitionId);
}
