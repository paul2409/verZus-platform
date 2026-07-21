// VERZUS M12.3 NOTIFICATION CENTER QUERY OPTIONS

import { keepPreviousData, queryOptions } from "@tanstack/react-query";

import type {
  NotificationCategory,
  NotificationLifecycleState,
  NotificationScenario,
} from "../model/notification-center.types";
import { getNotificationCenter } from "./notification-center.client";

export const notificationCenterKeys = {
  all: ["notifications", "center"] as const,
  list: (input: {
    state: NotificationLifecycleState | "all";
    category: NotificationCategory | "all";
    page: number;
    pageSize: number;
    scenario: NotificationScenario;
  }) => [...notificationCenterKeys.all, input] as const,
};

export function notificationCenterQueryOptions(input: {
  state: NotificationLifecycleState | "all";
  category: NotificationCategory | "all";
  page: number;
  pageSize: number;
  scenario: NotificationScenario;
}) {
  return queryOptions({
    queryKey: notificationCenterKeys.list(input),
    queryFn: ({ signal }) => getNotificationCenter({ ...input, signal }),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
}
