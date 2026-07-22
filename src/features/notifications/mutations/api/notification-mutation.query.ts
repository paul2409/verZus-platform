// VERZUS M12.9 PRODUCTION NOTIFICATION QUERY OPTIONS

import { queryOptions } from "@tanstack/react-query";

import { getNotificationUnreadCount } from "./notification-mutation.client";

export const notificationMutationKeys = {
  all: ["notifications", "mutations"] as const,
  unreadCount: () => [...notificationMutationKeys.all, "unread-count"] as const,
};

export function notificationUnreadCountQueryOptions() {
  return queryOptions({
    queryKey: notificationMutationKeys.unreadCount(),
    queryFn: ({ signal }) => getNotificationUnreadCount({ signal }),
    staleTime: 15_000,
    gcTime: 5 * 60_000,
    retry: 1,
    refetchOnWindowFocus: true,
  });
}
