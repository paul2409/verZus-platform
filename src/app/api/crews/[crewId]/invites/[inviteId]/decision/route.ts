// VERZUS M9.5 CREW INVITE DECISION ROUTE

import type { NextRequest } from "next/server";

import { handleDecideCrewInvite } from "@/features/crews/membership/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ crewId: string; inviteId: string }> },
) {
  return handleDecideCrewInvite(request, context);
}
