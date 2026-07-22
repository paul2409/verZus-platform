// VERZUS M7.6 ABORT-SAFE RESULT, EVIDENCE AND DISPUTE CLIENTS

import type {
  MatchDisputeCommand,
  MatchDisputeMutationResult,
  MatchEvidenceUploadCommand,
  MatchEvidenceUploadResult,
  MatchResultCommand,
  MatchResultMutationResult,
} from "../model/match-result-operations.types";
import { MatchOperationsApiClientError } from "./match-operations-api.adapter";
import {
  adaptMatchDisputeMutation,
  adaptMatchEvidenceMutation,
  adaptMatchResultMutation,
} from "./match-result-api.adapter";

async function decode(response: Response, resource: string): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new MatchOperationsApiClientError({
      code: "invalid_response",
      message: `The match ${resource} endpoint returned an unreadable response.`,
      requestId: response.headers.get("x-request-id") ?? `match-${resource}-unreadable`,
      retryable: true,
    });
  }
}

function networkError(resource: string) {
  return new MatchOperationsApiClientError({
    code: "offline",
    message: `The match ${resource} operation could not reach the server.`,
    requestId: `match-${resource}-network`,
    retryable: true,
  });
}

export async function submitMatchResultOperation(
  input: MatchResultCommand & { signal?: AbortSignal },
): Promise<MatchResultMutationResult> {
  let response: Response;
  try {
    response = await fetch(`/api/matches/${encodeURIComponent(input.matchId)}/result`, {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": input.idempotencyKey,
      },
      body: JSON.stringify({
        action: input.action,
        expected_state: input.expectedState,
        expected_version: input.expectedVersion,
        score: input.score,
        ...(input.note ? { note: input.note } : {}),
      }),
      ...(input.signal ? { signal: input.signal } : {}),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw networkError("result");
  }

  return adaptMatchResultMutation(await decode(response, "result"));
}

export async function uploadMatchEvidence(
  input: MatchEvidenceUploadCommand & { signal?: AbortSignal },
): Promise<MatchEvidenceUploadResult> {
  const body = new FormData();
  body.set("expected_state", input.expectedState);
  body.set("expected_version", String(input.expectedVersion));
  body.set("file", input.file);

  let response: Response;
  try {
    response = await fetch(`/api/matches/${encodeURIComponent(input.matchId)}/evidence`, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Idempotency-Key": input.idempotencyKey },
      body,
      ...(input.signal ? { signal: input.signal } : {}),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw networkError("evidence");
  }

  return adaptMatchEvidenceMutation(await decode(response, "evidence"));
}

export async function createMatchDispute(
  input: MatchDisputeCommand & { signal?: AbortSignal },
): Promise<MatchDisputeMutationResult> {
  let response: Response;
  try {
    response = await fetch(`/api/matches/${encodeURIComponent(input.matchId)}/dispute`, {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": input.idempotencyKey,
      },
      body: JSON.stringify({
        expected_state: input.expectedState,
        expected_version: input.expectedVersion,
        reason: input.reason,
        summary: input.summary,
        claimed_score: input.claimedScore,
      }),
      ...(input.signal ? { signal: input.signal } : {}),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw networkError("dispute");
  }

  return adaptMatchDisputeMutation(await decode(response, "dispute"));
}
