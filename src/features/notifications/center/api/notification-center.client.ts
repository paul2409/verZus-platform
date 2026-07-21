// VERZUS M12.3 NOTIFICATION CENTER CLIENT

import {
  adaptNotificationCenterError,
  adaptNotificationCenterPayload,
  NotificationCenterError,
} from "../adapter/notification-center.adapter";
import type {
  NotificationCategory,
  NotificationCenterSnapshot,
  NotificationLifecycleState,
  NotificationScenario,
} from "../model/notification-center.types";

export async function getNotificationCenter(input: {
  state: NotificationLifecycleState | "all";
  category: NotificationCategory | "all";
  page: number;
  pageSize: number;
  scenario: NotificationScenario;
  signal?: AbortSignal;
}): Promise<NotificationCenterSnapshot> {
  const params = new URLSearchParams({
    state: input.state,
    category: input.category,
    page: String(input.page),
    pageSize: String(input.pageSize),
  });
  if (input.scenario !== "normal") params.set("scenario", input.scenario);

  let response: Response;
  try {
    response = await fetch(`/api/notifications?${params.toString()}`, {
      method: "GET",
      cache: "no-store",
      credentials: "same-origin",
      headers: { accept: "application/json" },
      ...(input.signal ? { signal: input.signal } : {}),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new NotificationCenterError({
      code: "NOTIFICATIONS_OFFLINE",
      message: "Notifications are unavailable while offline.",
      requestId: "notifications-offline",
      retryable: true,
    });
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new NotificationCenterError({
      code: "NOTIFICATIONS_INVALID_JSON",
      message: "Notifications returned unreadable data.",
      requestId: response.headers.get("x-request-id") ?? "notifications-invalid-json",
      retryable: true,
      status: response.status,
    });
  }

  if (!response.ok) throw adaptNotificationCenterError(payload, response.status);
  return adaptNotificationCenterPayload(payload);
}
