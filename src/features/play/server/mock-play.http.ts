// VERZUS M5 STEPS 5.1-5.4

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { playScenarioSchema } from "../model";
import {
  authStateFromMockSession,
  isMockSessionEnabled,
  MOCK_SESSION_COOKIE,
} from "../../../shared/session/mock-session";
import { getMockPlayResource, type PlayResourceName } from "./mock-play.service";

function requestId(): string {
  return `mock-play-access-${globalThis.crypto.randomUUID()}`;
}

function accessFailure(status: number, code: string, message: string): NextResponse {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code,
        message,
        request_id: requestId(),
        retryable: false,
        field_errors: {},
      },
    },
    { status },
  );
}

export function getPlayAccessFailure(request: NextRequest): NextResponse | null {
  if (!isMockSessionEnabled()) {
    return accessFailure(
      503,
      "service_unavailable",
      "Mock Play APIs are disabled in this environment.",
    );
  }

  const cookieValue = request.cookies.get(MOCK_SESSION_COOKIE)?.value ?? null;
  const authState = authStateFromMockSession(cookieValue);

  if (authState === "authenticated") {
    return null;
  }

  if (authState === "anonymous") {
    return accessFailure(401, "unauthorized", "Sign in before accessing Play.");
  }

  return accessFailure(
    403,
    "forbidden",
    "Complete onboarding and clear account restrictions before accessing Play.",
  );
}

export function readPlayScenario(request: NextRequest) {
  const parsed = playScenarioSchema.safeParse(request.nextUrl.searchParams.get("scenario"));
  return parsed.success ? parsed.data : "normal";
}

export function handleMockPlayGet(request: NextRequest, resource: PlayResourceName): NextResponse {
  const failure = getPlayAccessFailure(request);

  if (failure) {
    return failure;
  }

  const result = getMockPlayResource(resource, readPlayScenario(request));

  return NextResponse.json(result.body, {
    status: result.status,
    headers: {
      "cache-control": "no-store",
      "x-verzus-resource": resource,
    },
  });
}
