// VERZUS M9.5 CREW MEMBERSHIP EXPIRY ROUTE

import type { NextRequest } from "next/server";

import { handleExpireCrewMembership } from "@/features/crews/membership/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: NextRequest, context: { params: Promise<{ crewId: string }> }) {
  return handleExpireCrewMembership(request, context);
}
