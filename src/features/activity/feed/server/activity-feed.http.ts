import { NextResponse, type NextRequest } from "next/server";

import { getServerAuthSession } from "@/features/auth/server";
import {
  normalizeActivityDomain,
  normalizeActivityPageSize,
  queryActivityFeed,
  serializeActivityItem,
} from "./activity-feed.service";

function requestId(): string {
  return `activity-${crypto.randomUUID()}`;
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
      headers: { "cache-control": "no-store", "x-request-id": input.requestId },
    },
  );
}

export async function handleActivityFeedGet(request: NextRequest) {
  const id = requestId();
  const session = await getServerAuthSession();
  if (session.state !== "authenticated" || !session.user) {
    return errorResponse({
      status: 401,
      code: "ACTIVITY_UNAUTHORIZED",
      message: "Sign in again to view personalized activity.",
      retryable: false,
      requestId: id,
    });
  }

  const domain = normalizeActivityDomain(request.nextUrl.searchParams.get("domain"));
  const pageSize = normalizeActivityPageSize(request.nextUrl.searchParams.get("pageSize"));
  const cursor = request.nextUrl.searchParams.get("cursor");

  try {
    const result = await queryActivityFeed({
      userId: session.user.id,
      domain,
      cursor,
      pageSize,
    });
    if (!result.ok) {
      return errorResponse({ ...result, requestId: id });
    }

    return NextResponse.json(
      {
        data: { items: result.items.map(serializeActivityItem) },
        meta: {
          request_id: id,
          fetched_at: new Date().toISOString(),
          freshness: "fresh",
          domain,
          page_size: pageSize,
          next_cursor: result.nextCursor,
          has_next_page: result.hasNextPage,
          total_visible: result.totalVisible,
          personalization: "viewer",
        },
      },
      {
        headers: { "cache-control": "private, no-store", "x-request-id": id },
      },
    );
  } catch {
    return errorResponse({
      status: 503,
      code: "ACTIVITY_TEMPORARILY_UNAVAILABLE",
      message: "Activity is temporarily unavailable.",
      retryable: true,
      requestId: id,
    });
  }
}
