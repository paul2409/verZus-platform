// VERZUS M9.7 CREW DISBAND ROUTE

import type { NextRequest } from "next/server";

import { handleCrewDisband } from "@/features/crews/lifecycle/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: NextRequest, context: { params: Promise<{ crewId: string }> }) {
  return handleCrewDisband(request, context);
}
