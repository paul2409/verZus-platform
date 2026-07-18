// VERZUS M9.6 CREW GOVERNANCE READ ROUTE

import type { NextRequest } from "next/server";

import { handleCrewGovernanceGet } from "@/features/crews/governance/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest, context: { params: Promise<{ crewId: string }> }) {
  return handleCrewGovernanceGet(request, context);
}
