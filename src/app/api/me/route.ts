import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { readSessionToken } from "@/features/auth/server/auth.http";
import { readAccountSession } from "@/features/auth/server/auth.service";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const data = await readAccountSession(readSessionToken(request));
  return NextResponse.json({ ok: true, data }, { status: 200 });
}
