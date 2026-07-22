import type { NextRequest } from "next/server";

import { handleCreateCrewInvite } from "@/features/crews/membership/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: NextRequest, context: { params: Promise<{ crewId: string }> }) {
  return handleCreateCrewInvite(request, context);
}
