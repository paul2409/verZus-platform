import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { CompetitionLifecycleApiResponse } from "../api/competition-lifecycle-api.schema";
import {
  COMPETITION_LIFECYCLE_SCENARIO_COOKIE,
  isCompetitionFailureInjectionEnabled,
  parseCompetitionLifecycleScenario,
  resolveCompetitionRouteId,
} from "./mock-competition-lifecycle.http";
import { getMockCompetitionLifecycleResponse } from "./mock-competition-lifecycle.service";

export type CompetitionRouteContext = {
  params: Promise<{ competitionId: string }> | { competitionId: string };
};

function mutationStatus(code: string): number {
  if (code === "not_eligible" || code === "forbidden") return 403;
  if (code === "unauthorized") return 401;
  if (code === "not_found") return 404;
  if (code === "offline" || code === "maintenance") return 503;
  return 409;
}

function blockedMutationBody(
  code: string,
  message: string,
  requestId: string,
  retryable: boolean,
): CompetitionLifecycleApiResponse {
  return {
    ok: false,
    error: {
      code,
      message,
      request_id: requestId,
      retryable,
    },
  };
}

export async function guardCompetitionEntryRequest(
  request: NextRequest,
  context: CompetitionRouteContext,
): Promise<NextResponse | null> {
  if (!isCompetitionFailureInjectionEnabled()) return null;

  const scenario = parseCompetitionLifecycleScenario(
    request.headers.get("x-verzus-lifecycle-scenario") ??
      request.cookies.get(COMPETITION_LIFECYCLE_SCENARIO_COOKIE)?.value,
  );
  if (scenario === "normal") return null;

  const competitionId = await resolveCompetitionRouteId(context);
  const result = getMockCompetitionLifecycleResponse(competitionId, scenario);

  if (!result.body.ok) {
    return NextResponse.json(result.body, {
      status: result.status,
      headers: {
        "cache-control": "no-store",
        "x-request-id": result.requestId,
      },
    });
  }

  if (result.body.data.entry_allowed) return null;

  const code = result.body.data.disposition;
  const body = blockedMutationBody(
    code,
    result.body.data.message,
    result.requestId,
    result.body.data.retryable,
  );

  return NextResponse.json(body, {
    status: mutationStatus(code),
    headers: {
      "cache-control": "no-store",
      "x-request-id": result.requestId,
    },
  });
}
