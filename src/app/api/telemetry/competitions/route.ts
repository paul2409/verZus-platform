// VERZUS M6.7 COMPETITION TELEMETRY ENDPOINT

import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import { competitionTelemetryEventSchema } from "@/features/competitions/telemetry";

const MAX_BODY_BYTES = 16_384;

function requestId(request: NextRequest): string {
  return request.headers.get("x-request-id") ?? `m6-${randomUUID()}`;
}

export async function POST(request: NextRequest) {
  const id = requestId(request);
  const contentLength = Number(request.headers.get("content-length") ?? "0");

  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { ok: false, error: { code: "payload_too_large", request_id: id } },
      { status: 413, headers: { "cache-control": "no-store", "x-request-id": id } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: "invalid_json", request_id: id } },
      { status: 400, headers: { "cache-control": "no-store", "x-request-id": id } },
    );
  }

  const parsed = competitionTelemetryEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: { code: "invalid_event", request_id: id } },
      { status: 400, headers: { "cache-control": "no-store", "x-request-id": id } },
    );
  }

  console.info(
    JSON.stringify({
      level: "info",
      domain: "competitions",
      request_id: id,
      ...parsed.data,
    }),
  );

  return NextResponse.json(
    { ok: true, request_id: id },
    { status: 202, headers: { "cache-control": "no-store", "x-request-id": id } },
  );
}
