// VERZUS M11.6 PROFILE ACHIEVEMENTS ENDPOINT

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  buildProfileAchievements,
  normalizeAchievementCategory,
  normalizeAchievementState,
  normalizeProfileInsightScenario,
  profileInsightScenarioResponse,
} from "@/features/profiles/identity-insights/server";

export async function GET(request: NextRequest) {
  const scenario = normalizeProfileInsightScenario(request.nextUrl.searchParams.get("scenario"));
  const forced = profileInsightScenarioResponse(scenario, "achievements");
  if (forced) return forced;

  const pageValue = Number.parseInt(request.nextUrl.searchParams.get("page") ?? "1", 10);
  const payload = await buildProfileAchievements({
    category: normalizeAchievementCategory(request.nextUrl.searchParams.get("category")),
    state: normalizeAchievementState(request.nextUrl.searchParams.get("state")),
    page: Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 1,
    scenario,
  });

  return NextResponse.json(payload, {
    headers: { "x-request-id": payload.meta.request_id, "cache-control": "no-store" },
  });
}
