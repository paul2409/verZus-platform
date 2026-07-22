import { NextResponse } from "next/server";

import { getServerRuntimeSession } from "@/lib/session/runtime-session.server";
import { readPlayPlayerStatus } from "./play.repository";

function requestId(scope: string): string {
  return `play-${scope}-${crypto.randomUUID()}`;
}

function failure(input: {
  status: number;
  code: string;
  message: string;
  requestId: string;
  retryable?: boolean;
}) {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code: input.code,
        message: input.message,
        request_id: input.requestId,
        retryable: input.retryable ?? false,
        field_errors: {},
      },
    },
    {
      status: input.status,
      headers: { "cache-control": "no-store", "x-request-id": input.requestId },
    },
  );
}

async function authenticatedUserId(id: string) {
  const session = await getServerRuntimeSession();
  if (session.state !== "authenticated" || !session.user) {
    return {
      response: failure({
        status: 401,
        code: "unauthorized",
        message: "Sign in again to use Play.",
        requestId: id,
      }),
      userId: null,
    };
  }
  return { response: null, userId: session.user.id };
}

function trustTier(score: number) {
  if (score >= 90) return "elite" as const;
  if (score >= 70) return "verified" as const;
  if (score >= 40) return "developing" as const;
  return "restricted" as const;
}

export async function handlePlayPlayerStatusGet() {
  const id = requestId("player-status");
  const auth = await authenticatedUserId(id);
  if (auth.response || !auth.userId) return auth.response!;

  try {
    const player = await readPlayPlayerStatus(auth.userId);
    if (!player) {
      return failure({
        status: 404,
        code: "not_found",
        message: "Your player profile was not found.",
        requestId: id,
      });
    }

    return NextResponse.json(
      {
        ok: true,
        data: {
          player_id: player.player_id,
          handle: player.handle,
          display_name: player.display_name,
          avatar_url: player.avatar_url,
          primary_game: player.primary_game,
          game_lane: player.game_lane,
          location_label: player.location_label,
          trust_score: player.trust_score,
          trust_tier: trustTier(player.trust_score),
          week_label: "CURRENT WEEK",
          unread_notifications: player.unread_notifications,
          last_updated_at: player.last_updated_at.toISOString(),
        },
        request_id: id,
      },
      { headers: { "cache-control": "private, no-store", "x-request-id": id } },
    );
  } catch {
    return failure({
      status: 503,
      code: "service_unavailable",
      message: "Player status is temporarily unavailable.",
      requestId: id,
      retryable: true,
    });
  }
}
