// VERZUS M6.7 COMPETITION TELEMETRY

import {
  competitionTelemetryEventSchema,
  type CompetitionTelemetryEvent,
} from "./competition-telemetry.schema";

export type CompetitionTelemetryInput = Omit<CompetitionTelemetryEvent, "occurredAt"> & {
  occurredAt?: string;
};

export function trackCompetitionEvent(input: CompetitionTelemetryInput): void {
  const parsed = competitionTelemetryEventSchema.safeParse({
    ...input,
    occurredAt: input.occurredAt ?? new Date().toISOString(),
  });

  if (!parsed.success || typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent("verzus:competition-telemetry", {
      detail: parsed.data,
    }),
  );

  void fetch("/api/telemetry/competitions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(parsed.data),
    keepalive: true,
  }).catch(() => undefined);
}
