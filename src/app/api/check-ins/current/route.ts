// VERZUS M5 STEPS 5.9-5.13

import type { NextRequest, NextResponse } from "next/server";

import { handleMockPlayCheckIn } from "@/features/play/server/mock-check-in.http";
import { handleMockPlayGet } from "@/features/play/server/mock-play.http";

export function GET(request: NextRequest): NextResponse {
  return handleMockPlayGet(request, "current-check-in");
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  return handleMockPlayCheckIn(request);
}
