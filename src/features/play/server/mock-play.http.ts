// VERZUS M5 STEPS 5.9-5.13

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { playScenarioSchema } from "../model";
import {
  authStateFromMockSession,
  isMockSessionEnabled,
  MOCK_SESSION_COOKIE,
} from "../../../shared/session/mock-session";
import { readStoredMockCheckIn } from "./mock-check-in.cookie";
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function applyStoredCheckIn(
  body: unknown,
  resource: PlayResourceName,
  matchId: string | null,
  checkedInAt: string | null,
): unknown {
  if (!matchId || !checkedInAt || !isRecord(body) || body.ok !== true) {
    return body;
  }

  const data = body.data;

  if (!isRecord(data) || data.match_id !== matchId) {
    return body;
  }

  if (resource === "current-check-in") {
    return {
      ...body,
      data: {
        ...data,
        state: "checked_in",
        checked_in_at: checkedInAt,
        can_check_in: false,
      },
    };
  }

  if (resource === "next-match") {
    return {
      ...body,
      data: {
        ...data,
        status: "checked_in",
      },
    };
  }

  return body;
}

export function handleMockPlayGet(request: NextRequest, resource: PlayResourceName): NextResponse {
  const failure = getPlayAccessFailure(request);

  if (failure) {
    return failure;
  }

  const result = getMockPlayResource(resource, readPlayScenario(request));
  const stored = readStoredMockCheckIn(request);
  const body = applyStoredCheckIn(
    result.body,
    resource,
    stored?.matchId ?? null,
    stored?.checkedInAt ?? null,
  );

  return NextResponse.json(body, {
    status: result.status,
    headers: {
      "cache-control": "no-store",
      "x-verzus-resource": resource,
    },
  });
}
