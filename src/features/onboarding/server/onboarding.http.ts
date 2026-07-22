import "server-only";

import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { ZodError } from "zod";

import { readRuntimeSessionToken } from "@/lib/session/runtime-session.server";
import type { OnboardingApiFailure } from "../api";
import type { OnboardingResult } from "./onboarding.service";

export function onboardingToken(request: NextRequest): string | null {
  return readRuntimeSessionToken(request);
}

export function onboardingResponse(result: OnboardingResult): NextResponse {
  return NextResponse.json(result.body, { status: result.status });
}

export function onboardingValidationFailure(error: ZodError): NextResponse {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.join(".") : "request";
    fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
  }
  const body: OnboardingApiFailure = {
    ok: false,
    error: {
      code: "validation_failed",
      message: "Check the onboarding information and retry.",
      requestId: `onboarding-${randomUUID()}`,
      retryable: false,
      fieldErrors,
    },
  };
  return NextResponse.json(body, { status: 400 });
}
