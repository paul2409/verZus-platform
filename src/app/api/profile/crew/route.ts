// VERZUS M11.4 CREW RESOURCE
import type { NextRequest } from "next/server";
import { handleProfileResourceGet } from "@/features/profiles/resources/server";
export const dynamic = "force-dynamic";
export function GET(request: NextRequest) {
  return handleProfileResourceGet(request, "crew");
}
