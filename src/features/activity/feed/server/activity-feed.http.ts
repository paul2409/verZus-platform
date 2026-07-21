// VERZUS M12.6 RELIABILITY EDGE STATES
// VERZUS M12.5 PERSONALIZED ACTIVITY FEED HTTP HANDLER

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  normalizeActivityDomain,
  normalizeActivityPageSize,
  normalizeActivityScenario,
  queryActivityFeed,
  serializeActivityItem,
} from "./activity-feed.service";

function requestId(): string {
  return `activity-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function errorResponse(input: {
  status: number;
  code: string;
  message: string;
  retryable: boolean;
  requestId: string;
}) {
  return NextResponse.json(
    {
      error: {
        code: input.code,
        message: input.message,
        request_id: input.requestId,
        retryable: input.retryable,
      },
    },
    {
      status: input.status,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "x-request-id": input.requestId,
      },
    },
  );
}

export async function handleActivityFeedGet(request: NextRequest) {
  const id = requestId();
  const domain = normalizeActivityDomain(request.nextUrl.searchParams.get("domain"));
  const scenario = normalizeActivityScenario(request.nextUrl.searchParams.get("scenario"));
  const pageSize = normalizeActivityPageSize(request.nextUrl.searchParams.get("pageSize"));
  const cursor = request.nextUrl.searchParams.get("cursor");

  if (scenario === "slow") await new Promise((resolve) => setTimeout(resolve, 900));
  const edgeFailures = {
    unauthorized: [401, "ACTIVITY_UNAUTHORIZED", "Sign in again to view personalized activity.", false],
    forbidden: [403, "ACTIVITY_FORBIDDEN", "You do not have permission to view this activity feed.", false],
    "not-found": [404, "ACTIVITY_NOT_FOUND", "The requested activity stream was not found.", false],
    maintenance: [503, "ACTIVITY_MAINTENANCE", "Activity is undergoing scheduled maintenance.", true],
  } as const;

  if (scenario in edgeFailures) {
    const [status, code, message, retryable] = edgeFailures[scenario as keyof typeof edgeFailures];
    return errorResponse({ status, code, message, retryable, requestId: id });
  }
  if (scenario === "partial" && cursor) {
    return errorResponse({
      status: 503,
      code: "ACTIVITY_PARTIAL_PAGE_FAILURE",
      message: "Older activity could not load. Confirmed pages remain visible.",
      retryable: true,
      requestId: id,
    });
  }

  if (scenario === "error") {
    return errorResponse({
      status: 503,
      code: "ACTIVITY_TEMPORARILY_UNAVAILABLE",
      message: "The activity feed is temporarily unavailable.",
      retryable: true,
      requestId: id,
    });
  }
  if (scenario === "offline") {
    return errorResponse({
      status: 503,
      code: "ACTIVITY_OFFLINE",
      message: "Activity cannot refresh while the service is offline.",
      retryable: true,
      requestId: id,
    });
  }
  if (scenario === "malformed") {
    return NextResponse.json(
      { data: { items: [{ broken: true }] }, meta: { request_id: id } },
      { status: 200, headers: { "x-request-id": id, "Cache-Control": "no-store" } },
    );
  }

  const result = queryActivityFeed({ domain, cursor, pageSize, scenario });
  if (!result.ok) {
    return errorResponse({
      status: result.status,
      code: result.code,
      message: result.message,
      retryable: result.retryable,
      requestId: id,
    });
  }

  return NextResponse.json(
    {
      data: {
        items: result.items.map(serializeActivityItem),
      },
      meta: {
        request_id: id,
        fetched_at: new Date().toISOString(),
        freshness: scenario === "stale" ? "stale" : "fresh",
        domain,
        page_size: pageSize,
        next_cursor: result.nextCursor,
        has_next_page: result.hasNextPage,
        total_visible: result.totalVisible,
        personalization: "viewer",
      },
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
        "x-request-id": id,
      },
    },
  );
}
