import { randomUUID } from "node:crypto";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getServerAuthSession } from "@/features/auth/server/auth-session.server";
import { queryDatabase } from "@/lib/db";

interface TrustRow {
  trust_score: string | number;
}

function pageNumber(value: string | null): number {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function statusLabel(score: number): string {
  if (score <= 0) return "Not rated";
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 50) return "Developing";
  return "Needs attention";
}

export async function GET(request: NextRequest) {
  const requestId = `profile-trust-history-${randomUUID()}`;
  const session = await getServerAuthSession();
  if (session.state !== "authenticated" || !session.user) {
    return NextResponse.json(
      {
        error: {
          code: "PROFILE_TRUST_HISTORY_UNAUTHORIZED",
          message: "Authentication is required to view trust history.",
          request_id: requestId,
          retryable: false,
        },
      },
      { status: 401, headers: { "cache-control": "no-store", "x-request-id": requestId } },
    );
  }

  const result = await queryDatabase<TrustRow>(
    `SELECT COALESCE(summary.trust_score, 0) AS trust_score
       FROM player_profiles AS profile
       LEFT JOIN player_competitive_summaries AS summary ON summary.user_id = profile.user_id
      WHERE profile.user_id = $1`,
    [session.user.id],
  );
  const score = Number(result.rows[0]?.trust_score ?? 0);
  const page = pageNumber(request.nextUrl.searchParams.get("page"));

  return NextResponse.json(
    {
      data: {
        score,
        status_label: statusLabel(score),
        trend: 0,
        categories:
          score > 0
            ? [
                {
                  id: "overall",
                  label: "Overall trust",
                  score,
                  detail: "Calculated only from confirmed production activity.",
                },
              ]
            : [],
        entries: [],
        page,
        page_size: 4,
        total_entries: 0,
        total_pages: 0,
        freshness: "fresh",
      },
      meta: { request_id: requestId, generated_at: new Date().toISOString() },
    },
    { headers: { "cache-control": "no-store", "x-request-id": requestId } },
  );
}
