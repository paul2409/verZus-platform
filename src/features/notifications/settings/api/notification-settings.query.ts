// VERZUS M12.7 INDEPENDENT NOTIFICATION SETTINGS QUERY

import { queryOptions } from "@tanstack/react-query";

import type { NotificationSettingsScenario } from "../model/notification-settings.types";
import { getNotificationSettings } from "./notification-settings.client";

export const notificationSettingsKeys = {
  all: ["notifications", "settings"] as const,
  detail: (scenario: NotificationSettingsScenario = "normal") =>
    [...notificationSettingsKeys.all, scenario] as const,
};

export function notificationSettingsQueryOptions(
  scenario: NotificationSettingsScenario = "normal",
) {
  return queryOptions({
    queryKey: notificationSettingsKeys.detail(scenario),
    queryFn: ({ signal }) => getNotificationSettings({ scenario, signal }),
    staleTime: 30_000,
    gcTime: 10 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
