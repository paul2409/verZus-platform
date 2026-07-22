import type { NextRequest } from "next/server";

import { handlePlayCurrentCheckIn } from "@/features/matches/operations/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

export function GET(request: NextRequest) {
  return handlePlayCurrentCheckIn(request);
}
