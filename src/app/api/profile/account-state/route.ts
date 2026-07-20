// VERZUS M11.7 PROFILE ACCOUNT-STATE API ROUTE

import type { NextRequest } from "next/server";

import { handleProfileAccountStateGet } from "@/features/profiles/account-state/server";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  return handleProfileAccountStateGet(request);
}
