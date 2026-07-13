// VERZUS M4 STEP 4.9

import type { NextRequest, NextResponse } from "next/server";

import {
  createMockOnboardingOptionsResponse,
  readOnboardingMockScenario,
} from "@/features/onboarding/server/mock-onboarding-options.http";
import { getMockOnboardingIdentityOptions } from "@/features/onboarding/server/mock-onboarding-options.service";
import { getOnboardingAccessFailure } from "@/features/onboarding/server/mock-onboarding.http";

export function GET(request: NextRequest): NextResponse {
  const accessFailure = getOnboardingAccessFailure(request);

  if (accessFailure) {
    return accessFailure;
  }

  return createMockOnboardingOptionsResponse(
    getMockOnboardingIdentityOptions(readOnboardingMockScenario(request)),
  );
}
