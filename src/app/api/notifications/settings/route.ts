// VERZUS M12.7 INDEPENDENT NOTIFICATION SETTINGS ENDPOINT

import type { NextRequest } from "next/server";

import {
  handleNotificationSettingsGet,
  handleNotificationSettingsPatch,
} from "@/features/notifications/settings/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return handleNotificationSettingsGet(request);
}

export async function PATCH(request: NextRequest) {
  return handleNotificationSettingsPatch(request);
}
