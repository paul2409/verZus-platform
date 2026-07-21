// VERZUS M12.3 NOTIFICATION CENTER ADAPTER

import {
  notificationCenterErrorSchema,
  notificationCenterResponseSchema,
} from "../schema/notification-center.schema";
import type {
  NotificationCenterErrorShape,
  NotificationCenterSnapshot,
} from "../model/notification-center.types";

export class NotificationCenterError extends Error {
  readonly code: string;
  readonly requestId: string;
  readonly retryable: boolean;
  readonly status: number | undefined;

  constructor(input: NotificationCenterErrorShape) {
    super(input.message);
    this.name = "NotificationCenterError";
    this.code = input.code;
    this.requestId = input.requestId;
    this.retryable = input.retryable;
    this.status = input.status;
  }
}

export function adaptNotificationCenterPayload(payload: unknown): NotificationCenterSnapshot {
  const parsed = notificationCenterResponseSchema.safeParse(payload);
  if (!parsed.success) {
    throw new NotificationCenterError({
      code: "NOTIFICATION_SCHEMA_INVALID",
      message: "Notifications returned data that could not be validated.",
      requestId: "notifications-schema-invalid",
      retryable: true,
    });
  }

  return {
    items: parsed.data.data.items.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.category,
      state: item.state,
      priority: item.priority,
      createdAt: item.created_at,
      expiresAt: item.expires_at,
      href: item.href,
      actionLabel: item.action_label,
      sourceLabel: item.source_label,
      reference: item.reference,
    })),
    meta: {
      requestId: parsed.data.meta.request_id,
      fetchedAt: parsed.data.meta.fetched_at,
      freshness: parsed.data.meta.freshness,
      page: parsed.data.meta.page,
      pageSize: parsed.data.meta.page_size,
      total: parsed.data.meta.total,
      totalPages: parsed.data.meta.total_pages,
      unreadCount: parsed.data.meta.unread_count,
    },
  };
}

export function adaptNotificationCenterError(payload: unknown, status: number): NotificationCenterError {
  const parsed = notificationCenterErrorSchema.safeParse(payload);
  if (parsed.success) {
    return new NotificationCenterError({
      code: parsed.data.error.code,
      message: parsed.data.error.message,
      requestId: parsed.data.error.request_id,
      retryable: parsed.data.error.retryable,
      status,
    });
  }

  return new NotificationCenterError({
    code: "NOTIFICATION_REQUEST_FAILED",
    message: "Notifications are temporarily unavailable.",
    requestId: "notifications-request-failed",
    retryable: status >= 500,
    status,
  });
}
