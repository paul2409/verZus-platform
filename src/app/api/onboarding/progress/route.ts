import type { NextRequest, NextResponse } from "next/server";

import { onboardingProgressRequestSchema } from "@/features/onboarding/api";
import {
  onboardingResponse,
  onboardingToken,
  onboardingValidationFailure,
} from "@/features/onboarding/server/onboarding.http";
import {
  getProductionOnboardingProgress,
  updateProductionOnboardingProgress,
} from "@/features/onboarding/server/onboarding.service";

export async function GET(request: NextRequest): Promise<NextResponse> {
  return onboardingResponse(await getProductionOnboardingProgress(onboardingToken(request)));
}

export async function PUT(request: NextRequest): Promise<NextResponse> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    payload = null;
  }
  const parsed = onboardingProgressRequestSchema.safeParse(payload);
  if (!parsed.success) return onboardingValidationFailure(parsed.error);
  return onboardingResponse(
    await updateProductionOnboardingProgress(onboardingToken(request), parsed.data),
  );
}
