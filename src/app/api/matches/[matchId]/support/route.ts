// VERZUS M7.3 INDEPENDENT SUPPORT RESOURCE ROUTE

import type { NextRequest } from "next/server";

import { handleMatchResourceRead } from "@/features/matches/operations/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function GET(request: NextRequest, context: { params: Promise<{ matchId: string }> }) {
  return handleMatchResourceRead("support", request, context);
}
