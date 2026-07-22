import type { NextRequest } from "next/server";

import { handleChangeCrewMemberRole } from "@/features/crews/governance/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ crewId: string; memberId: string }> },
) {
  return handleChangeCrewMemberRole(request, context);
}
