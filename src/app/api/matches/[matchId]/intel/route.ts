import { randomUUID } from "node:crypto";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getServerAuthSession } from "@/features/auth/server/auth-session.server";
import {
  buildClock,
  ProductionMatchError,
  readMatchResource,
  resolveMatchState,
} from "@/features/matches/operations/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

function errorResponse(requestId: string, error: unknown): NextResponse {
  const value =
    error instanceof ProductionMatchError
      ? error
      : new ProductionMatchError({
          status: 500,
          code: "match_intel_internal_error",
          message: "Match intel could not be loaded.",
          retryable: true,
        });

  return NextResponse.json(
    {
      error: {
        code: value.code,
        message: value.message,
        request_id: requestId,
        retryable: value.retryable,
      },
    },
    {
      status: value.status,
      headers: { "Cache-Control": "no-store", "X-Request-ID": requestId },
    },
  );
}

function timeLabel(value: Date): string {
  return value.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ matchId: string }> },
): Promise<NextResponse> {
  const requestId = request.headers.get("x-request-id") ?? randomUUID();

  try {
    const session = await getServerAuthSession();
    if (session.state !== "authenticated" || !session.user) {
      throw new ProductionMatchError({
        status: 401,
        code: "unauthorized",
        message: "Authentication is required.",
      });
    }

    const { matchId } = await context.params;
    const resource = await readMatchResource({
      matchId,
      userId: session.user.id,
      role: session.user.role,
      resource: "summary",
    });
    const matchContext = resource.context;
    const home = matchContext.participants.find((participant) => participant.side === "home");
    const away = matchContext.participants.find((participant) => participant.side === "away");
    if (!home || !away) {
      throw new ProductionMatchError({
        status: 409,
        code: "match_participants_incomplete",
        message: "The match does not yet have both participants.",
      });
    }

    const state = resolveMatchState(matchContext);
    const clock = buildClock(matchContext);
    const result = matchContext.result;
    const score = result ? `${result.home_score} - ${result.away_score}` : "Pending";
    const statusLabel = state
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
    const checkInAvailable = state === "check-in-open" && !matchContext.currentParticipant?.checked_in_at;

    return NextResponse.json(
      {
        data: {
          id: matchContext.match.id,
          week_label: matchContext.match.competition_name ?? "Scheduled match",
          status_label: statusLabel,
          countdown_label: result ? score : timeLabel(matchContext.match.match_starts_at),
          starts_at_label: result ? "Final score" : "Starts UTC",
          game_label: matchContext.match.game_name,
          format_label: `${matchContext.match.format_label} · ${matchContext.match.round_label}`,
          home: {
            name: home.display_name,
            tag: home.handle,
            side_label: "Home",
            emblem_src: home.avatar_url ?? "/intel-cards/player-placeholder.svg",
          },
          away: {
            name: away.display_name,
            tag: away.handle,
            side_label: "Away",
            emblem_src: away.avatar_url ?? "/intel-cards/player-placeholder.svg",
          },
          prize_pool_label: "See competition",
          stakes_label: "Verified ranking",
          check_in_closes_label: timeLabel(matchContext.match.check_in_closes_at),
          score_label: score,
          competition_label: matchContext.match.competition_name ?? "Scheduled match",
          round_label: matchContext.match.round_label,
          result_confirmation_label:
            result?.status === "confirmed"
              ? "Confirmed"
              : result?.status === "conflict"
                ? "Conflict detected"
                : result
                  ? "Awaiting opponent"
                  : "Pending",
          dispute_label: matchContext.dispute ? "Under review" : "No dispute",
          match_href: `/matches/${encodeURIComponent(matchContext.match.id)}`,
          check_in_href: checkInAvailable
            ? `/matches/${encodeURIComponent(matchContext.match.id)}#check-in`
            : null,
        },
        meta: {
          request_id: requestId,
          fetched_at: new Date().toISOString(),
          freshness: "fresh",
          source: "match-api",
          server_now: clock.serverNow,
        },
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store", "X-Request-ID": requestId },
      },
    );
  } catch (error) {
    return errorResponse(requestId, error);
  }
}
