// VERZUS M5 STEPS 5.9-5.13

import { playCheckInResultSchema, type PlayCheckInResult } from "../model/check-in.schema";
import { PlayApiClientError } from "./play-api.adapter";
import { playCheckInResponseSchema } from "./check-in-api.schema";

export function adaptPlayCheckInPayload(payload: unknown): PlayCheckInResult {
  const parsed = playCheckInResponseSchema.safeParse(payload);

  if (!parsed.success) {
    throw new PlayApiClientError({
      code: "invalid_response",
      message: "The Play check-in service returned an invalid response.",
      requestId: "play-client-invalid-check-in",
      retryable: true,
      fieldErrors: {},
    });
  }

  if (!parsed.data.ok) {
    throw new PlayApiClientError({
      code: parsed.data.error.code,
      message: parsed.data.error.message,
      requestId: parsed.data.error.request_id,
      retryable: parsed.data.error.retryable,
      fieldErrors: parsed.data.error.field_errors,
    });
  }

  const raw = parsed.data.data;

  return playCheckInResultSchema.parse({
    matchId: raw.match_id,
    state: raw.state,
    checkedInAt: raw.checked_in_at,
    idempotencyKey: raw.idempotency_key,
    duplicate: raw.duplicate,
    requestId: parsed.data.request_id,
  });
}
