// VERZUS M12.6 NOTIFICATION RELIABILITY MAPPING

import { classifyResourceFailure } from "@/lib/reliability/resource-reliability";

import { NotificationCenterError } from "../center/adapter/notification-center.adapter";

export function describeNotificationFailure(error: Error | null) {
  const known = error instanceof NotificationCenterError ? error : null;
  return classifyResourceFailure({
    resourceLabel: "Notifications",
    code: known?.code,
    message: known?.message ?? error?.message,
    requestId: known?.requestId,
    retryable: known?.retryable,
    status: known?.status,
  });
}
