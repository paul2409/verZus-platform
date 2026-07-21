// VERZUS M12.4 NOTIFICATION MUTATION QUERY OPTIONS

import { queryOptions } from "@tanstack/react-query";

import type { NotificationMutationScenario } from "../model/notification-mutation.types";
import { getNotificationUnreadCount } from "./notification-mutation.client";

export const notificationMutationKeys = {
  all: ["notifications", "mutations"] as const,
  unreadCount: (scenario: NotificationMutationScenario = "normal") =>
    [...notificationMutationKeys.all, "unread-count", scenario] as const,
};

export function notificationUnreadCountQueryOptions(
  scenario: NotificationMutationScenario = "normal",
) {
  return queryOptions({
    queryKey: notificationMutationKeys.unreadCount(scenario),
    queryFn: ({ signal }) => getNotificationUnreadCount({ scenario, signal }),
    staleTime: 15_000,
    gcTime: 5 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
