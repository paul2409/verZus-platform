// VERZUS M11.8 PRIVACY-SAFE PROFILE TELEMETRY ENDPOINT

import { NextResponse } from "next/server";
import { z } from "zod";

const telemetrySchema = z
  .object({
    eventType: z.enum([
      "surface_loaded",
      "surface_failed",
      "resource_failed",
      "mutation_failed",
      "privacy_retry_requested",
    ]),
    surface: z.enum([
      "owner-profile",
      "public-profile",
      "profile-edit",
      "match-history",
      "identity-insights",
      "privacy-settings",
    ]),
    outcome: z.enum(["success", "error", "retrying", "disabled"]),
    requestId: z.string().trim().min(1).max(96).optional(),
    errorId: z.string().trim().min(1).max(96).optional(),
    resource: z
      .enum([
        "identity",
        "competitive-summary",
        "crew",
        "availability",
        "matches",
        "statistics",
        "achievements",
        "game-identities",
        "trust-history",
        "privacy",
        "account-state",
      ])
      .optional(),
  })
  .strict();

export async function POST(request: Request) {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();
  const payload = telemetrySchema.safeParse(await request.json().catch(() => null));

  if (!payload.success) {
    return NextResponse.json(
      {
        error: {
          code: "PROFILE_TELEMETRY_INVALID",
          message: "The profile telemetry event was rejected.",
          requestId,
          retryable: false,
        },
      },
      { status: 400, headers: { "x-request-id": requestId } },
    );
  }

  console.warn(
    JSON.stringify({
      level: "info",
      feature: "profiles",
      stage: "11.8",
      release: process.env.NEXT_PUBLIC_RELEASE_SHA ?? "local",
      requestId,
      ...payload.data,
    }),
  );

  return NextResponse.json(
    { accepted: true, requestId },
    { status: 202, headers: { "cache-control": "no-store", "x-request-id": requestId } },
  );
}
