// VERZUS M4 STEP 4.7

import type { NextRequest, NextResponse } from "next/server";

import {
  createOnboardingResponse,
  getOnboardingAccessFailure,
  readOnboardingCookie,
} from "@/features/onboarding/server/mock-onboarding.http";
import { completeMockOnboardingProgress } from "@/features/onboarding/server/mock-onboarding.service";

export function POST(request: NextRequest): NextResponse {
  const accessFailure = getOnboardingAccessFailure(request);

  if (accessFailure) {
    return accessFailure;
  }

  return createOnboardingResponse(completeMockOnboardingProgress(readOnboardingCookie(request)));
}
