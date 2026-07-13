// VERZUS M4 STEP 4.9

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  onboardingMockScenarioValues,
  type MockOnboardingOptionsResult,
  type OnboardingMockScenario,
} from "./mock-onboarding-options.service";

export function readOnboardingMockScenario(request: NextRequest): OnboardingMockScenario {
  const requested =
    request.nextUrl.searchParams.get("scenario") ??
    request.headers.get("x-verzus-mock-scenario") ??
    "success";

  return onboardingMockScenarioValues.includes(requested as OnboardingMockScenario)
    ? (requested as OnboardingMockScenario)
    : "success";
}

export function createMockOnboardingOptionsResponse(
  result: MockOnboardingOptionsResult<unknown>,
): NextResponse {
  return NextResponse.json(result.body, {
    status: result.status,
    headers: {
      "cache-control": "no-store",
    },
  });
}
