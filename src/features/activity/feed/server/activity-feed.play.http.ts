import { NextResponse } from "next/server";

import { getServerRuntimeSession } from "@/lib/session/runtime-session.server";
import { readViewerActivity } from "./activity-feed.repository";

function requestId(): string {
  return `play-recent-activity-${crypto.randomUUID()}`;
}

export async function handlePlayRecentActivityGet() {
  const id = requestId();
  const session = await getServerRuntimeSession();
  if (session.state !== "authenticated" || !session.user) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "unauthorized",
          message: "Sign in again to view recent activity.",
          request_id: id,
          retryable: false,
          field_errors: {},
        },
      },
      { status: 401, headers: { "cache-control": "no-store", "x-request-id": id } },
    );
  }

  try {
    const activity = await readViewerActivity({ userId: session.user.id, domain: "all" });
    const items = activity
      .filter((item) => item.domain !== "profile")
      .slice(0, 6)
      .map((item) => ({
        activity_id: item.id,
        type:
          item.domain === "matches"
            ? item.verb === "match_win"
              ? "match_win"
              : "match_loss"
            : item.domain === "rankings"
              ? "rank_change"
              : item.domain === "rewards"
                ? "points_awarded"
                : item.domain === "crews"
                  ? "crew_update"
                  : "competition_entry",
        title: item.title,
        detail: item.description,
        occurred_at: item.occurredAt,
        points_delta: null,
        href: item.href,
      }));

    return NextResponse.json(
      { ok: true, data: items, request_id: id },
      { headers: { "cache-control": "private, no-store", "x-request-id": id } },
    );
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "upstream_unavailable",
          message: "Recent activity is temporarily unavailable.",
          request_id: id,
          retryable: true,
          field_errors: {},
        },
      },
      { status: 503, headers: { "cache-control": "no-store", "x-request-id": id } },
    );
  }
}
