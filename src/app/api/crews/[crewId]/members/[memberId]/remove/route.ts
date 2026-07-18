// VERZUS M9.6 CREW MEMBER REMOVAL ROUTE

import type { NextRequest } from "next/server";

import { handleRemoveCrewMember } from "@/features/crews/governance/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ crewId: string; memberId: string }> },
) {
  return handleRemoveCrewMember(request, context);
}
