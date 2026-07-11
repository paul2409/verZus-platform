import { NextResponse } from "next/server";

import { release } from "@/lib/config/release";
import { serverEnv } from "@/lib/config/env.server";

export const dynamic = "force-dynamic";

export function GET() {
  const requiresInfrastructure = ["staging", "production"].includes(release.environment);
  const runtimeReady = requiresInfrastructure
    ? Boolean(serverEnv.databaseUrl && serverEnv.authSecret)
    : true;

  return NextResponse.json(
    {
      status: runtimeReady ? "ok" : "degraded",
      service: "verzus-platform",
      environment: release.environment,
      release: release.sha,
      timestamp: new Date().toISOString(),
    },
    {
      status: runtimeReady ? 200 : 503,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
