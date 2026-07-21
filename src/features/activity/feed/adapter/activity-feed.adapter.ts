// VERZUS M12.6 RELIABILITY EDGE STATES
// VERZUS M12.5 PERSONALIZED ACTIVITY FEED ADAPTER

import type {
  ActivityFeedErrorShape,
  ActivityFeedPage,
} from "../model/activity-feed.types";
import {
  activityFeedErrorSchema,
  activityFeedResponseSchema,
} from "../schema/activity-feed.schema";

export class ActivityFeedError extends Error {
  readonly code: string;
  readonly requestId: string;
  readonly retryable: boolean;
  readonly status: number | undefined;

  constructor(input: ActivityFeedErrorShape) {
    super(input.message);
    this.name = "ActivityFeedError";
    this.code = input.code;
    this.requestId = input.requestId;
    this.retryable = input.retryable;
    this.status = input.status;
  }
}

export function adaptActivityFeedPayload(payload: unknown): ActivityFeedPage {
  const parsed = activityFeedResponseSchema.safeParse(payload);
  if (!parsed.success) {
    throw new ActivityFeedError({
      code: "ACTIVITY_SCHEMA_INVALID",
      message: "Activity returned data that could not be validated.",
      requestId: "activity-schema-invalid",
      retryable: true,
    });
  }

  return {
    items: parsed.data.data.items.map((item) => ({
      id: item.id,
      domain: item.domain,
      verb: item.verb,
      title: item.title,
      description: item.description,
      actor: {
        id: item.actor.id,
        kind: item.actor.kind,
        name: item.actor.name,
        handle: item.actor.handle,
        initials: item.actor.initials,
        artworkUrl: item.actor.artwork_url,
        verified: item.actor.verified,
      },
      occurredAt: item.occurred_at,
      href: item.href,
      actionLabel: item.action_label,
      contextLabel: item.context_label,
      metric: item.metric,
      tone: item.tone,
      visibility: item.visibility,
      personalizationReason: item.personalization_reason,
    })),
    meta: {
      requestId: parsed.data.meta.request_id,
      fetchedAt: parsed.data.meta.fetched_at,
      freshness: parsed.data.meta.freshness,
      domain: parsed.data.meta.domain,
      pageSize: parsed.data.meta.page_size,
      nextCursor: parsed.data.meta.next_cursor,
      hasNextPage: parsed.data.meta.has_next_page,
      totalVisible: parsed.data.meta.total_visible,
      personalization: parsed.data.meta.personalization,
    },
  };
}

export function adaptActivityFeedError(payload: unknown, status: number): ActivityFeedError {
  const parsed = activityFeedErrorSchema.safeParse(payload);
  if (parsed.success) {
    return new ActivityFeedError({
      code: parsed.data.error.code,
      message: parsed.data.error.message,
      requestId: parsed.data.error.request_id,
      retryable: parsed.data.error.retryable,
      status,
    });
  }

  return new ActivityFeedError({
    code: "ACTIVITY_REQUEST_FAILED",
    message: "Activity is temporarily unavailable.",
    requestId: `activity-request-${status}`,
    retryable: status >= 500,
    status,
  });
}
