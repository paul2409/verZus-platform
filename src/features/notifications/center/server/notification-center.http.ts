import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getServerRuntimeSession } from "@/lib/session/runtime-session.server";
import {
  normalizeNotificationCategory,
  normalizeNotificationState,
  queryNotifications,
  serializeNotification,
} from "./notification-center.service";

function requestId(): string {
  return `notifications-${crypto.randomUUID()}`;
}

function errorResponse(input: {
  status: number;
  code: string;
  message: string;
  requestId: string;
  retryable?: boolean;
}) {
  return NextResponse.json(
    {
      error: {
        code: input.code,
        message: input.message,
        request_id: input.requestId,
        retryable: input.retryable ?? false,
      },
    },
    {
      status: input.status,
      headers: { "cache-control": "no-store", "x-request-id": input.requestId },
    },
  );
}

export async function handleNotificationCenterGet(request: NextRequest): Promise<NextResponse> {
  const id = requestId();
  const session = await getServerRuntimeSession();
  if (session.state !== "authenticated" || !session.user) {
    return errorResponse({
      status: 401,
      code: "NOTIFICATIONS_UNAUTHORIZED",
      message: "Sign in again to view notifications.",
      requestId: id,
    });
  }

  const state = normalizeNotificationState(request.nextUrl.searchParams.get("state"));
  const category = normalizeNotificationCategory(request.nextUrl.searchParams.get("category"));
  const rawPage = Number(request.nextUrl.searchParams.get("page") ?? "1");
  const rawPageSize = Number(request.nextUrl.searchParams.get("pageSize") ?? "6");
  const page = Number.isFinite(rawPage) ? Math.max(1, Math.trunc(rawPage)) : 1;
  const pageSize = Number.isFinite(rawPageSize)
    ? Math.min(12, Math.max(1, Math.trunc(rawPageSize)))
    : 6;

  try {
    const result = await queryNotifications({
      userId: session.user.id,
      state,
      category,
      page,
      pageSize,
    });

    return NextResponse.json(
      {
        data: { items: result.items.map(serializeNotification) },
        meta: {
          request_id: id,
          fetched_at: new Date().toISOString(),
          freshness: "fresh",
          page: result.page,
          page_size: pageSize,
          total: result.total,
          total_pages: result.totalPages,
          unread_count: result.unreadCount,
        },
      },
      { headers: { "cache-control": "private, no-store", "x-request-id": id } },
    );
  } catch {
    return errorResponse({
      status: 503,
      code: "NOTIFICATIONS_UNAVAILABLE",
      message: "Notifications are temporarily unavailable.",
      requestId: id,
      retryable: true,
    });
  }
}
