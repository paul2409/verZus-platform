// VERZUS M10.7 REWARD TELEMETRY ENDPOINT

import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { rewardTelemetrySchema } from "@/features/rewards/telemetry";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request): Promise<NextResponse> {
  const requestId = randomUUID();

  try {
    const payload: unknown = await request.json();
    const parsed = rewardTelemetrySchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        {
          code: "REWARD_TELEMETRY_INVALID",
          message: "Reward telemetry payload was rejected.",
          requestId,
          retryable: false,
        },
        { status: 400, headers: { "Cache-Control": "no-store, max-age=0" } },
      );
    }

    console.warn("[verzus:reward-telemetry]", { ...parsed.data, requestId });

    return NextResponse.json(
      { accepted: true, requestId },
      { status: 202, headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch {
    return NextResponse.json(
      {
        code: "REWARD_TELEMETRY_UNREADABLE",
        message: "Reward telemetry payload could not be read.",
        requestId,
        retryable: false,
      },
      { status: 400, headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }
}
