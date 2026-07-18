"use client";

// VERZUS M10.7 BEST-EFFORT REWARD TELEMETRY CLIENT

import type { RewardTelemetryEvent } from "./reward-telemetry.schema";

export type RecordRewardTelemetryInput = Omit<
  RewardTelemetryEvent,
  "occurredAt" | "releaseSha" | "route"
> & {
  route?: string;
};

export function recordRewardTelemetry(input: RecordRewardTelemetryInput): void {
  if (typeof window === "undefined") return;

  const payload: RewardTelemetryEvent = {
    ...input,
    route: input.route ?? window.location.pathname,
    occurredAt: new Date().toISOString(),
    releaseSha: process.env.NEXT_PUBLIC_RELEASE_SHA ?? "development",
  };

  void fetch("/api/telemetry/rewards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => undefined);
}
