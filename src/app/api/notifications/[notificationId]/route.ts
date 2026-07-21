// VERZUS M12.4 SINGLE NOTIFICATION MUTATION ENDPOINT

import type { NextRequest } from "next/server";

import { handleSingleNotificationMutation } from "@/features/notifications/mutations/server";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ notificationId: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { notificationId } = await context.params;
  return handleSingleNotificationMutation(request, notificationId);
}
