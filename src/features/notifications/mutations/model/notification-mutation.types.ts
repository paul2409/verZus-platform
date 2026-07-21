// VERZUS M12.6 RELIABILITY EDGE STATES
// VERZUS M12.4 NOTIFICATION MUTATION TYPES

import type {
  NotificationCategory,
  NotificationLifecycleState,
  NotificationRecord,
} from "../../center/model/notification-center.types";

export type NotificationMutationOperation = "read" | "actioned" | "dismissed";

export type NotificationMutationScenario =
  | "normal"
  | "slow"
  | "error"
  | "offline"
  | "malformed"
  | "unauthorized"
  | "forbidden"
  | "maintenance"
  | "conflict"
  | "not-found";

export type SingleNotificationMutationInput = {
  kind: "single";
  notificationId: string;
  operation: NotificationMutationOperation;
  expectedState: NotificationLifecycleState;
  idempotencyKey: string;
  scenario: NotificationMutationScenario;
};

export type ReadAllNotificationsMutationInput = {
  kind: "read-all";
  category: NotificationCategory | "all";
  idempotencyKey: string;
  scenario: NotificationMutationScenario;
};

export type NotificationMutationInput =
  | SingleNotificationMutationInput
  | ReadAllNotificationsMutationInput;

export type NotificationMutationResult = {
  item: NotificationRecord | null;
  operation: NotificationMutationOperation | "read_all";
  updatedCount: number;
  unreadCount: number;
  requestId: string;
  idempotencyKey: string;
  replayed: boolean;
};

export type NotificationUnreadCount = {
  unreadCount: number;
  requestId: string;
  fetchedAt: string;
};

export type NotificationMutationErrorShape = {
  code: string;
  message: string;
  requestId: string;
  retryable: boolean;
  status?: number;
};
