// VERZUS M7.5 ABORT-SAFE LOBBY MUTATION CLIENT

import type { MatchLobbyCommand, MatchLobbyResult } from "../model/match-lobby-operations.types";
import { MatchOperationsApiClientError } from "./match-operations-api.adapter";
import { adaptMatchLobbyMutation } from "./match-lobby-api.adapter";

export type SubmitMatchLobbyInput = MatchLobbyCommand & {
  signal?: AbortSignal;
};

export async function submitMatchLobbyOperation({
  matchId,
  seedState,
  expectedState,
  expectedVersion,
  idempotencyKey,
  action,
  issue,
  signal,
}: SubmitMatchLobbyInput): Promise<MatchLobbyResult> {
  let response: Response;
  try {
    const query = new URLSearchParams({ state: seedState });
    response = await fetch(`/api/matches/${encodeURIComponent(matchId)}/lobby?${query}`, {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({
        action,
        expected_state: expectedState,
        expected_version: expectedVersion,
        ...(issue ? { issue } : {}),
      }),
      ...(signal ? { signal } : {}),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new MatchOperationsApiClientError({
      code: "offline",
      message: "Lobby operations could not reach the server.",
      requestId: "match-lobby-network",
      retryable: true,
    });
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new MatchOperationsApiClientError({
      code: "invalid_response",
      message: "Lobby operations returned an unreadable response.",
      requestId: response.headers.get("x-request-id") ?? "match-lobby-unreadable",
      retryable: true,
    });
  }

  return adaptMatchLobbyMutation(payload);
}
