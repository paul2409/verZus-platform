import type { NextRequest } from "next/server";

import { handleLobbyMutation, handleMatchRead } from "@/features/matches/operations/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export function GET(request: NextRequest, context: { params: Promise<{ matchId: string }> }) {
  return handleMatchRead(request, context, "lobby");
}

export function POST(request: NextRequest, context: { params: Promise<{ matchId: string }> }) {
  return handleLobbyMutation(request, context);
}
