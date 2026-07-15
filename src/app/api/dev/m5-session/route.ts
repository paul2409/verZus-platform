// VERZUS M5 PLAY PREVIEW SESSION REPAIR

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { playScenarioSchema } from "@/features/play/model";
import {
  isMockSessionEnabled,
  MOCK_SESSION_COOKIE,
  mockSessionValues,
} from "@/shared/session/mock-session";

function notFoundResponse(): NextResponse {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: "not_found",
        message: "Not found.",
        request_id: `m5-preview-${globalThis.crypto.randomUUID()}`,
        retryable: false,
        field_errors: {},
      },
    },
    {
      status: 404,
      headers: {
        "cache-control": "no-store",
      },
    },
  );
}

export function GET(request: NextRequest): NextResponse {
  if (process.env.NODE_ENV === "production" || !isMockSessionEnabled()) {
    return notFoundResponse();
  }

  const parsed = playScenarioSchema.safeParse(request.nextUrl.searchParams.get("scenario"));
  const scenario = parsed.success ? parsed.data : "normal";

  const destination = new URL("/play", request.url);
  destination.searchParams.set("scenario", scenario);

  const response = NextResponse.redirect(destination);

  response.cookies.set(MOCK_SESSION_COOKIE, mockSessionValues.authenticated, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60,
  });

  response.headers.set("cache-control", "no-store");
  response.headers.set("x-verzus-preview-session", "authenticated");

  return response;
}
