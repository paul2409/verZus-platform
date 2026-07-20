// VERZUS M11.6 PROFILE INSIGHT HTTP HELPERS

import { NextResponse } from "next/server";

import type { ProfileInsightScenario } from "../model/player-identity-insights.types";

const scenarioErrors: Partial<
  Record<
    ProfileInsightScenario,
    { status: number; code: string; message: string; retryable: boolean }
  >
> = {
  error: {
    status: 500,
    code: "PROFILE_INSIGHT_UNAVAILABLE",
    message: "This profile section is temporarily unavailable.",
    retryable: true,
  },
  offline: {
    status: 503,
    code: "PROFILE_INSIGHT_OFFLINE",
    message: "This profile section cannot be reached while offline.",
    retryable: true,
  },
  unauthorized: {
    status: 401,
    code: "PROFILE_INSIGHT_UNAUTHORIZED",
    message: "Sign in again to view this profile section.",
    retryable: false,
  },
  forbidden: {
    status: 403,
    code: "PROFILE_INSIGHT_FORBIDDEN",
    message: "You do not have permission to view this profile section.",
    retryable: false,
  },
  "not-found": {
    status: 404,
    code: "PROFILE_INSIGHT_NOT_FOUND",
    message: "This profile section could not be found.",
    retryable: false,
  },
  maintenance: {
    status: 503,
    code: "PROFILE_INSIGHT_MAINTENANCE",
    message: "This profile section is under maintenance.",
    retryable: true,
  },
};

export function profileInsightScenarioResponse(
  scenario: ProfileInsightScenario,
  resource: string,
): NextResponse | null {
  if (scenario === "malformed") {
    return NextResponse.json(
      { data: { resource, entries: "not-an-array" }, meta: { request_id: "malformed" } },
      { headers: { "x-request-id": `profile-${resource}-malformed` } },
    );
  }

  const error = scenarioErrors[scenario];
  if (!error) return null;
  const requestId = `profile-${resource}-${scenario}`;
  return NextResponse.json(
    {
      error: {
        code: error.code,
        message: error.message,
        request_id: requestId,
        retryable: error.retryable,
      },
    },
    { status: error.status, headers: { "x-request-id": requestId } },
  );
}
