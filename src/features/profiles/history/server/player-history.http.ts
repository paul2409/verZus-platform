import "server-only";

import { randomUUID } from "node:crypto";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getServerRuntimeSession } from "@/lib/session/runtime-session.server";

import type {
  PlayerHistoryGameFilter,
  PlayerHistoryResultFilter,
  PlayerStatisticsWindow,
} from "../model/player-history.types";
import { readPlayerMatchHistory, readPlayerStatistics } from "./player-history.service";

const games: readonly PlayerHistoryGameFilter[] = ["all", "EA FC 26", "Call of Duty", "NBA 2K26"];
const results: readonly PlayerHistoryResultFilter[] = ["all", "win", "loss", "draw"];
const windows: readonly PlayerStatisticsWindow[] = ["season", "30d", "7d"];

function game(value: string | null): PlayerHistoryGameFilter {
  return games.includes(value as PlayerHistoryGameFilter)
    ? (value as PlayerHistoryGameFilter)
    : "all";
}

function result(value: string | null): PlayerHistoryResultFilter {
  return results.includes(value as PlayerHistoryResultFilter)
    ? (value as PlayerHistoryResultFilter)
    : "all";
}

function windowValue(value: string | null): PlayerStatisticsWindow {
  return windows.includes(value as PlayerStatisticsWindow)
    ? (value as PlayerStatisticsWindow)
    : "season";
}

function page(value: string | null): number {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

async function userId(): Promise<string> {
  const session = await getServerRuntimeSession();
  if (session.state !== "authenticated" || !session.user) {
    throw Object.assign(new Error("Authentication is required to access player history."), {
      status: 401,
      code: "PLAYER_HISTORY_UNAUTHORIZED",
      retryable: false,
    });
  }
  return session.user.id;
}

function failure(requestId: string, error: unknown): NextResponse {
  const value = error as { status?: number; code?: string; message?: string; retryable?: boolean };
  return NextResponse.json(
    {
      code: value.code ?? "PLAYER_HISTORY_UNAVAILABLE",
      message: value.message ?? "Player history could not be loaded.",
      request_id: requestId,
      retryable: value.retryable ?? true,
    },
    {
      status: value.status ?? 500,
      headers: { "cache-control": "no-store", "x-request-id": requestId },
    },
  );
}

export async function handlePlayerMatchesGet(request: NextRequest): Promise<NextResponse> {
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  try {
    const data = await readPlayerMatchHistory({
      userId: await userId(),
      game: game(request.nextUrl.searchParams.get("game")),
      result: result(request.nextUrl.searchParams.get("result")),
      page: page(request.nextUrl.searchParams.get("page")),
      pageSize: 6,
    });
    return NextResponse.json(
      {
        ...data,
        request_id: requestId,
        fetched_at: new Date().toISOString(),
        freshness: "fresh",
      },
      { status: 200, headers: { "cache-control": "no-store", "x-request-id": requestId } },
    );
  } catch (error) {
    return failure(requestId, error);
  }
}

export async function handlePlayerStatisticsGet(request: NextRequest): Promise<NextResponse> {
  const requestId = request.headers.get("x-request-id") ?? randomUUID();
  try {
    const data = await readPlayerStatistics({
      userId: await userId(),
      game: game(request.nextUrl.searchParams.get("game")),
      window: windowValue(request.nextUrl.searchParams.get("window")),
    });
    return NextResponse.json(
      {
        ...data,
        request_id: requestId,
        fetched_at: new Date().toISOString(),
        freshness: "fresh",
      },
      { status: 200, headers: { "cache-control": "no-store", "x-request-id": requestId } },
    );
  } catch (error) {
    return failure(requestId, error);
  }
}
