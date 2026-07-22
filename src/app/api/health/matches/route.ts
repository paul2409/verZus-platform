import { NextResponse } from "next/server";

import { queryDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  try {
    await queryDatabase("SELECT 1 FROM matches LIMIT 1");
    return NextResponse.json(
      {
        ok: true,
        feature: "match-operations",
        status: "ready",
        controls: {
          idempotentMutations: true,
          serverAuthoritativeTime: true,
          optimisticVersionChecks: true,
          auditableDisputes: true,
          evidenceUpload: false,
        },
        checkedAt: new Date().toISOString(),
      },
      { status: 200, headers: { "cache-control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      {
        ok: false,
        feature: "match-operations",
        status: "unavailable",
        checkedAt: new Date().toISOString(),
      },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }
}
