// VERZUS M9.7 CREW LIFECYCLE READ ROUTE

import type { NextRequest } from "next/server";

import { handleCrewLifecycleGet } from "@/features/crews/lifecycle/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest, context: { params: Promise<{ crewId: string }> }) {
  return handleCrewLifecycleGet(request, context);
}
