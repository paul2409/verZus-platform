// VERZUS M8.10 LEADERBOARD TELEMETRY INGESTION

import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { leaderboardTelemetrySchema } from "@/features/leaderboards/telemetry";

export async function POST(request: Request): Promise<NextResponse> {
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  const payload = await request.json().catch(() => null);
  const parsed = leaderboardTelemetrySchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        code: "LEADERBOARD_TELEMETRY_INVALID",
        message: "Telemetry payload was rejected.",
        requestId,
        retryable: false,
      },
      { status: 400, headers: { "X-Request-ID": requestId } },
    );
  }

  // eslint-disable-next-line no-console -- structured local telemetry sink until an external collector is configured
  console.info(
    JSON.stringify({
      type: "leaderboard_intel_event",
      ingestRequestId: requestId,
      ...parsed.data,
    }),
  );

  return NextResponse.json(
    { accepted: true, requestId },
    { status: 202, headers: { "Cache-Control": "no-store", "X-Request-ID": requestId } },
  );
}
