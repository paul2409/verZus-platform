// VERZUS M12.6 RELIABILITY EDGE STATES
// VERZUS M12.3 NOTIFICATION CENTER TYPES

export type NotificationLifecycleState =
  | "unread"
  | "read"
  | "actioned"
  | "dismissed"
  | "expired";

export type NotificationCategory =
  | "match"
  | "crew"
  | "competition"
  | "reward"
  | "security"
  | "system";

export type NotificationPriority = "critical" | "high" | "normal" | "low";

export type NotificationScenario =
  | "normal"
  | "stale"
  | "empty"
  | "error"
  | "offline"
  | "slow"
  | "malformed"
  | "unauthorized"
  | "maintenance"
  | "forbidden"
  | "not-found";

export type NotificationRecord = {
  id: string;
  title: string;
  description: string;
  category: NotificationCategory;
  state: NotificationLifecycleState;
  priority: NotificationPriority;
  createdAt: string;
  expiresAt: string | null;
  href: string | null;
  actionLabel: string | null;
  sourceLabel: string;
  reference: string;
};

export type NotificationCenterMeta = {
  requestId: string;
  fetchedAt: string;
  freshness: "fresh" | "stale";
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  unreadCount: number;
};

export type NotificationCenterSnapshot = {
  items: NotificationRecord[];
  meta: NotificationCenterMeta;
};

export type NotificationCenterErrorShape = {
  code: string;
  message: string;
  requestId: string;
  retryable: boolean;
  status?: number;
};
