import { NextResponse } from "next/server";

import { getServerRuntimeSession } from "@/lib/session/runtime-session.server";

import { readActionCentreSources } from "./action-centre.repository";
import { buildActionCentreSnapshot } from "./action-centre.service";

function requestId(): string {
  return `actions-${crypto.randomUUID()}`;
}

export async function handleActionCentreGet(): Promise<NextResponse> {
  const id = requestId();
  const session = await getServerRuntimeSession();

  if (session.state !== "authenticated" || !session.user) {
    return NextResponse.json(
      {
        error: {
          code: "ACTION_CENTRE_UNAUTHORIZED",
          message: "Sign in again to review your action centre.",
          request_id: id,
          retryable: false,
        },
      },
      { status: 401, headers: { "cache-control": "no-store", "x-request-id": id } },
    );
  }

  try {
    const snapshot = buildActionCentreSnapshot(
      await readActionCentreSources(session.user.id),
      session.user.id,
    );

    return NextResponse.json(
      {
        data: {
          items: snapshot.items.map((action) => ({
            id: action.id,
            kind: action.kind,
            label: action.label,
            detail: action.detail,
            reason: action.reason,
            href: action.href,
            action_label: action.actionLabel,
            priority: action.priority,
            tone: action.tone,
            score: action.score,
            deadline_at: action.deadlineAt,
            source_type: action.sourceType,
            source_id: action.sourceId,
          })),
        },
        meta: {
          request_id: id,
          fetched_at: snapshot.generatedAt,
          total: snapshot.total,
          critical_count: snapshot.criticalCount,
          high_count: snapshot.highCount,
        },
      },
      { headers: { "cache-control": "private, no-store", "x-request-id": id } },
    );
  } catch (error) {
    console.error("Action centre read failed", error);
    return NextResponse.json(
      {
        error: {
          code: "ACTION_CENTRE_UNAVAILABLE",
          message: "Your priority actions are temporarily unavailable.",
          request_id: id,
          retryable: true,
        },
      },
      { status: 503, headers: { "cache-control": "no-store", "x-request-id": id } },
    );
  }
}
