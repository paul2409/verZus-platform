// VERZUS M12.4 UNREAD NOTIFICATION COUNT ENDPOINT

import type { NextRequest } from "next/server";

import { handleNotificationUnreadCountGet } from "@/features/notifications/mutations/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return handleNotificationUnreadCountGet(request);
}
