// VERZUS M12.6 RELIABILITY EDGE STATES
// VERZUS M12.3 NOTIFICATION CENTER HTTP HANDLER

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  normalizeNotificationCategory,
  normalizeNotificationScenario,
  normalizeNotificationState,
  queryNotifications,
  serializeNotification,
} from "./notification-center.service";

function requestId(): string {
  return `notifications-${crypto.randomUUID()}`;
}

export async function handleNotificationCenterGet(request: NextRequest): Promise<NextResponse> {
  const scenario = normalizeNotificationScenario(request.nextUrl.searchParams.get("scenario"));
  const state = normalizeNotificationState(request.nextUrl.searchParams.get("state"));
  const category = normalizeNotificationCategory(request.nextUrl.searchParams.get("category"));
  const rawPage = Number(request.nextUrl.searchParams.get("page") ?? "1");
  const rawPageSize = Number(request.nextUrl.searchParams.get("pageSize") ?? "6");
  const page = Number.isFinite(rawPage) ? Math.max(1, Math.trunc(rawPage)) : 1;
  const pageSize = Number.isFinite(rawPageSize) ? Math.min(12, Math.max(1, Math.trunc(rawPageSize))) : 6;
  const id = requestId();

  if (scenario === "slow") await new Promise((resolve) => setTimeout(resolve, 1_000));

  const failures = {
    error: [503, "NOTIFICATIONS_UNAVAILABLE", "Notifications are temporarily unavailable.", true],
    offline: [503, "NOTIFICATIONS_OFFLINE", "Notifications are unavailable while offline.", true],
    unauthorized: [401, "NOTIFICATIONS_UNAUTHORIZED", "Sign in again to view notifications.", false],
    forbidden: [403, "NOTIFICATIONS_FORBIDDEN", "You do not have permission to view these notifications.", false],
    "not-found": [404, "NOTIFICATIONS_NOT_FOUND", "The requested notification collection was not found.", false],
    maintenance: [503, "NOTIFICATIONS_MAINTENANCE", "Notifications are undergoing scheduled maintenance.", true],
  } as const;

  if (scenario in failures) {
    const [status, code, message, retryable] = failures[scenario as keyof typeof failures];
    return NextResponse.json(
      { error: { code, message, request_id: id, retryable } },
      { status, headers: { "cache-control": "no-store", "x-request-id": id } },
    );
  }

  if (scenario === "malformed") {
    return NextResponse.json(
      { data: { items: [{ invalid: true }] }, meta: { request_id: id } },
      { headers: { "cache-control": "no-store", "x-request-id": id } },
    );
  }

  const result = queryNotifications({ state, category, page, pageSize, scenario });
  return NextResponse.json(
    {
      data: { items: result.items.map(serializeNotification) },
      meta: {
        request_id: id,
        fetched_at: new Date().toISOString(),
        freshness: scenario === "stale" ? "stale" : "fresh",
        page: result.page,
        page_size: pageSize,
        total: result.total,
        total_pages: result.totalPages,
        unread_count: result.unreadCount,
      },
    },
    { headers: { "cache-control": "no-store", "x-request-id": id } },
  );
}
