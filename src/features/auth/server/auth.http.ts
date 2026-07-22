import "server-only";

import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { ZodError, ZodType } from "zod";

import type { AuthApiFailureResponse } from "../api/auth-api.schema";
import { AUTH_SESSION_COOKIE, LEGACY_MOCK_SESSION_COOKIE } from "./auth.constants";
import type { AuthMutationResult, AuthSessionCookieMutation } from "./auth.service";

function validationFailure(error: ZodError): AuthApiFailureResponse {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field !== "string") continue;
    fieldErrors[field] = [...(fieldErrors[field] ?? []), issue.message];
  }

  return {
    ok: false,
    error: {
      code: "validation_failed",
      message: "Check the submitted fields.",
      requestId: `auth-${randomUUID()}`,
      retryable: false,
      fieldErrors,
      retryAfterSeconds: null,
    },
  };
}

function internalFailure(): AuthApiFailureResponse {
  return {
    ok: false,
    error: {
      code: "auth_service_error",
      message: "Authentication could not be completed. Try again.",
      requestId: `auth-${randomUUID()}`,
      retryable: true,
      fieldErrors: {},
      retryAfterSeconds: null,
    },
  };
}

export function readSessionToken(request: NextRequest): string | null {
  return request.cookies.get(AUTH_SESSION_COOKIE)?.value ?? null;
}

export function readDeviceId(request: NextRequest): string | null {
  const value = request.headers.get("x-verzus-device-id")?.trim();
  return value ? value.slice(0, 128) : null;
}

export function applySessionCookie(
  response: NextResponse,
  mutation: AuthSessionCookieMutation | null,
): void {
  response.cookies.set(LEGACY_MOCK_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  if (!mutation) return;

  if (mutation.action === "clear") {
    response.cookies.set(AUTH_SESSION_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return;
  }

  response.cookies.set(AUTH_SESSION_COOKIE, mutation.value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: mutation.maxAgeSeconds,
  });
}

export function createAuthPostHandler<TInput>(
  schema: ZodType<TInput>,
  mutate: (input: TInput, request: NextRequest) => Promise<AuthMutationResult>,
): (request: NextRequest) => Promise<NextResponse> {
  return async function POST(request: NextRequest): Promise<NextResponse> {
    let payload: unknown;

    try {
      payload = await request.json();
    } catch {
      payload = null;
    }

    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json(validationFailure(parsed.error), { status: 400 });
    }

    try {
      const result = await mutate(parsed.data, request);
      const response = NextResponse.json(result.body, { status: result.status });
      applySessionCookie(response, result.sessionCookie);
      return response;
    } catch (error) {
      console.error("Authentication route failed", error);
      return NextResponse.json(internalFailure(), { status: 500 });
    }
  };
}
