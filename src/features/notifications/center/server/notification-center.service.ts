import type {
  NotificationCategory,
  NotificationLifecycleState,
  NotificationRecord,
} from "../model/notification-center.types";
import { listNotifications } from "../../server/notification.repository";

export function normalizeNotificationState(value: string | null): NotificationLifecycleState | "all" {
  const allowed: Array<NotificationLifecycleState | "all"> = [
    "all",
    "unread",
    "read",
    "actioned",
    "dismissed",
    "expired",
  ];
  return allowed.includes(value as NotificationLifecycleState | "all")
    ? (value as NotificationLifecycleState | "all")
    : "all";
}

export function normalizeNotificationCategory(value: string | null): NotificationCategory | "all" {
  const allowed: Array<NotificationCategory | "all"> = [
    "all",
    "match",
    "crew",
    "competition",
    "reward",
    "security",
    "system",
  ];
  return allowed.includes(value as NotificationCategory | "all")
    ? (value as NotificationCategory | "all")
    : "all";
}

export async function queryNotifications(input: {
  userId: string;
  state: NotificationLifecycleState | "all";
  category: NotificationCategory | "all";
  page: number;
  pageSize: number;
}) {
  return listNotifications(input);
}

export function serializeNotification(record: NotificationRecord) {
  return {
    id: record.id,
    title: record.title,
    description: record.description,
    category: record.category,
    state: record.state,
    priority: record.priority,
    created_at: record.createdAt,
    expires_at: record.expiresAt,
    href: record.href,
    action_label: record.actionLabel,
    source_label: record.sourceLabel,
    reference: record.reference,
  };
}
