// VERZUS M5 STEPS 5.1-5.4

import type { NextRequest, NextResponse } from "next/server";

import { handleMockPlayGet } from "@/features/play/server/mock-play.http";

export function GET(request: NextRequest): NextResponse {
  return handleMockPlayGet(request, "recommended-competitions");
}
