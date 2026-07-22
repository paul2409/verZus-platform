import type { NextRequest } from "next/server";

import { handlePlayCurrentPosition } from "@/features/leaderboards/resources/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export function GET(request: NextRequest) {
  return handlePlayCurrentPosition(request);
}
