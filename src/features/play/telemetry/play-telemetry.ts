// VERZUS M5 STEPS 5.9-5.13

export type PlayTelemetryEvent =
  | "play.screen.viewed"
  | "play.widget.unavailable"
  | "play.widget.retry"
  | "play.check_in.started"
  | "play.check_in.succeeded"
  | "play.check_in.failed";

export interface PlayTelemetryPayload {
  route?: string | undefined;
  scenario?: string | undefined;
  widget?: string | undefined;
  requestId?: string | null | undefined;
  errorCode?: string | null | undefined;
  retryable?: boolean | undefined;
  matchId?: string | undefined;
  duplicate?: boolean | undefined;
}

export function recordPlayTelemetry(
  event: PlayTelemetryEvent,
  payload: PlayTelemetryPayload = {},
): void {
  const entry = {
    event,
    timestamp: new Date().toISOString(),
    release: process.env.NEXT_PUBLIC_RELEASE_SHA ?? "local",
    environment: process.env.NEXT_PUBLIC_APP_ENV ?? "local",
    ...payload,
  };

  console.warn(`[VERZUS_TELEMETRY] ${JSON.stringify(entry)}`);
}
