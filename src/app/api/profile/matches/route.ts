// VERZUS M11.5 MATCH HISTORY RESOURCE
import type { NextRequest } from "next/server";
import { handlePlayerMatchesGet } from "@/features/profiles/history/server";
export const dynamic = "force-dynamic";
export function GET(request: NextRequest) {
  return handlePlayerMatchesGet(request);
}
