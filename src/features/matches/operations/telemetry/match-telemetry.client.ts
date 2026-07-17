// VERZUS M7.8 MATCH OPERATIONS TELEMETRY CLIENT

import type { MatchTelemetryEvent } from "./match-telemetry.schema";

type MatchTelemetryInput = Omit<MatchTelemetryEvent, "occurredAt">;

export function trackMatchEvent(event: MatchTelemetryInput): void {
  if (typeof window === "undefined") return;

  const payload = JSON.stringify({ ...event, occurredAt: new Date().toISOString() });
  const endpoint = "/api/telemetry/matches";

  if (navigator.sendBeacon) {
    const accepted = navigator.sendBeacon(
      endpoint,
      new Blob([payload], { type: "application/json" }),
    );
    if (accepted) return;
  }

  void fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: payload,
    keepalive: true,
    credentials: "same-origin",
  }).catch(() => undefined);
}
