import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { applySessionCookie, readSessionToken } from "@/features/auth/server/auth.http";
import { refreshAccountSession } from "@/features/auth/server/auth.service";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const result = await refreshAccountSession(readSessionToken(request));
  const response = NextResponse.json(result.body, { status: result.status });
  applySessionCookie(response, result.sessionCookie);
  return response;
}
