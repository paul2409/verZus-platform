// VERZUS M7.8 MATCH OPERATIONS TELEMETRY ENDPOINT

import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { matchTelemetryEventSchema } from "@/features/matches/operations/telemetry";

const MAX_BODY_BYTES = 16_384;

function getRequestId(request: NextRequest): string {
  return request.headers.get("x-request-id") ?? `m7-${randomUUID()}`;
}

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request);
  const contentLength = Number(request.headers.get("content-length") ?? "0");

  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { ok: false, error: { code: "payload_too_large", requestId } },
      { status: 413, headers: { "cache-control": "no-store", "x-request-id": requestId } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: "invalid_json", requestId } },
      { status: 400, headers: { "cache-control": "no-store", "x-request-id": requestId } },
    );
  }

  const parsed = matchTelemetryEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: { code: "invalid_event", requestId } },
      { status: 400, headers: { "cache-control": "no-store", "x-request-id": requestId } },
    );
  }

  console.warn(
    JSON.stringify({
      level: "info",
      domain: "match-operations",
      requestId,
      ...parsed.data,
    }),
  );

  return NextResponse.json(
    { ok: true, requestId },
    { status: 202, headers: { "cache-control": "no-store", "x-request-id": requestId } },
  );
}
