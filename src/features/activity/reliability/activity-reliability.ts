// VERZUS M12.6 ACTIVITY RELIABILITY MAPPING

import { classifyResourceFailure } from "@/lib/reliability/resource-reliability";

import { ActivityFeedError } from "../feed/adapter/activity-feed.adapter";

export function describeActivityFailure(error: Error) {
  const known = error instanceof ActivityFeedError ? error : null;
  return classifyResourceFailure({
    resourceLabel: "Activity Feed",
    code: known?.code,
    message: known?.message ?? error.message,
    requestId: known?.requestId,
    retryable: known?.retryable,
    status: known?.status,
  });
}
