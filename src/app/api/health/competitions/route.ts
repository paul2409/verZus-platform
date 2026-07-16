// VERZUS M6.7 COMPETITION HEALTH ENDPOINT

import { NextResponse } from "next/server";

import { getCompetitionReleaseMetadata } from "@/features/competitions/release";

export function GET() {
  const release = getCompetitionReleaseMetadata();

  return NextResponse.json(
    {
      ok: true,
      feature: "competitions",
      stage: release.stage,
      enabled: release.enabled,
      environment: release.environment,
      release: release.release,
      checked_at: new Date().toISOString(),
    },
    { headers: { "cache-control": "no-store" } },
  );
}
