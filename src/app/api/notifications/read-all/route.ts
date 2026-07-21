// VERZUS M12.4 READ-ALL NOTIFICATION MUTATION ENDPOINT

import type { NextRequest } from "next/server";

import { handleReadAllNotificationsMutation } from "@/features/notifications/mutations/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  return handleReadAllNotificationsMutation(request);
}
