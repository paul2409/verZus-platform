import type { NextRequest } from "next/server";

import { handleTransferCrewOwnership } from "@/features/crews/governance/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: NextRequest, context: { params: Promise<{ crewId: string }> }) {
  return handleTransferCrewOwnership(request, context);
}
