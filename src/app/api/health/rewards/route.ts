// VERZUS M10.8 REWARD DOMAIN RELEASE HEALTH ENDPOINT

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      feature: "rewards",
      stage: "10.8",
      status: "ok",
      environment: process.env.NEXT_PUBLIC_APP_ENV ?? "local",
      releaseSha: process.env.NEXT_PUBLIC_RELEASE_SHA ?? "development",
      capabilities: {
        progress: "ready",
        season: "ready",
        inventory: "ready",
        history: "ready",
        achievements: "ready",
        idempotentClaiming: "ready",
        widgetIsolation: "ready",
        telemetry: "ready",
        featureIsolation: "ready",
        immutablePackaging: "ready",
      },
      checkedAt: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
