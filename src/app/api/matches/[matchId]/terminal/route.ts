import type { NextRequest } from "next/server";

import { handleTerminalMutation, handleTerminalRead } from "@/features/matches/operations/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export function GET(request: NextRequest, context: { params: Promise<{ matchId: string }> }) {
  return handleTerminalRead(request, context);
}

export function POST(request: NextRequest, context: { params: Promise<{ matchId: string }> }) {
  return handleTerminalMutation(request, context);
}
