// VERZUS M11.6 PROFILE GAME IDENTITIES ENDPOINT

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  buildProfileGameIdentities,
  normalizeProfileInsightScenario,
  profileInsightScenarioResponse,
} from "@/features/profiles/identity-insights/server";

export async function GET(request: NextRequest) {
  const scenario = normalizeProfileInsightScenario(request.nextUrl.searchParams.get("scenario"));
  const forced = profileInsightScenarioResponse(scenario, "game-identities");
  if (forced) return forced;

  const payload = await buildProfileGameIdentities({ scenario });
  return NextResponse.json(payload, {
    headers: { "x-request-id": payload.meta.request_id, "cache-control": "no-store" },
  });
}
