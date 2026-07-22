import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getProductionIdentityOptions } from "@/features/onboarding/server/onboarding.catalog";
import { onboardingToken } from "@/features/onboarding/server/onboarding.http";
import { resolveOnboardingUser } from "@/features/onboarding/server/onboarding.service";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const user = await resolveOnboardingUser(onboardingToken(request));
  if ("status" in user) return NextResponse.json(user.body, { status: user.status });
  return NextResponse.json({
    ok: true,
    data: getProductionIdentityOptions(user.gamerTag),
    requestId: `onboarding-${randomUUID()}`,
  });
}
