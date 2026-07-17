"use client";

// VERZUS M8.10 LEADERBOARD TELEMETRY CLIENT

import type { LeaderboardIntelKind } from "../interactions/model/leaderboard-interaction.types";
import type { LeaderboardTelemetryEvent } from "./leaderboard-telemetry.schema";

export type RecordLeaderboardTelemetryInput = Omit<
  LeaderboardTelemetryEvent,
  "occurredAt" | "releaseSha" | "route"
> & {
  route?: string;
};

export function recordLeaderboardTelemetry(input: RecordLeaderboardTelemetryInput): void {
  if (typeof window === "undefined") return;

  const payload: LeaderboardTelemetryEvent = {
    ...input,
    route: input.route ?? window.location.pathname,
    occurredAt: new Date().toISOString(),
    releaseSha: process.env.NEXT_PUBLIC_RELEASE_SHA ?? "development",
  };

  void fetch("/api/telemetry/leaderboards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => undefined);
}

export function recordLeaderboardIntelTelemetry(
  eventName: RecordLeaderboardTelemetryInput["eventName"],
  entityKind: LeaderboardIntelKind,
  entityId: string,
  options: {
    scenario?: RecordLeaderboardTelemetryInput["scenario"];
    requestId?: string | null;
  } = {},
): void {
  recordLeaderboardTelemetry({
    eventName,
    entityKind,
    entityId,
    scenario: options.scenario ?? "normal",
    requestId: options.requestId ?? null,
  });
}
