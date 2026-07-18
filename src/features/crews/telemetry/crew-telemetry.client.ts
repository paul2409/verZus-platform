"use client";

// VERZUS M9.8 CREW TELEMETRY CLIENT

import type { CrewTelemetryEvent } from "./crew-telemetry.schema";

export type RecordCrewTelemetryInput = Omit<
  CrewTelemetryEvent,
  "occurredAt" | "releaseSha" | "route"
> & {
  route?: string;
};

export function recordCrewTelemetry(input: RecordCrewTelemetryInput): void {
  if (typeof window === "undefined") return;

  const payload: CrewTelemetryEvent = {
    ...input,
    route: input.route ?? window.location.pathname,
    occurredAt: new Date().toISOString(),
    releaseSha: process.env.NEXT_PUBLIC_RELEASE_SHA ?? "development",
  };

  void fetch("/api/telemetry/crews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => undefined);
}
