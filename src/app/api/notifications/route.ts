// VERZUS M12.3 NOTIFICATION CENTER ENDPOINT

import type { NextRequest } from "next/server";

import { handleNotificationCenterGet } from "@/features/notifications/center/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return handleNotificationCenterGet(request);
}
