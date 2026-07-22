import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getProductionCrewOptions } from "@/features/onboarding/server/onboarding.catalog";

export function GET(request: NextRequest): NextResponse {
  const gameId = request.nextUrl.searchParams.get("gameId");
  return NextResponse.json({
    ok: true,
    data: getProductionCrewOptions(gameId),
    requestId: `onboarding-${randomUUID()}`,
  });
}
