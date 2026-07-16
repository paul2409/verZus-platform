import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { competitionLifecycleScenarioSchema } from "../model/competition-lifecycle.schema";
import type { CompetitionLifecycleScenario } from "../model/competition-lifecycle.types";
import { getMockCompetitionLifecycleResponse } from "./mock-competition-lifecycle.service";

export const COMPETITION_LIFECYCLE_SCENARIO_COOKIE = "verzus_m6_lifecycle_scenario";

export function isCompetitionFailureInjectionEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" || process.env.VERZUS_ENABLE_FAILURE_INJECTION === "true"
  );
}

export function parseCompetitionLifecycleScenario(
  value: string | null | undefined,
): CompetitionLifecycleScenario {
  const parsed = competitionLifecycleScenarioSchema.safeParse(value ?? "normal");
  return parsed.success ? parsed.data : "normal";
}

export async function resolveCompetitionRouteId(context: {
  params: Promise<{ competitionId: string }> | { competitionId: string };
}): Promise<string> {
  const params = await Promise.resolve(context.params);
  return params.competitionId;
}

export async function handleMockCompetitionLifecycleGet(
  request: NextRequest,
  context: {
    params: Promise<{ competitionId: string }> | { competitionId: string };
  },
): Promise<NextResponse> {
  const competitionId = await resolveCompetitionRouteId(context);
  const requested = parseCompetitionLifecycleScenario(request.nextUrl.searchParams.get("scenario"));
  const scenario = isCompetitionFailureInjectionEnabled() ? requested : "normal";
  const result = getMockCompetitionLifecycleResponse(competitionId, scenario);
  const response = NextResponse.json(result.body, {
    status: result.status,
    headers: {
      "cache-control": "no-store",
      "x-request-id": result.requestId,
    },
  });

  if (scenario === "normal") {
    response.cookies.set(COMPETITION_LIFECYCLE_SCENARIO_COOKIE, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/api/competitions",
      maxAge: 0,
    });
  } else {
    response.cookies.set(COMPETITION_LIFECYCLE_SCENARIO_COOKIE, scenario, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/api/competitions",
      maxAge: 5 * 60,
    });
  }

  return response;
}
