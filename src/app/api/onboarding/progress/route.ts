// VERZUS M4 STEP 4.7

import type { NextRequest, NextResponse } from "next/server";

import { onboardingProgressRequestSchema } from "@/features/onboarding/api";
import {
  createOnboardingResponse,
  getOnboardingAccessFailure,
  onboardingValidationFailure,
  readOnboardingCookie,
} from "@/features/onboarding/server/mock-onboarding.http";
import {
  getMockOnboardingProgress,
  updateMockOnboardingProgress,
} from "@/features/onboarding/server/mock-onboarding.service";

export function GET(request: NextRequest): NextResponse {
  const accessFailure = getOnboardingAccessFailure(request);

  if (accessFailure) {
    return accessFailure;
  }

  return createOnboardingResponse(getMockOnboardingProgress(readOnboardingCookie(request)));
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  const accessFailure = getOnboardingAccessFailure(request);

  if (accessFailure) {
    return accessFailure;
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    payload = null;
  }

  const parsed = onboardingProgressRequestSchema.safeParse(payload);

  if (!parsed.success) {
    return onboardingValidationFailure(parsed.error);
  }

  return createOnboardingResponse(
    updateMockOnboardingProgress(readOnboardingCookie(request), parsed.data),
  );
}
