// VERZUS M4 STEP 4.5

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  applyMockMutationSession,
  isMockAuthEnabled,
  mockAuthDisabledResponse,
} from "@/features/auth/server/mock-auth.http";
import { MOCK_SESSION_COOKIE, mockRefreshSession } from "@/features/auth/server/mock-auth.service";

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!isMockAuthEnabled()) {
    return mockAuthDisabledResponse();
  }

  const cookieValue = request.cookies.get(MOCK_SESSION_COOKIE)?.value ?? null;
  const result = mockRefreshSession(cookieValue);
  const response = NextResponse.json(result.body, {
    status: result.status,
  });

  applyMockMutationSession(response, result);
  return response;
}
