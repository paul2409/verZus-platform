import type { NextRequest } from "next/server";

import {
  handleCompetitionEntryGet,
  handleCompetitionEntryPost,
} from "@/features/competitions/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ competitionId: string }> },
) {
  const { competitionId } = await context.params;
  return handleCompetitionEntryGet(request, competitionId);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ competitionId: string }> },
) {
  const { competitionId } = await context.params;
  return handleCompetitionEntryPost(request, competitionId);
}
