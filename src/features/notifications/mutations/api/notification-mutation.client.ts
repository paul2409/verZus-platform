// VERZUS M12.4 NOTIFICATION MUTATION CLIENT

import {
  adaptNotificationMutationError,
  adaptNotificationMutationPayload,
  adaptNotificationUnreadCount,
  NotificationMutationError,
} from "../adapter/notification-mutation.adapter";
import type {
  NotificationMutationInput,
  NotificationMutationResult,
  NotificationUnreadCount,
} from "../model/notification-mutation.types";

async function readPayload(response: Response, fallbackCode: string): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new NotificationMutationError({
      code: fallbackCode,
      message: "The notification service returned unreadable data.",
      requestId: response.headers.get("x-request-id") ?? fallbackCode.toLowerCase(),
      retryable: true,
      status: response.status,
    });
  }
}

export async function mutateNotification(
  input: NotificationMutationInput,
): Promise<NotificationMutationResult> {
  const endpoint =
    input.kind === "single"
      ? `/api/notifications/${encodeURIComponent(input.notificationId)}`
      : "/api/notifications/read-all";

  const body =
    input.kind === "single"
      ? {
          operation: input.operation,
          expected_state: input.expectedState,
          idempotency_key: input.idempotencyKey,
        }
      : {
          category: input.category,
          idempotency_key: input.idempotencyKey,
        };

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: input.kind === "single" ? "PATCH" : "POST",
      cache: "no-store",
      credentials: "same-origin",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "Idempotency-Key": input.idempotencyKey,
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new NotificationMutationError({
      code: "NOTIFICATION_MUTATION_OFFLINE",
      message: "The notification update is unavailable while offline.",
      requestId: "notification-mutation-offline",
      retryable: true,
    });
  }

  const payload = await readPayload(response, "NOTIFICATION_MUTATION_INVALID_JSON");
  if (!response.ok) throw adaptNotificationMutationError(payload, response.status);
  return adaptNotificationMutationPayload(payload);
}

export async function getNotificationUnreadCount(input?: {
  signal?: AbortSignal;
}): Promise<NotificationUnreadCount> {
  let response: Response;
  try {
    response = await fetch("/api/notifications/unread-count", {
      method: "GET",
      cache: "no-store",
      credentials: "same-origin",
      headers: { accept: "application/json" },
      ...(input?.signal ? { signal: input.signal } : {}),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new NotificationMutationError({
      code: "NOTIFICATION_BADGE_OFFLINE",
      message: "The unread notification count is unavailable while offline.",
      requestId: "notification-badge-offline",
      retryable: true,
    });
  }

  const payload = await readPayload(response, "NOTIFICATION_BADGE_INVALID_JSON");
  if (!response.ok) throw adaptNotificationMutationError(payload, response.status);
  return adaptNotificationUnreadCount(payload);
}
