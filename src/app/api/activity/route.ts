// VERZUS M12.5 ACTIVITY FEED API ROUTE

import type { NextRequest } from "next/server";

import { handleActivityFeedGet } from "@/features/activity/feed/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return handleActivityFeedGet(request);
}
