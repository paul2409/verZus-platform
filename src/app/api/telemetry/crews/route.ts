// VERZUS M9.8 CREW TELEMETRY ENDPOINT

import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { crewTelemetrySchema } from "@/features/crews/telemetry";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request): Promise<NextResponse> {
  const requestId = randomUUID();

  try {
    const payload: unknown = await request.json();
    const parsed = crewTelemetrySchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        {
          code: "CREW_TELEMETRY_INVALID",
          message: "Crew telemetry payload was rejected.",
          requestId,
          retryable: false,
        },
        { status: 400 },
      );
    }

    console.warn("[verzus:crew-telemetry]", {
      ...parsed.data,
      requestId,
    });

    return NextResponse.json(
      { accepted: true, requestId },
      { status: 202, headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch {
    return NextResponse.json(
      {
        code: "CREW_TELEMETRY_UNREADABLE",
        message: "Crew telemetry payload could not be read.",
        requestId,
        retryable: false,
      },
      { status: 400 },
    );
  }
}
