import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getProductionAvailabilityOptions } from "@/features/onboarding/server/onboarding.catalog";

export function GET(request: NextRequest): NextResponse {
  const timezone = request.nextUrl.searchParams.get("timezone") || "Africa/Lagos";
  return NextResponse.json({
    ok: true,
    data: getProductionAvailabilityOptions(timezone),
    requestId: `onboarding-${randomUUID()}`,
  });
}
