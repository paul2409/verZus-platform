// VERZUS M12.4 NOTIFICATION MUTATION ADAPTERS

import type { NotificationRecord } from "../../center/model/notification-center.types";
import type {
  NotificationMutationErrorShape,
  NotificationMutationResult,
  NotificationUnreadCount,
} from "../model/notification-mutation.types";
import {
  notificationMutationErrorSchema,
  notificationMutationResponseSchema,
  notificationUnreadCountResponseSchema,
} from "../schema/notification-mutation.schema";

export class NotificationMutationError extends Error {
  readonly code: string;
  readonly requestId: string;
  readonly retryable: boolean;
  readonly status: number | undefined;

  constructor(input: NotificationMutationErrorShape) {
    super(input.message);
    this.name = "NotificationMutationError";
    this.code = input.code;
    this.requestId = input.requestId;
    this.retryable = input.retryable;
    this.status = input.status;
  }
}

function adaptRecord(item: {
  id: string;
  title: string;
  description: string;
  category: NotificationRecord["category"];
  state: NotificationRecord["state"];
  priority: NotificationRecord["priority"];
  created_at: string;
  expires_at: string | null;
  href: string | null;
  action_label: string | null;
  source_label: string;
  reference: string;
}): NotificationRecord {
  return {
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
  };
}

export function adaptNotificationMutationPayload(payload: unknown): NotificationMutationResult {
  const parsed = notificationMutationResponseSchema.safeParse(payload);
  if (!parsed.success) {
    throw new NotificationMutationError({
      code: "NOTIFICATION_MUTATION_SCHEMA_INVALID",
      message: "The notification update returned data that could not be validated.",
      requestId: "notification-mutation-schema-invalid",
      retryable: true,
    });
  }

  return {
    item: parsed.data.data.item ? adaptRecord(parsed.data.data.item) : null,
    operation: parsed.data.data.operation,
    updatedCount: parsed.data.data.updated_count,
    unreadCount: parsed.data.data.unread_count,
    requestId: parsed.data.meta.request_id,
    idempotencyKey: parsed.data.meta.idempotency_key,
    replayed: parsed.data.data.replayed,
  };
}

export function adaptNotificationUnreadCount(payload: unknown): NotificationUnreadCount {
  const parsed = notificationUnreadCountResponseSchema.safeParse(payload);
  if (!parsed.success) {
    throw new NotificationMutationError({
      code: "NOTIFICATION_BADGE_SCHEMA_INVALID",
      message: "The notification badge returned data that could not be validated.",
      requestId: "notification-badge-schema-invalid",
      retryable: true,
    });
  }

  return {
    unreadCount: parsed.data.data.unread_count,
    requestId: parsed.data.meta.request_id,
    fetchedAt: parsed.data.meta.fetched_at,
  };
}

export function adaptNotificationMutationError(
  payload: unknown,
  status: number,
): NotificationMutationError {
  const parsed = notificationMutationErrorSchema.safeParse(payload);
  if (parsed.success) {
    return new NotificationMutationError({
      code: parsed.data.error.code,
      message: parsed.data.error.message,
      requestId: parsed.data.error.request_id,
      retryable: parsed.data.error.retryable,
      status,
    });
  }

  return new NotificationMutationError({
    code: "NOTIFICATION_MUTATION_FAILED",
    message: "The notification update could not be completed.",
    requestId: `notification-mutation-${status}`,
    retryable: status >= 500,
    status,
  });
}
