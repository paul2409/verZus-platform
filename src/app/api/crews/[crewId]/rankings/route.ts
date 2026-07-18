// VERZUS M9.4 CREW RANKINGS API ROUTE

import type { NextRequest } from "next/server";
import type { NextResponse } from "next/server";

import { handleCrewResourceGet } from "@/features/crews/resources/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function GET(
  request: NextRequest,
  context: { params: Promise<{ crewId: string }> },
): Promise<NextResponse> {
  return handleCrewResourceGet(request, context, "rankings");
}
