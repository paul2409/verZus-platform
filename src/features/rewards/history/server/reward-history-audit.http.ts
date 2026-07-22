import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getServerAuthSession } from "@/features/auth/server/auth-session.server";

import { serializeRewardHistoryAuditPage } from "./reward-history-audit.service";

function parsePositiveInt(value: string | null, fallback: number, maximum: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, maximum);
}

export async function handleRewardHistoryAuditGet(request: NextRequest): Promise<NextResponse> {
  const requestId = `reward-history-audit-${crypto.randomUUID()}`;
  const session = await getServerAuthSession();
  if (session.state !== "authenticated" || !session.user) {
    return NextResponse.json(
      {
        error: {
          code: "REWARD_HISTORY_UNAUTHORIZED",
          message: "Authentication is required to view reward history.",
          request_id: requestId,
          retryable: false,
        },
      },
      { status: 401, headers: { "cache-control": "no-store", "x-request-id": requestId } },
    );
  }

  const page = parsePositiveInt(request.nextUrl.searchParams.get("page"), 1, 100);
  const pageSize = parsePositiveInt(request.nextUrl.searchParams.get("pageSize"), 4, 20);
  const data = await serializeRewardHistoryAuditPage(session.user.id, { page, pageSize });

  return NextResponse.json(
    { data, meta: { request_id: requestId, fetched_at: new Date().toISOString() } },
    { headers: { "cache-control": "no-store", "x-request-id": requestId } },
  );
}
