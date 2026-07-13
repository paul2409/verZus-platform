// VERZUS M4 STEP 4.5

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  createMockSessionResponse,
  isMockAuthEnabled,
} from "@/features/auth/server/mock-auth.http";

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!isMockAuthEnabled()) {
    return NextResponse.json(
      {
        ok: true,
        data: {
          state: "anonymous",
          user: null,
          session: null,
          restrictionReason: null,
          requestId: `auth-${globalThis.crypto.randomUUID()}`,
        },
      },
      { status: 200 },
    );
  }

  return NextResponse.json(createMockSessionResponse(request), {
    status: 200,
  });
}
