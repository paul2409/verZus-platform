// VERZUS M9.8 CREW HEALTH ENDPOINT

import { NextResponse } from "next/server";

import { getCrewReleaseConfig } from "@/features/crews/release";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(): Promise<NextResponse> {
  const config = getCrewReleaseConfig();

  return NextResponse.json(
    {
      feature: "crews",
      stage: "9.8",
      status: config.crewsEnabled ? "ok" : "disabled",
      environment: config.appEnvironment,
      releaseSha: config.releaseSha,
      checkedAt: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
