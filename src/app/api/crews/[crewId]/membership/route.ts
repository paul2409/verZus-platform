// VERZUS M9.5 CREW MEMBERSHIP READ ROUTE

import type { NextRequest } from "next/server";

import { handleCrewMembershipGet } from "@/features/crews/membership/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest, context: { params: Promise<{ crewId: string }> }) {
  return handleCrewMembershipGet(request, context);
}
