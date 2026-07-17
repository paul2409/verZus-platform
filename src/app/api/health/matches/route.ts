// VERZUS M7.8 MATCH OPERATIONS HEALTH ENDPOINT

import { NextResponse } from "next/server";

import { getMatchOperationsReleaseMetadata } from "@/features/matches/operations/release";

export function GET() {
  const release = getMatchOperationsReleaseMetadata();

  return NextResponse.json(
    {
      ok: true,
      feature: "match-operations",
      stage: release.stage,
      enabled: release.enabled,
      environment: release.environment,
      release: release.release,
      controls: {
        idempotentCheckIn: true,
        serverTime: true,
        versionCheckedResults: true,
        independentEvidence: true,
        auditableDisputes: true,
        widgetIsolation: true,
      },
      checkedAt: new Date().toISOString(),
    },
    { headers: { "cache-control": "no-store" } },
  );
}
