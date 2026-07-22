import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

import { getProductionGameOptions } from "@/features/onboarding/server/onboarding.catalog";

export function GET(): NextResponse {
  return NextResponse.json({
    ok: true,
    data: getProductionGameOptions(),
    requestId: `onboarding-${randomUUID()}`,
  });
}
