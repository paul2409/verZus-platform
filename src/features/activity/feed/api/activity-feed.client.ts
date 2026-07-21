// VERZUS M12.5 PERSONALIZED ACTIVITY FEED CLIENT

import {
  adaptActivityFeedError,
  adaptActivityFeedPayload,
  ActivityFeedError,
} from "../adapter/activity-feed.adapter";
import type {
  ActivityFeedDomain,
  ActivityFeedPage,
  ActivityFeedScenario,
} from "../model/activity-feed.types";

export async function getActivityFeed(input: {
  domain: ActivityFeedDomain;
  cursor: string | null;
  pageSize: number;
  scenario: ActivityFeedScenario;
  signal?: AbortSignal;
}): Promise<ActivityFeedPage> {
  const params = new URLSearchParams({
    domain: input.domain,
    pageSize: String(input.pageSize),
  });
  if (input.cursor) params.set("cursor", input.cursor);
  if (input.scenario !== "normal") params.set("scenario", input.scenario);

  let response: Response;
  try {
    response = await fetch(`/api/activity?${params.toString()}`, {
      method: "GET",
      cache: "no-store",
      credentials: "same-origin",
      headers: { accept: "application/json" },
      ...(input.signal ? { signal: input.signal } : {}),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new ActivityFeedError({
      code: "ACTIVITY_OFFLINE",
      message: "Activity is unavailable while offline.",
      requestId: "activity-offline",
      retryable: true,
    });
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new ActivityFeedError({
      code: "ACTIVITY_INVALID_JSON",
      message: "Activity returned unreadable data.",
      requestId: response.headers.get("x-request-id") ?? "activity-invalid-json",
      retryable: true,
      status: response.status,
    });
  }

  if (!response.ok) throw adaptActivityFeedError(payload, response.status);
  return adaptActivityFeedPayload(payload);
}
