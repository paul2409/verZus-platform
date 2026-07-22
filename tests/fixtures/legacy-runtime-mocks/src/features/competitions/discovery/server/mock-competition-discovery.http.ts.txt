import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  authStateFromMockSession,
  isMockSessionEnabled,
  MOCK_SESSION_COOKIE,
} from "@/shared/session/mock-session";

import { competitionDiscoveryScenarioSchema } from "../model/competition-discovery.schema";
import {
  getMockCompetitionDiscoveryResource,
  type CompetitionDiscoveryResourceName,
} from "./mock-competition-discovery.service";

function requestId() {
  return `mock-competition-access-${globalThis.crypto.randomUUID()}`;
}

function accessFailure(status: number, code: string, message: string) {
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

function getCompetitionAccessFailure(request: NextRequest): NextResponse | null {
  if (!isMockSessionEnabled()) {
    return accessFailure(503, "service_unavailable", "Mock competition APIs are disabled.");
  }

  const cookieValue = request.cookies.get(MOCK_SESSION_COOKIE)?.value ?? null;
  const authState = authStateFromMockSession(cookieValue);
  if (authState === "authenticated") return null;
  if (authState === "anonymous") {
    return accessFailure(401, "unauthorized", "Sign in before browsing competitions.");
  }
  return accessFailure(403, "forbidden", "Complete onboarding before using Compete.");
}

function readScenario(request: NextRequest) {
  const parsed = competitionDiscoveryScenarioSchema.safeParse(
    request.nextUrl.searchParams.get("scenario"),
  );
  return parsed.success ? parsed.data : "normal";
}

export function handleMockCompetitionDiscoveryGet(
  request: NextRequest,
  resource: CompetitionDiscoveryResourceName,
): NextResponse {
  const accessFailure = getCompetitionAccessFailure(request);
  if (accessFailure) return accessFailure;

  const result = getMockCompetitionDiscoveryResource(
    resource,
    readScenario(request),
    request.nextUrl.searchParams,
  );

  const response = NextResponse.json(result.body, {
    status: result.status,
    headers: {
      "cache-control": "no-store",
      "x-verzus-resource": `competition-${resource}`,
    },
  });

  const body = result.body as { ok?: boolean; request_id?: string };
  if (body.ok && body.request_id) response.headers.set("x-request-id", body.request_id);
  return response;
}
