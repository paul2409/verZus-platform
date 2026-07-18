// VERZUS M10.6 AUDITABLE REWARD HISTORY HTTP HANDLER

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { serializeRewardHistoryAuditPage } from "./reward-history-audit.service";

function parsePositiveInt(value: string | null, fallback: number, maximum: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, maximum);
}

export function handleRewardHistoryAuditGet(request: NextRequest): NextResponse {
  const requestId = `reward-history-audit-${crypto.randomUUID()}`;
  const page = parsePositiveInt(request.nextUrl.searchParams.get("page"), 1, 100);
  const pageSize = parsePositiveInt(request.nextUrl.searchParams.get("pageSize"), 4, 20);

  return NextResponse.json(
    {
      data: serializeRewardHistoryAuditPage({ page, pageSize }),
      meta: { request_id: requestId, fetched_at: new Date().toISOString() },
    },
    { headers: { "cache-control": "no-store", "x-request-id": requestId } },
  );
}
