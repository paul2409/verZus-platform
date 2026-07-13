// VERZUS M4 STEP 4.5

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { ZodError, ZodType } from "zod";

import type {
  AuthApiFailureResponse,
  AuthSessionEnvelope,
} from "../api/auth-api.schema";
import type { AuthSessionResponse } from "../model";
import {
  authStateFromMockSession,
  MOCK_SESSION_COOKIE,
  type MockAuthMutationResult,
} from "./mock-auth.service";

export function isMockAuthEnabled(): boolean {
  return (
    process.env.NEXT_PUBLIC_ENABLE_MOCKS === "true" ||
    process.env.NODE_ENV !== "production"
  );
}

function requestId(): string {
  return `mock-auth-${globalThis.crypto.randomUUID()}`;
}

export function mockAuthDisabledResponse(): NextResponse {
  const body: AuthApiFailureResponse = {
    ok: false,
    error: {
      code: "service_unavailable",
      message: "Mock authentication is disabled in this environment.",
      requestId: requestId(),
      retryable: false,
      fieldErrors: {},
      retryAfterSeconds: null,
    },
  };

  return NextResponse.json(body, { status: 503 });
}

function validationFailure(error: ZodError): AuthApiFailureResponse {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const field = issue.path[0];

    if (typeof field !== "string") {
      continue;
    }

    fieldErrors[field] = [
      ...(fieldErrors[field] ?? []),
      issue.message,
    ];
  }

  return {
    ok: false,
    error: {
      code: "validation_failed",
      message: "Check the submitted fields.",
      requestId: requestId(),
      retryable: false,
      fieldErrors,
      retryAfterSeconds: null,
    },
  };
}

function applySessionCookie(
  response: NextResponse,
  result: MockAuthMutationResult,
): void {
  if (result.sessionCookie?.action === "set") {
    response.cookies.set(
      MOCK_SESSION_COOKIE,
      result.sessionCookie.value,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60,
      },
    );
  }

  if (result.sessionCookie?.action === "clear") {
    response.cookies.set(MOCK_SESSION_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  }
}

export function createMockAuthPostHandler<TInput>(
  schema: ZodType<TInput>,
  mutate: (input: TInput) => MockAuthMutationResult,
): (request: NextRequest) => Promise<NextResponse> {
  return async function POST(request: NextRequest): Promise<NextResponse> {
    if (!isMockAuthEnabled()) {
      return mockAuthDisabledResponse();
    }

    let payload: unknown;

    try {
      payload = await request.json();
    } catch {
      payload = null;
    }

    const parsed = schema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(validationFailure(parsed.error), {
        status: 400,
      });
    }

    const result = mutate(parsed.data);
    const response = NextResponse.json(result.body, {
      status: result.status,
    });

    applySessionCookie(response, result);
    return response;
  };
}

export function createMockAuthNoBodyHandler(
  mutate: () => MockAuthMutationResult,
): (request: NextRequest) => Promise<NextResponse> {
  return async function POST(): Promise<NextResponse> {
    if (!isMockAuthEnabled()) {
      return mockAuthDisabledResponse();
    }

    const result = mutate();
    const response = NextResponse.json(result.body, {
      status: result.status,
    });

    applySessionCookie(response, result);
    return response;
  };
}

export function createMockSessionResponse(
  request: NextRequest,
): AuthSessionEnvelope {
  const cookieValue =
    request.cookies.get(MOCK_SESSION_COOKIE)?.value ?? null;
  const state = authStateFromMockSession(cookieValue);
  const hasUser = state !== "anonymous";

  const data: AuthSessionResponse = {
    state,
    user: hasUser
      ? {
          id: "mock-player-001",
          email: "player@example.com",
          phone: null,
          role: "player",
          emailVerified:
            state !== "email_unverified",
          onboardingComplete: state === "authenticated",
        }
      : null,
    session:
      state === "authenticated" ||
      state === "email_unverified" ||
      state === "onboarding_incomplete"
        ? {
            id: "mock-session-001",
            expiresAt: new Date(
              Date.now() + 60 * 60 * 1000,
            ).toISOString(),
            refreshable: true,
            deviceId: "mock-device-local",
          }
        : null,
    restrictionReason:
      state === "suspended"
        ? "Mock trust review"
        : state === "banned"
          ? "Mock enforcement decision"
          : null,
    requestId: requestId(),
  };

  return {
    ok: true,
    data,
  };
}

export function applyMockMutationSession(
  response: NextResponse,
  result: MockAuthMutationResult,
): void {
  applySessionCookie(response, result);
}
