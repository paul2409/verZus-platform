import type { NextRequest } from "next/server";

import {
  handleMockCompetitionEntryGet,
  handleMockCompetitionEntryPost,
} from "@/features/competitions/entry/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ competitionId: string }> },
) {
  const { competitionId } = await context.params;
  return handleMockCompetitionEntryGet(request, competitionId);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ competitionId: string }> },
) {
  const { competitionId } = await context.params;
  return handleMockCompetitionEntryPost(request, competitionId);
}
