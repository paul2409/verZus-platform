import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  authStateFromMockSession,
  isMockSessionEnabled,
  MOCK_SESSION_COOKIE,
} from "@/shared/session/mock-session";

import { competitionDetailScenarioSchema } from "../model/competition-detail.schema";
import {
  getMockCompetitionDetailResource,
  type CompetitionDetailResourceName,
} from "./mock-competition-detail.service";

function accessFailure(status: number, code: string, message: string) {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code,
        message,
        request_id: `mock-competition-detail-access-${globalThis.crypto.randomUUID()}`,
        retryable: false,
        field_errors: {},
      },
    },
    { status },
  );
}

function access(request: NextRequest) {
  if (!isMockSessionEnabled())
    return accessFailure(503, "service_unavailable", "Mock APIs are disabled.");
  const state = authStateFromMockSession(request.cookies.get(MOCK_SESSION_COOKIE)?.value ?? null);
  if (state === "authenticated") return null;
  if (state === "anonymous")
    return accessFailure(401, "unauthorized", "Sign in to inspect competitions.");
  return accessFailure(403, "forbidden", "Complete onboarding before using Compete.");
}

export function handleMockCompetitionDetailGet(
  request: NextRequest,
  competitionId: string,
  resource: CompetitionDetailResourceName,
) {
  const accessResponse = access(request);
  if (accessResponse) return accessResponse;
  const parsed = competitionDetailScenarioSchema.safeParse(
    request.nextUrl.searchParams.get("scenario"),
  );
  const scenario = parsed.success ? parsed.data : "normal";
  const result = getMockCompetitionDetailResource(competitionId, resource, scenario);
  const response = NextResponse.json(result.body, {
    status: result.status,
    headers: { "cache-control": "no-store", "x-verzus-resource": `competition-detail-${resource}` },
  });
  const body = result.body as { ok?: boolean; request_id?: string };
  if (body.ok && body.request_id) response.headers.set("x-request-id", body.request_id);
  return response;
}
