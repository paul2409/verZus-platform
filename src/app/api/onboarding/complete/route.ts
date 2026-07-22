import type { NextRequest, NextResponse } from "next/server";

import { onboardingResponse, onboardingToken } from "@/features/onboarding/server/onboarding.http";
import { completeProductionOnboarding } from "@/features/onboarding/server/onboarding.service";

export async function POST(request: NextRequest): Promise<NextResponse> {
  return onboardingResponse(await completeProductionOnboarding(onboardingToken(request)));
}
