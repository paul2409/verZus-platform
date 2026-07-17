// VERZUS M7.4 ABORT-SAFE CHECK-IN MUTATION CLIENT

import type { MatchCheckInCommand, MatchCheckInResult } from "../model/match-check-in.types";
import { MatchOperationsApiClientError } from "./match-operations-api.adapter";
import { adaptMatchCheckInMutation } from "./match-check-in-api.adapter";

export type SubmitMatchCheckInInput = MatchCheckInCommand & {
  signal?: AbortSignal;
};

export async function submitMatchCheckIn({
  matchId,
  seedState,
  expectedState,
  expectedVersion,
  idempotencyKey,
  signal,
}: SubmitMatchCheckInInput): Promise<MatchCheckInResult> {
  let response: Response;
  try {
    const query = new URLSearchParams({ state: seedState });
    response = await fetch(`/api/matches/${encodeURIComponent(matchId)}/check-in?${query}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({
        expected_state: expectedState,
        expected_version: expectedVersion,
      }),
      signal: signal ?? null,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new MatchOperationsApiClientError({
      code: "offline",
      message: "Check-in could not reach the server.",
      requestId: "match-check-in-network",
      retryable: true,
    });
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new MatchOperationsApiClientError({
      code: "invalid_response",
      message: "Check-in returned an unreadable response.",
      requestId: response.headers.get("x-request-id") ?? "match-check-in-unreadable",
      retryable: true,
    });
  }

  return adaptMatchCheckInMutation(payload);
}
