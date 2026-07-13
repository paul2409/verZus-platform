// VERZUS M4 STEP 4.7

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { ZodError } from "zod";

import type { OnboardingApiFailure } from "../api";
import {
  authStateFromMockSession,
  isMockSessionEnabled,
  MOCK_SESSION_COOKIE,
  mockSessionValues,
} from "../../../shared/session/mock-session";
import { MOCK_ONBOARDING_COOKIE } from "./mock-onboarding.cookie";
import type { MockOnboardingServiceResult } from "./mock-onboarding.service";

function requestId(): string {
  return `mock-onboarding-${globalThis.crypto.randomUUID()}`;
}

export function getOnboardingAccessFailure(request: NextRequest): NextResponse | null {
  if (!isMockSessionEnabled()) {
    const body: OnboardingApiFailure = {
      ok: false,
      error: {
        code: "service_unavailable",
        message: "Mock onboarding is disabled in this environment.",
        requestId: requestId(),
        retryable: false,
        fieldErrors: {},
      },
    };

    return NextResponse.json(body, {
      status: 503,
    });
  }

  const sessionValue = request.cookies.get(MOCK_SESSION_COOKIE)?.value ?? null;
  const state = authStateFromMockSession(sessionValue);

  if (state === "onboarding_incomplete" || state === "authenticated") {
    return null;
  }

  const status = state === "anonymous" ? 401 : 403;
  const body: OnboardingApiFailure = {
    ok: false,
    error: {
      code: status === 401 ? "unauthorized" : "forbidden",
      message:
        status === 401
          ? "Sign in before accessing onboarding."
          : "Your current account state cannot access onboarding.",
      requestId: requestId(),
      retryable: false,
      fieldErrors: {},
    },
  };

  return NextResponse.json(body, {
    status,
  });
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
      requestId: requestId(),
      retryable: false,
      fieldErrors,
    },
  };

  return NextResponse.json(body, {
    status: 400,
  });
}

export function readOnboardingCookie(request: NextRequest): string | null {
  return request.cookies.get(MOCK_ONBOARDING_COOKIE)?.value ?? null;
}

export function createOnboardingResponse(result: MockOnboardingServiceResult): NextResponse {
  const response = NextResponse.json(result.body, {
    status: result.status,
  });

  if (result.cookieValue) {
    response.cookies.set(MOCK_ONBOARDING_COOKIE, result.cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  if (result.completed) {
    response.cookies.set(MOCK_SESSION_COOKIE, mockSessionValues.authenticated, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });
  }

  return response;
}
