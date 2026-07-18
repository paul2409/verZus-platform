// VERZUS M9.5 CREW APPLICATION DECISION ROUTE

import type { NextRequest } from "next/server";

import { handleDecideCrewApplication } from "@/features/crews/membership/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ crewId: string; applicationId: string }> },
) {
  return handleDecideCrewApplication(request, context);
}
