import type { NextRequest } from "next/server";

import { handleMatchRead, handleResultMutation } from "@/features/matches/operations/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export function GET(request: NextRequest, context: { params: Promise<{ matchId: string }> }) {
  return handleMatchRead(request, context, "result");
}

export function POST(request: NextRequest, context: { params: Promise<{ matchId: string }> }) {
  return handleResultMutation(request, context);
}
